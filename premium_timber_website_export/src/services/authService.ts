import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AdminRole, UserSession, ROLE_PERMISSIONS } from '../types/auth';

// Helper cookie utility for client-side use
export const cookieUtils = {
  set(name: string, value: string, days?: number) {
    if (typeof document === 'undefined') return;
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureString = isHttps ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secureString}`;
  },
  
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },
  
  remove(name: string) {
    if (typeof document === 'undefined') return;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureString = isHttps ? '; Secure' : '';
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax${secureString}`;
  }
};

// Seed credentials for Mock mode
const MOCK_ACCOUNTS: Record<string, { fullName: string; role: AdminRole; avatarUrl: string; passwordHash: string }> = {
  'ryzulahamed@gmail.com': {
    fullName: 'Jezzy Admin',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    passwordHash: 'tajrajamd@23',
  },
  'manager@timber.com': {
    fullName: 'Sundar Pillai',
    role: 'manager',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    passwordHash: 'manager123',
  },
  'staff@timber.com': {
    fullName: 'Ananth Kumar',
    role: 'staff',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    passwordHash: 'staff123',
  }
};

export const authService = {
  /**
   * Log in an administrator using email & password
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<UserSession> {
    const cleanEmail = email.trim().toLowerCase();
    console.log('[Auth] Attempting login:', { email: cleanEmail, password: password });

    // 1. Supabase Mode (if user is registered in Supabase Auth)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          const { data: profile } = await supabase
            .from('admin_users')
            .select('full_name, role_id, avatar_url, is_active, roles(name)')
            .eq('id', data.user.id)
            .single();

          if (profile && profile.is_active) {
            const roleName = ((profile.roles as any)?.name || 'staff') as AdminRole;
            const session: UserSession = {
              id: data.user.id,
              email: cleanEmail,
              fullName: profile.full_name,
              role: roleName,
              avatarUrl: profile.avatar_url,
              permissions: ROLE_PERMISSIONS[roleName],
              token: data.session?.access_token || '',
            };

            cookieUtils.set('timber_admin_session', JSON.stringify(session), rememberMe ? 30 : undefined);
            return session;
          }
        }
      } catch (err) {
        console.warn('Supabase auth fallback:', err);
      }
    }

    // 2. Built-in Master Admin Accounts & Local Password Fallback
    const mockUser = MOCK_ACCOUNTS[cleanEmail];
    if (!mockUser) {
      throw new Error('Invalid email or password.');
    }

    let expectedPassword = mockUser.passwordHash;
    if (typeof window !== 'undefined') {
      const customPass = localStorage.getItem(`timber_custom_password_${cleanEmail}`);
      if (customPass) {
        expectedPassword = customPass;
      }
    }

    if (expectedPassword !== password) {
      throw new Error('Invalid email or password.');
    }

    const session: UserSession = {
      id: `mock-uuid-${cleanEmail}`,
      email: cleanEmail,
      fullName: mockUser.fullName,
      role: mockUser.role,
      avatarUrl: mockUser.avatarUrl,
      permissions: ROLE_PERMISSIONS[mockUser.role],
      token: `mock-jwt-token-for-${cleanEmail}-${Date.now()}`,
    };

    // Store in cookie for route middleware check
    cookieUtils.set('timber_admin_session', JSON.stringify(session), rememberMe ? 30 : undefined);
    
    // Store locally to persist across refresh
    localStorage.setItem('timber_admin_user_session', JSON.stringify(session));

    return session;
  },

  /**
   * Log out active session
   */
  async logout(): Promise<void> {
    cookieUtils.remove('timber_admin_session');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('timber_admin_user_session');
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },

  /**
   * Fetch current session profile (supports cache verification)
   */
  async getSession(): Promise<UserSession | null> {
    // Check Client Cookie
    const sessionCookie = cookieUtils.get('timber_admin_session');
    if (!sessionCookie) {
      // If cookie was deleted/expired, clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('timber_admin_user_session');
      }
      return null;
    }

    try {
      const parsedSession: UserSession = JSON.parse(sessionCookie);
      
      // Verify with Supabase if online and active
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== parsedSession.id) {
          // Token mismatch or expired
          await this.logout();
          return null;
        }
      }
      
      return parsedSession;
    } catch {
      await this.logout();
      return null;
    }
  },

  /**
   * Triggers a password reset request (Email link)
   */
  async resetPassword(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password-callback`,
      });
      if (error) throw new Error(error.message);
      return true;
    }

    // Mock Mode success validation
    if (MOCK_ACCOUNTS[cleanEmail]) {
      return true;
    }
    throw new Error('Email address not registered in our administrative roster.');
  },

  /**
   * Update active user password
   */
  async updatePassword(password: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      return true;
    }

    // Mock Mode fallback
    const sessionCookie = cookieUtils.get('timber_admin_session');
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed.email) {
          localStorage.setItem(`timber_custom_password_${parsed.email.toLowerCase()}`, password);
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    // Default fallback
    localStorage.setItem(`timber_custom_password_ryzulahamed@gmail.com`, password);
    return true;
  }
};
