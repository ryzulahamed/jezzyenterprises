'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Database, 
  PlusCircle, 
  MessageSquare, 
  CalendarDays, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';

interface SidebarContentProps {
  collapsed: boolean;
  pathname: string;
  menuItems: Array<{ name: string; href: string; icon: React.ReactNode }>;
  user: any;
  logout: () => void;
  loading: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ collapsed, pathname, menuItems, user, logout, loading, isMobile = false, onNavigate }: SidebarContentProps) {
  const showLabels = !collapsed || isMobile;

  return (
    <div className="h-full flex flex-col justify-between p-5 liquid-glass select-none text-stone-850 dark:text-zinc-100 rounded-3xl">
      
      <div className="space-y-6">
        {/* Logo / Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/50 dark:border-zinc-900/60">
          <div className="flex items-center gap-2.5">
            {showLabels && (
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider font-display uppercase text-emerald-600 dark:text-emerald-400">JEZZY ENTERPRISES</span>
                <span className="text-[8px] text-stone-400 dark:text-zinc-500 tracking-widest uppercase -mt-0.5">ADMIN SHELL</span>
              </div>
            )}
          </div>
        </div>
 
        {/* Navigation items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all spatial-card liquid-glow tactile-bounce ${
                  isActive 
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/10' 
                    : 'text-stone-550 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-900/60 hover:text-stone-900 dark:hover:text-zinc-100'
                }`}
                title={!showLabels ? item.name : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {showLabels && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
 
      {/* User profile HUD & Logout */}
      <div className="space-y-4 pt-4 border-t border-stone-200/50 dark:border-zinc-900/60">
        
        {/* User preview */}
        {user && showLabels && (
          <div className="flex flex-col p-2.5 rounded-xl bg-stone-200/40 dark:bg-zinc-900/40 min-w-0">
            <span className="text-xs font-semibold truncate">{user.fullName}</span>
            <span className="text-[9px] text-stone-500 dark:text-zinc-500 truncate uppercase font-bold mt-0.5">{user.role.replace('_', ' ')}</span>
          </div>
        )}
 
        {/* Logout */}
        <button
          onClick={logout}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all cursor-pointer tactile-bounce"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          {showLabels && <span>Log Out</span>}
        </button>
      </div>
 
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  
  // Collapse states
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
 
  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
 
  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { name: 'Inventory', href: '/admin/inventory', icon: <Database className="h-4.5 w-4.5" /> },
    { name: 'Add Container', href: '/admin/inventory/add', icon: <PlusCircle className="h-4.5 w-4.5" /> },
    { name: 'Inquiries', href: '/admin/inquiries', icon: <MessageSquare className="h-4.5 w-4.5" /> },
    { name: 'Reservations', href: '/admin/reservations', icon: <CalendarDays className="h-4.5 w-4.5" /> },
    { name: 'Customers CRM', href: '/admin/customers', icon: <Users className="h-4.5 w-4.5" /> },
    { name: 'Public Gallery', href: '/admin/gallery', icon: <ImageIcon className="h-4.5 w-4.5" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ];
 
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 flex relative">
      

 
      {/* Desktop Sidebar (Left side) */}
      <motion.aside
        animate={{ width: collapsed ? 104 : 272 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:block flex-shrink-0 z-30 h-screen sticky top-0 p-4"
      >
        <SidebarContent 
          collapsed={collapsed}
          pathname={pathname}
          menuItems={menuItems}
          user={user}
          logout={logout}
          loading={loading}
        />
        
        {/* Collapse toggle arrow button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-0 h-6 w-6 rounded-full bg-stone-200 text-stone-700 hover:text-stone-950 border border-stone-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center cursor-pointer shadow-md z-40"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </motion.aside>
 
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-zinc-950 border-b border-zinc-900 text-white flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-500">JEZZY ENTERPRISES ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
 
      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden fixed inset-y-0 left-0 w-64 z-50 pt-14 shadow-2xl"
          >
            <div className="h-full bg-zinc-950 border-r border-zinc-900">
              <SidebarContent 
                collapsed={false}
                pathname={pathname}
                menuItems={menuItems}
                user={user}
                logout={logout}
                loading={loading}
                isMobile={true}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            {/* Overlay background close trigger */}
            <div 
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-xs"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Administrative content view panel */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pt-16 md:pt-0 overflow-y-auto">
        <div className="flex-1">
          {children}
        </div>
      </div>

    </div>
  );
}
