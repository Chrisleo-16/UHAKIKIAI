import { useMemo } from 'react';
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
  FileCheck, Users, Activity, Target 
} from 'lucide-react';

// Mock data for analytics
const verificationTrendData = [
  { month: 'Jan', verified: 145, rejected: 12, pending: 8 },
  { month: 'Feb', verified: 189, rejected: 18, pending: 5 },
  { month: 'Mar', verified: 234, rejected: 24, pending: 12 },
  { month: 'Apr', verified: 198, rejected: 15, pending: 6 },
  { month: 'May', verified: 267, rejected: 32, pending: 9 },
  { month: 'Jun', verified: 312, rejected: 28, pending: 4 },
];

const fraudDetectionData = [
  { type: 'Screenshot', count: 45, color: 'hsl(0, 84%, 60%)' },
  { type: 'Tampered', count: 28, color: 'hsl(45, 100%, 51%)' },
  { type: 'Expired', count: 18, color: 'hsl(200, 100%, 60%)' },
  { type: 'Fake Watermark', count: 12, color: 'hsl(280, 70%, 50%)' },
  { type: 'Identity Mismatch', count: 8, color: 'hsl(330, 80%, 55%)' },
];

const weeklyActivityData = [
  { day: 'Mon', scans: 42 },
  { day: 'Tue', scans: 58 },
  { day: 'Wed', scans: 45 },
  { day: 'Thu', scans: 67 },
  { day: 'Fri', scans: 52 },
  { day: 'Sat', scans: 23 },
  { day: 'Sun', scans: 18 },
];

const riskDistributionData = [
  { range: '0-20%', count: 312, fill: 'hsl(160, 100%, 50%)' },
  { range: '21-40%', count: 98, fill: 'hsl(160, 80%, 45%)' },
  { range: '41-60%', count: 45, fill: 'hsl(45, 100%, 51%)' },
  { range: '61-80%', count: 28, fill: 'hsl(30, 100%, 50%)' },
  { range: '81-100%', count: 12, fill: 'hsl(0, 84%, 60%)' },
];

const trendChartConfig = {
  verified: {
    label: "Verified",
    color: "hsl(160, 100%, 50%)",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(0, 84%, 60%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(45, 100%, 51%)",
  },
} satisfies ChartConfig;

const activityChartConfig = {
  scans: {
    label: "Scans",
    color: "hsl(160, 100%, 50%)",
  },
} satisfies ChartConfig;

const riskChartConfig = {
  count: {
    label: "Cases",
  },
} satisfies ChartConfig;

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <Card className="glass-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-primary' : 'text-destructive'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change}% vs last month</span>
            </div>
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
  const stats = useMemo(() => ({
    totalVerifications: 1345,
    fraudDetected: 111,
    successRate: 91.7,
    avgProcessingTime: '2.4s',
  }), []);

  const totalFraud = fraudDetectionData.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Verification statistics and fraud detection insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Verifications"
            value={stats.totalVerifications.toLocaleString()}
            change={12.5}
            icon={<FileCheck className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Fraud Detected"
            value={stats.fraudDetected}
            change={-8.3}
            icon={<AlertTriangle className="w-6 h-6" />}
            trend="down"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            change={3.2}
            icon={<Shield className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Avg Processing"
            value={stats.avgProcessingTime}
            change={15.4}
            icon={<Activity className="w-6 h-6" />}
            trend="up"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification Trends - Area Chart */}
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
                <AreaChart data={verificationTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  <Area
                    type="monotone"
                    dataKey="verified"
                    stroke="hsl(160, 100%, 50%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVerified)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRejected)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Fraud Types - Pie Chart */}
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fraudDetectionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="type"
                    >
                      {fraudDetectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} cases`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(220, 20%, 7%)',
                        border: '1px solid hsl(220, 15%, 18%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 20%, 95%)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {fraudDetectionData.slice(0, 4).map((item) => (
                  <div key={item.type} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground truncate">{item.type}</span>
                    <span className="text-foreground font-mono ml-auto">
                      {Math.round((item.count / totalFraud) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity - Bar Chart */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Number of scans performed each day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={activityChartConfig} className="h-[250px] w-full">
                <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="scans" 
                    fill="hsl(160, 100%, 50%)" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution - Bar Chart */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-warning" />
                Risk Score Distribution
              </CardTitle>
              <CardDescription>Distribution of cases by risk score range</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={riskChartConfig} className="h-[250px] w-full">
                <BarChart data={riskDistributionData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="range" 
                    stroke="hsl(215, 15%, 55%)" 
                    fontSize={11}
                    width={60}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={30}
                  >
                    {riskDistributionData.map((entry, index) => (
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
                <p className="text-lg font-semibold text-primary mt-1">Screenshot Detection</p>
                <p className="text-xs text-muted-foreground mt-2">40% of all fraud cases</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-muted-foreground">Peak Processing Day</p>
                <p className="text-lg font-semibold text-warning mt-1">Thursday</p>
                <p className="text-xs text-muted-foreground mt-2">Average 67 scans/day</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">High Risk Cases (60%+)</p>
                <p className="text-lg font-semibold text-destructive mt-1">40 Cases</p>
                <p className="text-xs text-muted-foreground mt-2">8% of total verifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
