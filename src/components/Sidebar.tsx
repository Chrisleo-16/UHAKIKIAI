import { Shield, LayoutDashboard, Scan, FolderOpen, Settings, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/uhakiki-logo.svg';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
  badge?: number;
  adminOnly?: boolean;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Scan, label: 'Live Scan', id: 'scan', badge: 3 },
  { icon: FolderOpen, label: 'Case Files', id: 'cases' },
  { icon: Crown, label: 'Admin Panel', id: 'admin', adminOnly: true },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
    };

    checkAdminRole();
  }, [user?.id]);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30 overflow-hidden">
            <img src={logo} alt="UhakikiAI" className="w-8 h-8 object-contain" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg text-foreground tracking-tight">UhakikiAI</span>
              <span className="text-xs text-muted-foreground">Identity Verification</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'nav-item-active text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary'} ${item.adminOnly ? 'text-warning' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-mono">
                        {item.badge}
                      </span>
                    )}
                    {item.adminOnly && (
                      <span className="ml-auto bg-warning/20 text-warning text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase">
                        Admin
                      </span>
                    )}
                  </>
                )}
              </motion.button>
            );
          })}
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
