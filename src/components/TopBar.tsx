import { Bell, Shield, User, Wifi, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-card/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-6"
    >
      {/* Left Section - Breadcrumb */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Forensic Scanner</h1>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground text-sm">Document Analysis</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* System Status */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <div className="relative">
            <Wifi className="w-4 h-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-medium text-primary">ONLINE - SECURE</span>
        </div>

        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </motion.button>

        {/* Officer Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-foreground">
                  {profile?.full_name || 'Officer'}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 
                  {isAdmin ? 'Admin Access' : 'Officer Access'}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
              {profile?.badge_number || 'No badge assigned'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
