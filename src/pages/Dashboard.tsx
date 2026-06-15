import { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle2,
  Cpu, HardDrive, Gauge, Clock, UserCheck, FileCheck, Zap
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { mockDashboardStats, mockTasks } from '../data/mockData';
import type { TaskStatus } from '../types';

const statusLabels: Record<TaskStatus, string> = {
  pending_validation: '待验证',
  structure_optimization: '结构优化',
  scf_calculation: 'SCF计算',
  band_calculation: '能带计算',
  topology_analysis: '拓扑分析',
  pending_phd_approval: '博士自审',
  pending_supervisor_approval: '导师审批',
  completed: '已完成',
  error_fallback: '异常',
  paused: '已暂停',
};

const statusColors = [
  '#94A3B8', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA',
  '#F472B6', '#FB923C', '#10B981', '#EF4444', '#6B7280'
];

const topologyColors = ['#64748B', '#22D3EE', '#A855F7', '#F59E0B'];

const customTooltipStyle = {
  backgroundColor: 'rgba(30, 41, 59, 0.95)',
  border: '1px solid rgba(71, 85, 109, 0.5)',
  borderRadius: '12px',
  backdropFilter: 'blur(8px)',
  color: '#F8FAFC',
};

function StatCard({
  title, value, unit, change, changeType, icon: Icon, color, progress, showProgress
}: {
  title: string; value: string; unit?: string; change: string; changeType: 'up' | 'down';
  icon: any; color: string; progress?: number; showProgress?: boolean;
}) {
  const isWarning = title.includes('异常');
  return (
    <div className={`relative p-5 rounded-2xl glass-card glass-card-hover overflow-hidden ${
      isWarning ? 'border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]' : ''
    } ${!isWarning && showProgress ? 'border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          changeType === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
        }`}>
          {changeType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm text-slate-400 mb-1">{unit}</span>}
      </div>
      <p className="text-xs text-slate-400 mb-3">{title}</p>
      {showProgress && progress !== undefined && (
        <div className="relative w-full h-20 flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(71,85,105,0.3)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 263.89} 263.89`}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-emerald-400">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function GaugeChart({ value, label, color }: { value: number; label: string; color: string }) {
  const data = [{ name: label, value, fill: color }];
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 120, height: 80 }}>
        <ResponsiveContainer>
          <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}>
            <RadialBar background={{ fill: 'rgba(71,85,105,0.3)' }} dataKey="value" cornerRadius={5} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-3 text-center">
        <p className="text-xl font-bold text-white">{value}%</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const stats = mockDashboardStats;

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${'日一二三四五六'[d.getDay()]}期`;
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? '凌晨好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

  const trendData = stats.trend.map(t => ({
    ...t,
    date: t.date.slice(5),
  }));

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    mockTasks.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: statusLabels[key as TaskStatus] || key,
      value,
    }));
  }, []);
  const totalTasks = statusDistribution.reduce((s, d) => s + d.value, 0);

  const groupComparison = useMemo(() => {
    const statuses: TaskStatus[] = ['structure_optimization', 'scf_calculation', 'band_calculation', 'topology_analysis', 'completed'];
    return statuses.map(s => ({
      status: statusLabels[s],
      '拓扑量子组': mockTasks.filter(t => t.groupId === 'group-1' && t.status === s).length,
      '先进功能组': mockTasks.filter(t => t.groupId === 'group-2' && t.status === s).length,
    }));
  }, []);

  const topologyData = [
    { name: '平庸', value: 58 },
    { name: '弱拓扑', value: 24 },
    { name: '强拓扑', value: 42 },
    { name: '晶体拓扑', value: 32 },
  ];
  const topologyTotal = topologyData.reduce((s, d) => s + d.value, 0);

  const recentActivities = [
    { type: 'task', icon: CheckCircle2, title: 'Bi2Se3计算任务已完成', time: '10分钟前', color: 'text-emerald-400 bg-emerald-500/10' },
    { type: 'approval', icon: FileCheck, title: 'Cd3As2通过导师审批', time: '45分钟前', color: 'text-violet-400 bg-violet-500/10' },
    { type: 'task', icon: Activity, title: 'TaAs外尔半金属SCF迭代第52步', time: '1小时前', color: 'text-cyan-400 bg-cyan-500/10' },
    { type: 'user', icon: UserCheck, title: '李博士加入拓扑量子研究组', time: '3小时前', color: 'text-blue-400 bg-blue-500/10' },
    { type: 'system', icon: Zap, title: 'GPU队列新增4个计算节点', time: '5小时前', color: 'text-amber-400 bg-amber-500/10' },
  ];

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl p-6 border border-slate-700/50"
        style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(168,85,247,0.15) 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="text-gradient-mixed glow-cyan-text">{greeting}，{user?.realName || '研究员'}</span>
              <span className="text-white"> 👋</span>
            </h2>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>今天是 {today}</span>
              <span className="text-slate-500">·</span>
              <span>欢迎回到拓扑材料高通量计算平台</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="glass-card rounded-xl px-4 py-2 text-center min-w-[90px]">
              <p className="text-2xl font-bold text-cyan-400">{stats.runningTasks}</p>
              <p className="text-xs text-slate-400">运行中</p>
            </div>
            <div className="glass-card rounded-xl px-4 py-2 text-center min-w-[90px]">
              <p className="text-2xl font-bold text-emerald-400">{stats.completedTasks}</p>
              <p className="text-xs text-slate-400">已完成</p>
            </div>
            <div className="glass-card rounded-xl px-4 py-2 text-center min-w-[90px]">
              <p className="text-2xl font-bold text-amber-400">{stats.pendingApprovals}</p>
              <p className="text-xs text-slate-400">待审批</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="计算完成率" value="78.5" unit="%" change="↑ 3.2%" changeType="up" icon={CheckCircle2} color="bg-gradient-to-br from-emerald-500 to-teal-600" progress={78.5} showProgress />
        <StatCard title="平均自洽迭代次数" value="38.2" unit="次" change="↓ 2.1次" changeType="down" icon={Activity} color="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard title="拓扑分类准确度" value="94.8" unit="%" change="↑ 1.5%" changeType="up" icon={Gauge} color="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard title="异常任务数" value="5" unit="个" change="↓ 1个" changeType="down" icon={AlertTriangle} color="bg-gradient-to-br from-rose-500 to-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 glass-card rounded-2xl p-5 glass-card-hover">
          <h3 className="text-lg font-semibold mb-4 text-gradient-cyan">近30天计算量趋势</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,109,0.3)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#F8FAFC' }} labelStyle={{ color: '#94A3B8' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
                <Area type="monotone" dataKey="tasksCreated" name="任务创建" stroke="#22D3EE" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="tasksCompleted" name="任务完成" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-5 glass-card-hover">
          <h3 className="text-lg font-semibold mb-4 text-gradient-purple">各状态任务分布</h3>
          <div className="relative" style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={2} dataKey="value">
                  {statusDistribution.map((_, i) => <Cell key={i} fill={statusColors[i % statusColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalTasks}</p>
                <p className="text-xs text-slate-400">任务总数</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {statusDistribution.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[i % statusColors.length] }} />
                <span className="text-slate-400 truncate">{s.name}</span>
                <span className="text-slate-200 ml-auto font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 glass-card-hover">
          <h3 className="text-lg font-semibold mb-4 text-gradient-cyan">各课题组任务对比</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={groupComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,109,0.3)" />
                <XAxis dataKey="status" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#F8FAFC' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '11px' }} />
                <Bar dataKey="拓扑量子组" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="先进功能组" fill="#A855F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 glass-card-hover">
          <h3 className="text-lg font-semibold mb-4 text-gradient-purple">拓扑分类分布</h3>
          <div className="relative" style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={topologyData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {topologyData.map((_, i) => <Cell key={i} fill={topologyColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{topologyTotal}</p>
                <p className="text-[10px] text-slate-400">材料总数</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {topologyData.map((t, i) => (
              <div key={t.name} className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-slate-800/30">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: topologyColors[i] }} />
                <span className="text-slate-300">{t.name}</span>
                <span className="ml-auto font-bold text-white">{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 glass-card-hover">
          <h3 className="text-lg font-semibold mb-4 text-gradient-mixed">系统资源使用率</h3>
          <div className="flex justify-around items-end pt-2">
            <GaugeChart value={72} label="CPU" color="#22D3EE" />
            <GaugeChart value={58} label="内存" color="#A855F7" />
            <GaugeChart value={85} label="GPU" color="#F59E0B" />
          </div>
          <div className="mt-5 space-y-2.5">
            {[{ label: 'CPU', val: 72, color: 'from-cyan-500 to-cyan-400', icon: Cpu },
              { label: '内存', val: 58, color: 'from-violet-500 to-purple-400', icon: HardDrive },
              { label: 'GPU', val: 85, color: 'from-amber-500 to-orange-400', icon: Gauge }].map(r => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <r.icon className="w-3.5 h-3.5" /> {r.label}
                  </span>
                  <span className="text-slate-200 font-medium">{r.val}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${r.color} rounded-full transition-all`} style={{ width: `${r.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 glass-card-hover">
        <h3 className="text-lg font-semibold mb-5 text-gradient-mixed">最近活动</h3>
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-transparent" />
          <div className="space-y-4">
            {recentActivities.map((a, i) => (
              <div key={i} className="relative flex items-start gap-4 pl-12">
                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center ${a.color} border-2 border-slate-900`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 py-1">
                  <p className="text-sm text-slate-200">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
