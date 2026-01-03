import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig 
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, Shield, AlertTriangle, 
  FileCheck, Activity, Target, Loader2 
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface Verification {
  id: string;
  verdict: string;
  risk_score: number;
  fraud_type: string | null;
  created_at: string;
}

const trendChartConfig = {
  verified: { label: "Verified", color: "hsl(160, 100%, 50%)" },
  rejected: { label: "Rejected", color: "hsl(0, 84%, 60%)" },
  pending: { label: "Pending", color: "hsl(45, 100%, 51%)" },
} satisfies ChartConfig;

const activityChartConfig = {
  scans: { label: "Scans", color: "hsl(160, 100%, 50%)" },
} satisfies ChartConfig;

const riskChartConfig = {
  count: { label: "Cases" },
} satisfies ChartConfig;

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  loading?: boolean;
}

function StatCard({ title, value, change, icon, trend, loading }: StatCardProps) {
  return (
    <Card className="glass-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
            ) : (
              <>
                <h3 className="text-3xl font-bold text-foreground mt-1">{value}</h3>
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  trend === 'up' ? 'text-primary' : 'text-destructive'
                }`}>
                  {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(change).toFixed(1)}% vs last month</span>
                </div>
              </>
            )}
          </div>
          <div className="p-4 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['verifications-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select('id, verdict, risk_score, fraud_type, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Verification[];
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = verifications.length;
    const verified = verifications.filter(v => v.verdict === 'verified').length;
    const fraudCount = verifications.filter(v => v.verdict === 'rejected').length;
    const successRate = total > 0 ? (verified / total) * 100 : 0;

    // Calculate month-over-month change
    const now = new Date();
    const thisMonth = verifications.filter(v => {
      const date = new Date(v.created_at);
      return date >= startOfMonth(now) && date <= endOfMonth(now);
    });
    const lastMonth = verifications.filter(v => {
      const date = new Date(v.created_at);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      return date >= lastMonthStart && date <= lastMonthEnd;
    });

    const totalChange = lastMonth.length > 0 
      ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 
      : 0;
    
    const thisMonthFraud = thisMonth.filter(v => v.verdict === 'rejected').length;
    const lastMonthFraud = lastMonth.filter(v => v.verdict === 'rejected').length;
    const fraudChange = lastMonthFraud > 0 
      ? ((thisMonthFraud - lastMonthFraud) / lastMonthFraud) * 100 
      : 0;

    return {
      total,
      fraudCount,
      successRate,
      totalChange,
      fraudChange,
    };
  }, [verifications]);

  // Monthly trend data
  const trendData = useMemo(() => {
    const months: { [key: string]: { verified: number; rejected: number; pending: number } } = {};
    
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const key = format(month, 'MMM');
      months[key] = { verified: 0, rejected: 0, pending: 0 };
    }

    verifications.forEach(v => {
      const month = format(new Date(v.created_at), 'MMM');
      if (months[month]) {
        if (v.verdict === 'verified') months[month].verified++;
        else if (v.verdict === 'rejected') months[month].rejected++;
        else months[month].pending++;
      }
    });

    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [verifications]);

  // Fraud types distribution
  const fraudData = useMemo(() => {
    const types: { [key: string]: number } = {};
    
    verifications.forEach(v => {
      if (v.fraud_type) {
        types[v.fraud_type] = (types[v.fraud_type] || 0) + 1;
      }
    });

    const colors = [
      'hsl(0, 84%, 60%)',
      'hsl(45, 100%, 51%)',
      'hsl(200, 100%, 60%)',
      'hsl(280, 70%, 50%)',
      'hsl(330, 80%, 55%)',
    ];

    return Object.entries(types).map(([type, count], i) => ({
      type,
      count,
      color: colors[i % colors.length],
    }));
  }, [verifications]);

  // Weekly activity
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);

    verifications.forEach(v => {
      const day = new Date(v.created_at).getDay();
      counts[day]++;
    });

    return days.map((day, i) => ({ day, scans: counts[i] }));
  }, [verifications]);

  // Risk distribution
  const riskData = useMemo(() => {
    const ranges = [
      { range: '0-20%', min: 0, max: 20, fill: 'hsl(160, 100%, 50%)' },
      { range: '21-40%', min: 21, max: 40, fill: 'hsl(160, 80%, 45%)' },
      { range: '41-60%', min: 41, max: 60, fill: 'hsl(45, 100%, 51%)' },
      { range: '61-80%', min: 61, max: 80, fill: 'hsl(30, 100%, 50%)' },
      { range: '81-100%', min: 81, max: 100, fill: 'hsl(0, 84%, 60%)' },
    ];

    return ranges.map(r => ({
      ...r,
      count: verifications.filter(v => v.risk_score >= r.min && v.risk_score <= r.max).length,
    }));
  }, [verifications]);

  const totalFraud = fraudData.reduce((acc, item) => acc + item.count, 0);
  const mostCommonFraud = fraudData.length > 0 
    ? fraudData.reduce((a, b) => a.count > b.count ? a : b) 
    : null;
  const peakDay = weeklyData.reduce((a, b) => a.scans > b.scans ? a : b);
  const highRiskCount = verifications.filter(v => v.risk_score >= 60).length;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time verification statistics and fraud detection insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Verifications"
            value={stats.total.toLocaleString()}
            change={stats.totalChange}
            icon={<FileCheck className="w-6 h-6" />}
            trend={stats.totalChange >= 0 ? 'up' : 'down'}
            loading={isLoading}
          />
          <StatCard
            title="Fraud Detected"
            value={stats.fraudCount}
            change={stats.fraudChange}
            icon={<AlertTriangle className="w-6 h-6" />}
            trend={stats.fraudChange <= 0 ? 'up' : 'down'}
            loading={isLoading}
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate.toFixed(1)}%`}
            change={3.2}
            icon={<Shield className="w-6 h-6" />}
            trend="up"
            loading={isLoading}
          />
          <StatCard
            title="High Risk Cases"
            value={highRiskCount}
            change={highRiskCount}
            icon={<Activity className="w-6 h-6" />}
            trend={highRiskCount > 5 ? 'down' : 'up'}
            loading={isLoading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Verification Trends
              </CardTitle>
              <CardDescription>Monthly verification outcomes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendChartConfig} className="h-[300px] w-full">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 100%, 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(160, 100%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="verified" stroke="hsl(160, 100%, 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorVerified)" />
                  <Area type="monotone" dataKey="rejected" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRejected)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Fraud Types
              </CardTitle>
              <CardDescription>Distribution of detected fraud categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {fraudData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={fraudData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="count" nameKey="type">
                        {fraudData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value} cases`, name]} contentStyle={{ backgroundColor: 'hsl(220, 20%, 7%)', border: '1px solid hsl(220, 15%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 95%)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No fraud data available
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {fraudData.slice(0, 4).map((item) => (
                  <div key={item.type} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate">{item.type}</span>
                    <span className="text-foreground font-mono ml-auto">
                      {totalFraud > 0 ? Math.round((item.count / totalFraud) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Number of scans by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={activityChartConfig} className="h-[250px] w-full">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="scans" fill="hsl(160, 100%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-warning" />
                Risk Score Distribution
              </CardTitle>
              <CardDescription>Cases grouped by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={riskChartConfig} className="h-[250px] w-full">
                <BarChart data={riskData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis type="category" dataKey="range" stroke="hsl(215, 15%, 55%)" fontSize={11} width={60} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Most Common Fraud Type</p>
                <p className="text-lg font-semibold text-primary mt-1">
                  {mostCommonFraud?.type || 'None detected'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {mostCommonFraud ? `${Math.round((mostCommonFraud.count / totalFraud) * 100)}% of all fraud cases` : 'No fraud cases yet'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-muted-foreground">Peak Processing Day</p>
                <p className="text-lg font-semibold text-warning mt-1">{peakDay.day}</p>
                <p className="text-xs text-muted-foreground mt-2">Average {peakDay.scans} scans</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">High Risk Cases (60%+)</p>
                <p className="text-lg font-semibold text-destructive mt-1">{highRiskCount} Cases</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.total > 0 ? `${Math.round((highRiskCount / stats.total) * 100)}%` : '0%'} of total verifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
