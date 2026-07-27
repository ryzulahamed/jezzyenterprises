'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserSession, AdminPermission } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasAccess: (permission: AdminPermission) => boolean;
  toast: { message: string; type: 'success' | 'error' | null; show: (msg: string, t: 'success' | 'error') => void; hide: () => void };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auto logout duration (e.g., 15 minutes of total inactivity)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Custom Toast State for feedback (matches premium UX requirement)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity timeout logic
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Brand title tracking ref
  const lastBrandRef = useRef<string>('Jezzy Enterprises');

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      hideToast();
    }, 4000);
  };

  const hideToast = () => {
    setToastMsg(null);
    setToastType(null);
  };

  // Reset inactivity timer on user interactions
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    // Only arm inactivity timers if user is authenticated
    if (user) {
      inactivityTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  const handleAutoLogout = async () => {
    showToast('Session expired due to inactivity. Logging out...', 'error');
    await logout();
  };

  // Sync session on mount and route change
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        setUser(session);
        
        // If not logged in and accessing admin pages, redirect
        if (!session && pathname.startsWith('/admin') && pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Session sync error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [pathname]);

  // Set up listener for inactivity timer
  useEffect(() => {
    if (!user) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    
    // Initial arm
    resetInactivityTimer();

    const handler = () => resetInactivityTimer();
    events.forEach((ev) => window.addEventListener(ev, handler));

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, handler));
    };
  }, [user]);

  // Liquid Glow Mouse Tracker (Apple iOS style cursor highlights)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const targets = document.querySelectorAll('.liquid-glow');
      targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (target as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (target as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  // Synchronize document title with the saved brand name from settings
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncTitleAndBranding = () => {
      const savedSettings = localStorage.getItem('timber_system_settings');
      let brand = 'Jezzy Enterprises';
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.brandName) {
            brand = parsed.brandName;
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      const currentTitle = document.title;
      const lastBrand = lastBrandRef.current;
      
      if (currentTitle.includes(lastBrand)) {
        document.title = currentTitle.replace(lastBrand, brand);
      } else if (!currentTitle.includes(brand)) {
        document.title = `${brand} — ${currentTitle}`;
      }
      lastBrandRef.current = brand;
    };

    // Initial sync
    syncTitleAndBranding();

    // Listen for updates from settings saves or other tabs
    window.addEventListener('storage', syncTitleAndBranding);
    
    return () => {
      window.removeEventListener('storage', syncTitleAndBranding);
    };
  }, [pathname]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const session = await authService.login(email, password, rememberMe);
      setUser(session);
      showToast('Logged in successfully. Welcome back!', 'success');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/dashboard';
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      showToast('Logged out of session securely.', 'success');
      router.push('/admin/login');
    } catch (err: any) {
      showToast(err.message || 'Logout failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      showToast('Password reset link sent to your email.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to request password reset.', 'error');
      throw err;
    }
  };

  const hasAccess = (permission: AdminPermission): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (permission === 'full_access') return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        resetPassword,
        hasAccess,
        toast: { message: toastMsg || '', type: toastType, show: showToast, hide: hideToast }
      }}
    >
      {children}

      {/* Global Toast Notification System */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all duration-300 backdrop-blur-md ${
            toastType === 'success' 
              ? 'bg-zinc-900/90 text-amber-500 border-amber-500/20 dark:bg-stone-900/95 dark:text-amber-400' 
              : 'bg-red-950/90 text-red-200 border-red-800/30'
          }`}>
            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
            <span>{toastMsg}</span>
            <button 
              onClick={hideToast}
              className="ml-3 hover:opacity-75 transition-opacity text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
