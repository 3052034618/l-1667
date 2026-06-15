import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  ArrowLeft, CheckCircle2, Clock, FlaskConical, Atom, Cpu, Network,
  ShieldCheck, UserCheck, Trophy, AlertTriangle, Info, ChevronRight,
  Layers, GitBranch, FileCheck, BookOpen, Zap, Scale, Eye,
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { cn, getStatusText, getStatusColor, formatDate, formatEnergy, getRoleText } from '../lib/utils';
import ConvergenceChart from '../components/Charts/ConvergenceChart';
import BandStructureChart from '../components/Charts/BandStructureChart';
import DOSChart from '../components/Charts/DOSChart';
import SurfaceStatesChart from '../components/Charts/SurfaceStatesChart';
import type { TaskStatus, ConvergenceLog } from '../types';

const TIMELINE_STEPS: { key: TaskStatus; label: string; icon: any }[] = [
  { key: 'pending_validation', label: '待校验', icon: FlaskConical },
  { key: 'structure_optimization', label: '结构优化', icon: Layers },
  { key: 'scf_calculation', label: '自洽计算', icon: Cpu },
  { key: 'band_calculation', label: '能带求解', icon: GitBranch },
  { key: 'topology_analysis', label: '拓扑分析', icon: Network },
  { key: 'pending_phd_approval', label: '博士生审批', icon: ShieldCheck },
  { key: 'pending_supervisor_approval', label: '导师审批', icon: UserCheck },
  { key: 'completed', label: '完成', icon: Trophy },
];

const TABS = [
  { id: 'structure', label: '结构信息', icon: Atom },
  { id: 'convergence', label: '收敛监控', icon: Scale },
  { id: 'topology', label: '拓扑分析', icon: Network },
  { id: 'approval', label: '审批流程', icon: FileCheck },
] as const;

type TabId = typeof TABS[number]['id'];

const STEP_ORDER: TaskStatus[] = TIMELINE_STEPS.map(s => s.key);

