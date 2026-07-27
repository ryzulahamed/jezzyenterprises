export type AdminRole = 'super_admin' | 'manager' | 'staff';

export type AdminPermission =
  | 'full_access'
  | 'manage_inventory'
  | 'manage_inquiries'
  | 'approve_reservations'
  | 'view_inventory'
  | 'add_containers'
  | 'update_stock';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  avatarUrl?: string;
  permissions: AdminPermission[];
  token: string;
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: ['full_access'],
  manager: [
    'view_inventory',
    'add_containers',
    'update_stock',
    'manage_inventory',
    'manage_inquiries',
    'approve_reservations',
  ],
  staff: [
    'view_inventory',
    'add_containers',
    'update_stock',
  ],
};

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  if (role === 'super_admin') return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}
