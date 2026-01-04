import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Crown,
  UserCog,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Officer {
  id: string;
  user_id: string;
  full_name: string | null;
  badge_number: string | null;
  department: string | null;
  rank: string | null;
  created_at: string;
  role: 'admin' | 'officer';
}

interface SystemStats {
  totalVerifications: number;
  totalOfficers: number;
  fraudsDetected: number;
  verifiedDocuments: number;
  averageRiskScore: number;
  todayVerifications: number;
}

export function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalVerifications: 0,
    totalOfficers: 0,
    fraudsDetected: 0,
    verifiedDocuments: 0,
    averageRiskScore: 0,
    todayVerifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficers();
    fetchSystemStats();
  }, []);

  const fetchOfficers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const officersWithRoles = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role || 'officer') as 'admin' | 'officer',
        };
      });

      setOfficers(officersWithRoles);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch officers',
        variant: 'destructive',
      });
    }
  };

  const fetchSystemStats = async () => {
    try {
      setLoading(true);

      // Fetch all verifications
      const { data: verifications, error } = await supabase
        .from('verifications')
        .select('*');

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayVerifications = verifications?.filter(
        (v) => new Date(v.created_at) >= today
      ).length || 0;

      const fraudsDetected = verifications?.filter(
        (v) => v.verdict === 'FRAUDULENT' || v.verdict === 'SUSPICIOUS'
      ).length || 0;

      const verifiedDocuments = verifications?.filter(
        (v) => v.verdict === 'VERIFIED'
      ).length || 0;

      const avgRisk = verifications?.length
        ? Math.round(
            verifications.reduce((acc, v) => acc + (v.risk_score || 0), 0) /
              verifications.length
          )
        : 0;

      // Get officer count
      const { count: officerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalVerifications: verifications?.length || 0,
        totalOfficers: officerCount || 0,
        fraudsDetected,
        verifiedDocuments,
        averageRiskScore: avgRisk,
        todayVerifications,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'officer') => {
    if (userId === user?.id) {
      toast({
        title: 'Action Denied',
        description: 'You cannot change your own role',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(userId);
    try {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      // Update local state
      setOfficers((prev) =>
        prev.map((o) => (o.user_id === userId ? { ...o, role: newRole } : o))
      );

      toast({
        title: 'Role Updated',
        description: `Officer role changed to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const statCards = [
    {
      title: 'Total Verifications',
      value: stats.totalVerifications,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Officers',
      value: stats.totalOfficers,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      title: 'Frauds Detected',
      value: stats.fraudsDetected,
      icon: AlertTriangle,
      color: 'text-danger',
      bgColor: 'bg-danger/10',
    },
    {
      title: 'Verified Documents',
      value: stats.verifiedDocuments,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Today\'s Scans',
      value: stats.todayVerifications,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Avg Risk Score',
      value: `${stats.averageRiskScore}%`,
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Crown className="w-8 h-8 text-warning" />
              Admin Control Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage officers, roles, and monitor system-wide statistics
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              fetchOfficers();
              fetchSystemStats();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {loading ? '...' : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Officers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-primary" />
                Officer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Officer</TableHead>
                    <TableHead className="text-muted-foreground">Badge #</TableHead>
                    <TableHead className="text-muted-foreground">Department</TableHead>
                    <TableHead className="text-muted-foreground">Rank</TableHead>
                    <TableHead className="text-muted-foreground">Joined</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.map((officer) => (
                    <TableRow key={officer.id} className="border-border/30 hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary text-sm font-bold">
                              {officer.full_name?.charAt(0) || 'O'}
                            </span>
                          </div>
                          {officer.full_name || 'Unknown Officer'}
                          {officer.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs ml-2">You</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {officer.badge_number || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {officer.department || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {officer.rank || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(officer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={officer.role}
                          onValueChange={(value: 'admin' | 'officer') =>
                            handleRoleChange(officer.user_id, value)
                          }
                          disabled={updating === officer.user_id || officer.user_id === user?.id}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs bg-background/50 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <span className="flex items-center gap-2">
                                <Crown className="w-3 h-3 text-warning" />
                                Admin
                              </span>
                            </SelectItem>
                            <SelectItem value="officer">
                              <span className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-primary" />
                                Officer
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {officers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No officers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