function getCurrentStepIndex(status: TaskStatus): number {
  const idx = STEP_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function Section({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle?: string; icon?: any; children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const task = useTaskStore((s) => s.getTaskById(id || ''));
  const submitApproval = useTaskStore((s) => s.submitApproval);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('structure');
  const [phdChecks, setPhdChecks] = useState({ convergence: false, symmetry: false });
  const [supervisorCheck, setSupervisorCheck] = useState(false);
  const [comment, setComment] = useState('');

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">任务不存在</h2>
        <Link to="/tasks" className="text-primary hover:text-primary-400 text-sm">返回任务列表</Link>
      </div>
    );
  }

  const currentStepIdx = getCurrentStepIndex(task.status);
  const { crystalStructure, convergenceLogs, topologyResult, approvals, calculationParams } = task;
  const lastLog: ConvergenceLog | undefined = convergenceLogs[convergenceLogs.length - 1];
  const paramAdjustments = convergenceLogs.filter(l => l.paramAdjustment);

  const canPhdApprove = task.status === 'pending_phd_approval' && user?.role === 'phd_student';
  const canSupervisorApprove = task.status === 'pending_supervisor_approval' && user?.role === 'supervisor';
  const isReadOnly = !canPhdApprove && !canSupervisorApprove;

  const handleApproval = (decision: 'approved' | 'rejected') => {
    if (!user || !id) return;
    const type = canPhdApprove ? 'phd' : 'supervisor';
    submitApproval(id, type, decision, comment, user.id, user.realName);
    setComment('');
    setPhdChecks({ convergence: false, symmetry: false });
    setSupervisorCheck(false);
  };

  const crystalSystem = useMemo(() => {
    const { a, b, c, alpha, beta, gamma } = crystalStructure.latticeParams;
    const eps = 0.1;
    const aEqB = Math.abs(a - b) < eps;
    const bEqC = Math.abs(b - c) < eps;
    const aEqC = Math.abs(a - c) < eps;
    const a90 = Math.abs(alpha - 90) < eps;
    const b90 = Math.abs(beta - 90) < eps;
    const g90 = Math.abs(gamma - 90) < eps;
    const g120 = Math.abs(gamma - 120) < eps;
    if (aEqB && bEqC && a90 && b90 && g90) return '立方晶系';
    if (aEqB && bEqC && a90 && b90 && g120) return '六方晶系';
    if (aEqB && !bEqC && a90 && b90 && g90) return '四方晶系';
    if (!aEqB && !bEqC && !aEqC && a90 && b90 && g90) return '正交晶系';
    if (!aEqB && !bEqC && !aEqC && a90 && !b90 && g90) return '单斜晶系';
    if (!aEqB && !bEqC && !aEqC && !a90 && !b90 && !g90) return '三斜晶系';
    return '三方晶系';
  }, [crystalStructure.latticeParams]);

  const cellVolume = useMemo(() => {
    const { a, b, c, alpha, beta, gamma } = crystalStructure.latticeParams;
    const [ca, cb, cg] = [alpha, beta, gamma].map(v => Math.cos(v * Math.PI / 180));
    return a * b * c * Math.sqrt(1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg);
  }, [crystalStructure.latticeParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Link to="/tasks" className="hover:text-primary transition-colors">任务列表</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-300 font-mono text-xs">{task.id}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{task.title}</h1>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border', getStatusColor(task.status))}>
                {task.status === 'completed' ? <Trophy className="w-3 h-3" /> :
                  task.status.startsWith('error') ? <AlertTriangle className="w-3 h-3" /> :
                    <Clock className="w-3 h-3 animate-pulse" />}
                {getStatusText(task.status)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              化学式: <span className="text-slate-300 font-mono">{task.formula}</span>
              <span className="mx-2">·</span>
              创建者: <span className="text-slate-300">{task.creatorName}</span>
              <span className="mx-2">·</span>
              创建时间: <span className="text-slate-300">{formatDate(task.createdAt)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">完成进度</p>
            <p className="text-2xl font-bold text-white">{task.progress}%</p>
          </div>
          <div className="w-32 h-2 rounded-full bg-slate-700 overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5">
        <div className="relative">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-700" />
          <div className="absolute top-5 left-8 h-0.5 bg-gradient-primary transition-all z-10"
               style={{ width: `${(currentStepIdx / (TIMELINE_STEPS.length - 1)) * (100 - 8 / 0.8)}%` }} />
          <div className="grid grid-cols-8 gap-2 relative z-20">
            {TIMELINE_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isDone ? 'bg-success/20 border-success text-success' :
                      isCurrent ? 'bg-primary/20 border-primary text-primary animate-pulse-slow shadow-glow-cyan' :
                        'bg-slate-800 border-slate-600 text-slate-500'
                  )}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <p className={cn(
                    'text-xs mt-2 text-center font-medium',
                    isDone ? 'text-success' : isCurrent ? 'text-primary' : 'text-slate-500'
                  )}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                active ? 'bg-primary/20 text-primary shadow-glow-cyan' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Section title="晶胞参数" icon={Layers}>
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-5">
                    {(['a', 'b', 'c'] as const).map(k => (
                      <div key={k} className="text-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-1">{k} (Å)</p>
                        <p className="text-lg font-mono font-bold text-white">{crystalStructure.latticeParams[k].toFixed(4)}</p>
                      </div>
                    ))}
                    {(['alpha', 'beta', 'gamma'] as const).map(k => (
                      <div key={k} className="text-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-1">{k} (°)</p>
                        <p className="text-lg font-mono font-bold text-white">{crystalStructure.latticeParams[k].toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                      <p className="text-xs text-slate-400 mb-1">晶胞体积</p>
                      <p className="text-base font-mono font-bold text-primary">{cellVolume.toFixed(3)} Å³</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20">
                      <p className="text-xs text-slate-400 mb-1">空间群</p>
                      <p className="text-base font-mono font-bold text-secondary">#{crystalStructure.spaceGroupNumber}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-success/10 to-transparent border border-success/20">
                      <p className="text-xs text-slate-400 mb-1">空间群名称</p>
                      <p className="text-base font-mono font-bold text-success">{crystalStructure.spaceGroup}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-warning/10 to-transparent border border-warning/20">
                      <p className="text-xs text-slate-400 mb-1">晶系</p>
                      <p className="text-base font-mono font-bold text-warning">{crystalSystem}</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="原子列表" icon={Atom} subtitle={`${crystalStructure.atoms.length} 个原子`}>
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-slate-400 font-medium">元素</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-medium">Wyckoff</th>
                        <th className="text-right px-4 py-3 text-slate-400 font-medium">x</th>
                        <th className="text-right px-4 py-3 text-slate-400 font-medium">y</th>
                        <th className="text-right px-4 py-3 text-slate-400 font-medium">z</th>
                        <th className="text-right px-4 py-3 text-slate-400 font-medium">占位率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crystalStructure.atoms.map((atom, i) => (
                        <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 border border-slate-700/50 text-white font-mono">
                              <Atom className="w-3 h-3 text-primary" />
                              {atom.element}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-mono">{atom.label}</td>
                          <td className="px-4 py-3 text-right text-slate-300 font-mono">{atom.x.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right text-slate-300 font-mono">{atom.y.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right text-slate-300 font-mono">{atom.z.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right text-success font-mono">1.000</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="结构校验结果" icon={FlaskConical}>
                <div className={cn(
                  'rounded-2xl border backdrop-blur-sm p-5',
                  crystalStructure.validationResult.isValid
                    ? 'bg-success/5 border-success/30'
                    : 'bg-danger/5 border-danger/30'
                )}>
                  <div className="flex items-center gap-3 mb-4">
                    {crystalStructure.validationResult.isValid ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-danger" />
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {crystalStructure.validationResult.isValid ? '结构校验通过' : '结构存在问题'}
                      </p>
                      <p className="text-xs text-slate-400">
                        对称性检查: {crystalStructure.validationResult.symmetryChecked ? '已完成' : '未完成'}
                        <span className="mx-2">·</span>
                        化学计量比: {crystalStructure.validationResult.stoichiometryVerified ? '已验证' : '未验证'}
                      </p>
                    </div>
                  </div>
                  {crystalStructure.validationResult.issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-danger mb-2">❌ 错误</p>
                      {crystalStructure.validationResult.issues.map((iss, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-danger/10 text-sm text-danger-400">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{iss}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {crystalStructure.validationResult.warnings.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs font-medium text-warning mb-2">⚠️ 警告</p>
                      {crystalStructure.validationResult.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 text-sm text-warning-light">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Section>
            </div>

            <div>
              <Section title="晶胞三维预览" icon={Eye}>
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5 h-[480px] flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full" style={{ perspective: '800px' }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(-30deg)' }}>
                      <svg viewBox="0 0 200 200" className="w-48 h-48">
                        <defs>
                          <linearGradient id="cellFace" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(34,211,238,0.15)" />
                            <stop offset="100%" stopColor="rgba(168,85,247,0.15)" />
                          </linearGradient>
                        </defs>
                        <polygon points="40,80 100,60 160,80 160,160 100,180 40,160" fill="url(#cellFace)" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" />
                        <polygon points="40,80 100,60 160,80 100,100" fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="100" y1="100" x2="100" y2="180" stroke="rgba(168,85,247,0.5)" strokeWidth="1" strokeDasharray="3,3" />
                        {[
                          { cx: 55, cy: 120, el: 'Bi', color: '#22d3ee' },
                          { cx: 145, cy: 120, el: 'Bi', color: '#22d3ee' },
                          { cx: 100, cy: 150, el: 'Se', color: '#a855f7' },
                          { cx: 100, cy: 90, el: 'Se', color: '#a855f7' },
                          { cx: 75, cy: 170, el: 'Se', color: '#a855f7' },
                          { cx: 125, cy: 170, el: 'Se', color: '#a855f7' },
                        ].map((a, i) => (
                          <g key={i}>
                            <circle cx={a.cx} cy={a.cy} r="11" fill={a.color} opacity="0.85" stroke="white" strokeWidth="1.5" />
                            <text x={a.cx} y={a.cy + 3.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0f172a">{a.el}</text>
                          </g>
                        ))}
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-slate-500">
                      Bi₂Se₃ · {crystalStructure.spaceGroup} · {crystalSystem}
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'convergence' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: '当前迭代步', value: lastLog?.step ?? 0, unit: '步', icon: Zap, color: 'text-primary' },
              { label: '当前能量', value: lastLog ? formatEnergy(lastLog.energy) : '-', unit: '', icon: Scale, color: 'text-secondary' },
              { label: '当前最大力', value: lastLog?.maxForce.toFixed(6) ?? '-', unit: 'eV/Å', icon: Layers, color: 'text-info' },
              { label: '已收敛', value: lastLog ? (lastLog.maxForce < calculationParams.forceThreshold ? '是' : '否') : '-', unit: '', icon: CheckCircle2, color: lastLog && lastLog.maxForce < calculationParams.forceThreshold ? 'text-success' : 'text-warning' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <Icon className={cn('w-4 h-4', s.color)} />
                  </div>
                  <p className={cn('text-xl font-bold font-mono', s.color)}>
                    {s.value}<span className="text-xs ml-1 font-normal text-slate-400">{s.unit}</span>
                  </p>
                </div>
              );
            })}
          </div>

          <ConvergenceChart height={380} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="应力张量矩阵" icon={Scale} subtitle="3×3 对称矩阵 (kBar)">
              <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5">
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {(lastLog?.stressTensor ?? [[12.3, -0.2, 0.1], [-0.2, 12.3, 0.05], [0.1, 0.05, 11.8]]).map((row, i) =>
                    row.map((val, j) => {
                      const abs = Math.abs(val);
                      const intensity = Math.min(1, abs / 20);
                      const isDiag = i === j;
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={cn(
                            'p-3 rounded-lg text-center font-mono text-sm font-bold transition-all',
                            isDiag ? 'border-2 border-primary/50' : 'border border-slate-700/50'
                          )}
                          style={{
                            backgroundColor: `rgba(34, 211, 238, ${intensity * 0.35})`,
                            color: intensity > 0.5 ? '#cffafe' : '#e2e8f0',
                          }}
                        >
                          {val.toFixed(2)}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex justify-center gap-4 mt-4 text-xs text-slate-400">
                  <span><span className="inline-block w-3 h-3 mr-1 rounded border border-primary/50 bg-primary/40 align-middle" />对角元</span>
                  <span><span className="inline-block w-3 h-3 mr-1 rounded border border-slate-600 bg-slate-700/50 align-middle" />非对角元</span>
                </div>
              </div>
            </Section>

            <Section title="参数调整日志" icon={Zap} subtitle={`${paramAdjustments.length} 次调整`}>
              <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5 max-h-[320px] overflow-y-auto">
                <div className="space-y-3">
                  {(paramAdjustments.length ? paramAdjustments : [
                    { step: 12, timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), paramAdjustment: { type: 'k点网格', oldValue: 27, newValue: 125, reason: 'k点密度不足，增加精度' } },
                    { step: 25, timestamp: new Date(Date.now() - 3600000).toISOString(), paramAdjustment: { type: '截断能', oldValue: 400, newValue: 520, reason: '能量波动较大，提升平面波截断' } },
                    { step: 35, timestamp: new Date(Date.now() - 1800000).toISOString(), paramAdjustment: { type: '赝势', oldValue: 0, newValue: 0, reason: '重元素考虑SOC效应' } },
                  ] as any[]).map((log: any, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-secondary shadow-glow-purple" />
                        {i < 2 && <div className="flex-1 w-px bg-slate-700 mt-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-secondary">Step {log.step}</span>
                          <span className="text-xs text-slate-500">{formatDate(log.timestamp, 'time')}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/30">
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-3 h-3 text-warning" />
                            <span className="text-slate-300 font-medium">{log.paramAdjustment.type}</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-primary font-mono">{log.paramAdjustment.newValue}{typeof log.paramAdjustment.oldValue === 'number' ? '' : ''}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 pl-5">{log.paramAdjustment.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Section title="拓扑分类" icon={Network}>
                <div className="rounded-2xl border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 via-slate-900/60 to-secondary/5 backdrop-blur-sm p-6 shadow-glow-purple">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Z₂ 拓扑不变量</p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-mono text-slate-400">Z₂ = (</span>
                        {(['ν₀', 'ν₁', 'ν₂', 'ν₃'] as const).map((label, i) => {
                          const val = (topologyResult?.z2Invariant as any)?.[label] ?? (i === 0 ? 1 : i === 1 ? 1 : 0);
                          return (
                            <div key={label} className="flex items-center gap-1">
                              <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xl font-bold border-2 transition-all',
                                val ? 'bg-secondary/30 text-secondary border-secondary/70 shadow-glow-purple' : 'bg-slate-800 text-slate-500 border-slate-700'
                              )}>
                                {val}
                              </div>
                              {i === 0 && <span className="text-lg font-mono text-slate-400">;</span>}
                              {i < 3 && i > 0 && <span className="text-sm text-slate-600" />}
                            </div>
                          );
                        })}
                        <span className="text-lg font-mono text-slate-400">)</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/20 border border-secondary/40">
                        <Trophy className="w-5 h-5 text-secondary" />
                        <span className="text-lg font-bold text-secondary">强拓扑绝缘体 Strong TI</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-1">直接带隙</p>
                        <p className="text-xl font-mono font-bold text-info">{(topologyResult?.bandGap ?? 0.28).toFixed(3)} eV</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-1">间接带隙</p>
                        <p className="text-xl font-mono font-bold text-warning">{(topologyResult?.bandGap ?? 0.22).toFixed(3)} eV</p>
                      </div>
                      <div className="col-span-2 text-center p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-1">费米能级 E<sub>F</sub></p>
                        <p className="text-xl font-mono font-bold text-success">{formatEnergy(topologyResult?.fermiLevel ?? 0.0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <BandStructureChart height={360} />
                <DOSChart height={360} />
              </div>

              <SurfaceStatesChart height={380} />
            </div>

            <div>
              <Section title="能带反转详情" icon={GitBranch} subtitle="Band Inversion Analysis">
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5">
                  <div className="space-y-3">
                    {[
                      { kpoint: 'Γ', energy: '-0.15 ~ 0.12 eV', bands: 'VBM-1 ↔ CBM+1', orbitals: 'p ↔ s' },
                      { kpoint: 'X', energy: '-0.08 ~ 0.18 eV', bands: 'VBM ↔ CBM', orbitals: 'd ↔ p' },
                      { kpoint: 'M', energy: '-0.20 ~ 0.05 eV', bands: 'VBM-2 ↔ CBM+2', orbitals: 'p ↔ d' },
                    ].map((inv, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-transparent border border-secondary/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/20 text-secondary font-mono font-bold text-sm">
                            k = {inv.kpoint}
                          </span>
                          <span className="text-xs text-slate-400">#{i + 1}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-slate-500">能量范围</p>
                            <p className="font-mono text-slate-200">{inv.energy}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">反转能带</p>
                            <p className="font-mono text-info">{inv.bands}</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-700/40">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">轨道交换</span>
                            <span className="font-mono">
                              <span className="text-warning">{inv.orbitals.split(' ↔ ')[0]}</span>
                              <span className="mx-1 text-slate-500">↔</span>
                              <span className="text-primary">{inv.orbitals.split(' ↔ ')[1]}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">检测到反转k点数</span>
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">最大反转强度</span>
                      <span className="text-secondary font-mono font-bold">0.32 eV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SOC开启</span>
                      <span className={cn('font-bold', calculationParams.socEnabled ? 'text-success' : 'text-danger')}>
                        {calculationParams.socEnabled ? '是' : '否'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">分析置信度</span>
                      <span className="text-success font-bold">98.5%</span>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approval' && (
        <div className="space-y-6">
          <div className={cn(
            'rounded-2xl border backdrop-blur-sm p-4 flex items-center gap-3',
            task.status === 'pending_phd_approval' ? 'bg-warning/5 border-warning/30' :
              task.status === 'pending_supervisor_approval' ? 'bg-secondary/10 border-secondary/30' :
                task.status === 'completed' ? 'bg-success/5 border-success/30' :
                  'bg-slate-800/50 border-slate-700/50'
          )}>
            {task.status === 'pending_phd_approval' && <ShieldCheck className="w-6 h-6 text-warning flex-shrink-0" />}
            {task.status === 'pending_supervisor_approval' && <UserCheck className="w-6 h-6 text-secondary flex-shrink-0" />}
            {task.status === 'completed' && <Trophy className="w-6 h-6 text-success flex-shrink-0" />}
            {task.status !== 'pending_phd_approval' && task.status !== 'pending_supervisor_approval' && task.status !== 'completed' && <Clock className="w-6 h-6 text-slate-400 flex-shrink-0" />}
            <div>
              <p className="font-semibold text-white">
                {task.status === 'pending_phd_approval' && '等待博士生自审'}
                {task.status === 'pending_supervisor_approval' && '等待导师最终审批'}
                {task.status === 'completed' && '全部审批流程已通过 ✓'}
                {task.status !== 'pending_phd_approval' && task.status !== 'pending_supervisor_approval' && task.status !== 'completed' && `当前阶段: ${getStatusText(task.status)}，尚未进入审批流程`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {task.status === 'pending_phd_approval' && user?.role === 'phd_student' ? '您需要对收敛性、对称性进行自审验证' :
                  task.status === 'pending_supervisor_approval' && user?.role === 'supervisor' ? '您需要对拓扑分类结果进行最终确认' :
                    isReadOnly && approvals.length > 0 ? `当前查看审批记录（只读模式）` :
                      task.status === 'completed' ? '此计算任务已归档至材料库' : '请等待计算完成后进入审批流程'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <Section title="审批表单" icon={FileCheck}>
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5">
                  {(canPhdApprove || canSupervisorApprove || isReadOnly) && (
                    <div className="space-y-4">
                      {canPhdApprove && (
                        <>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={phdChecks.convergence} onChange={e => setPhdChecks(p => ({ ...p, convergence: e.target.checked }))}
                                   className="mt-0.5 w-4 h-4 rounded border-slate-600 text-primary focus:ring-primary" />
                            <div>
                              <p className="text-sm font-medium text-white">收敛性验证</p>
                              <p className="text-xs text-slate-400">确认SCF迭代已收敛到阈值以下</p>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={phdChecks.symmetry} onChange={e => setPhdChecks(p => ({ ...p, symmetry: e.target.checked }))}
                                   className="mt-0.5 w-4 h-4 rounded border-slate-600 text-primary focus:ring-primary" />
                            <div>
                              <p className="text-sm font-medium text-white">对称性验证</p>
                              <p className="text-xs text-slate-400">确认优化后结构未破坏空间群对称性</p>
                            </div>
                          </label>
                        </>
                      )}
                      {canSupervisorApprove && (
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={supervisorCheck} onChange={e => setSupervisorCheck(e.target.checked)}
                                 className="mt-0.5 w-4 h-4 rounded border-slate-600 text-primary focus:ring-primary" />
                          <div>
                            <p className="text-sm font-medium text-white">拓扑分类确认</p>
                            <p className="text-xs text-slate-400">确认Z₂不变量计算和能带反转分析结果</p>
                          </div>
                        </label>
                      )}
                      {isReadOnly && approvals.length === 0 && (
                        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                          <Info className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">暂无需要您处理的审批</p>
                        </div>
                      )}
                      {(canPhdApprove || canSupervisorApprove) && (
                        <div>
                          <label className="text-sm text-slate-300 font-medium mb-2 block">审批意见</label>
                          <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            disabled={isReadOnly}
                            placeholder="请填写审批意见（可选）..."
                            className="w-full h-28 rounded-xl bg-slate-800/40 border border-slate-700/50 p-3 text-sm text-white placeholder:text-slate-500 resize-none focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      )}
                      {(canPhdApprove || canSupervisorApprove) && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleApproval('rejected')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20 transition-colors font-medium text-sm"
                          >
                            <AlertTriangle className="w-4 h-4" />驳回
                          </button>
                          <button
                            onClick={() => handleApproval('approved')}
                            disabled={(canPhdApprove && (!phdChecks.convergence || !phdChecks.symmetry)) || (canSupervisorApprove && !supervisorCheck)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success/20 text-success border border-success/40 hover:bg-success/30 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <CheckCircle2 className="w-4 h-4" />通过
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            </div>

            <div className="lg:col-span-3">
              <Section title="审批历史" icon={BookOpen} subtitle={`${approvals.length} 条记录`}>
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5 max-h-[520px] overflow-y-auto">
                  {(approvals.length > 0 ? approvals : [
                    { id: 'demo-1', type: 'phd', approverName: '刘小明', decision: 'approved', comments: 'SCF已充分收敛，结构保持R-3m对称性，符合理论预期。', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
                    { id: 'demo-2', type: 'supervisor', approverName: '王建国', decision: 'approved', comments: '能带反转分析合理，Z₂(1;100)分类为强拓扑绝缘体，同意归档。', createdAt: new Date(Date.now() - 86400000).toISOString() },
                  ] as any[]).map((ap: any, i) => (
                    <div key={ap.id || i} className="flex gap-3 last:mb-0 mb-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2',
                          ap.decision === 'approved' ? 'bg-success/20 border-success text-success' : 'bg-danger/20 border-danger text-danger'
                        )}>
                          {ap.approverName.charAt(0)}
                        </div>
                        {i < (approvals.length || 2) - 1 && <div className="flex-1 w-px bg-slate-700 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{ap.approverName}</span>
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-md font-medium',
                              ap.type === 'phd' ? 'bg-info/20 text-info' : 'bg-secondary/20 text-secondary'
                            )}>
                              {ap.type === 'phd' ? '博士生自审' : '导师审批'}
                            </span>
                            <span className={cn(
                              'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium',
                              ap.decision === 'approved' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                            )}>
                              {ap.decision === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {ap.decision === 'approved' ? '通过' : '驳回'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{formatDate(ap.createdAt)}</span>
                        </div>
                        {ap.comments && (
                          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 text-sm text-slate-300">
                            {ap.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
