import { useState, useMemo, useEffect } from 'react';
import { Search, RotateCcw, Database, Layers, ChevronDown, ChevronUp, Quote, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { useTaskStore } from '../store/taskStore';
import { mockMaterials } from '../data/mockData';
import { cn, formatDate } from '../lib/utils';
import type { MaterialArchive } from '../types';

const topologyOptions = [
  { value: 'trivial', label: '平庸', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'weak', label: '弱拓扑', color: 'bg-info/20 text-info border-info/30' },
  { value: 'strong', label: '强拓扑', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: 'crystalline', label: '晶体拓扑', color: 'bg-secondary/20 text-secondary border-secondary/30' },
];

function getTopologyLabel(tc: string) {
  if (tc.includes('Strong') || tc.includes('3D Strong')) return { label: '强拓扑', idx: 2 };
  if (tc.includes('Weak')) return { label: '弱拓扑', idx: 1 };
  if (tc.includes('Crystalline') || tc.includes('Mirror')) return { label: '晶体拓扑', idx: 3 };
  if (tc.includes('Semimetal') || tc.includes('Dirac') || tc.includes('Weyl')) return { label: '强拓扑', idx: 2 };
  if (tc.includes('Magnetic')) return { label: '强拓扑', idx: 2 };
  if (tc.includes('Superconductor')) return { label: '强拓扑', idx: 2 };
  if (tc === 'Topological Insulator') return { label: '强拓扑', idx: 2 };
  return { label: '平庸', idx: 0 };
}

function isDirectGap(formula: string) {
  return ['Bi2Se3', 'Bi2Te3', 'Sb', 'KZnBi', 'SnTe'].includes(formula);
}

export default function Materials() {
  const [searchText, setSearchText] = useState('');
  const [spaceGroupRange, setSpaceGroupRange] = useState<[number, number]>([1, 230]);
  const [selectedTopology, setSelectedTopology] = useState<string[]>([]);
  const [bandGapRange, setBandGapRange] = useState<[number, number]>([0, 3]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getMaterials = useTaskStore((s) => s.getMaterials);
  const loadTasksFromStorage = useTaskStore((s) => s.loadTasksFromStorage);

  useEffect(() => {
    loadTasksFromStorage();
  }, [loadTasksFromStorage]);

  const archivedMaterials = useMemo(() => {
    const filters: { formula?: string; spaceGroup?: string; topologyClass?: string; bandGap?: [number, number] } = {};
    if (searchText) filters.formula = searchText;
    if (selectedTopology.length > 0) filters.topologyClass = selectedTopology.join('|');
    filters.bandGap = bandGapRange;
    return getMaterials(filters);
  }, [getMaterials, searchText, selectedTopology, bandGapRange]);

  const allMaterials = useMemo(() => {
    const fromStore = getMaterials();
    const storeIds = new Set(fromStore.map(m => m.id));
    const uniqueMockMaterials = mockMaterials.filter(m => !storeIds.has(m.id));
    return [...fromStore, ...uniqueMockMaterials].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [getMaterials]);

  const filteredMaterials = useMemo(() => {
    return allMaterials.filter((m) => {
      if (searchText && !m.formula.toLowerCase().includes(searchText.toLowerCase())) return false;
      const sgMatch = m.spaceGroup.match(/\((\d+)\)/);
      const sgNum = sgMatch ? parseInt(sgMatch[1]) : 0;
      if (sgNum < spaceGroupRange[0] || sgNum > spaceGroupRange[1]) return false;
      if (selectedTopology.length > 0) {
        const tl = getTopologyLabel(m.topologyClass).label;
        const map: Record<string, string> = { 平庸: 'trivial', 弱拓扑: 'weak', 强拓扑: 'strong', 晶体拓扑: 'crystalline' };
        if (!selectedTopology.includes(map[tl] || 'trivial')) return false;
      }
      if (m.bandGap < bandGapRange[0] || m.bandGap > bandGapRange[1]) return false;
      return true;
    });
  }, [allMaterials, searchText, spaceGroupRange, selectedTopology, bandGapRange]);

  const histogramData = useMemo(() => {
    const bins = [0, 0.2, 0.5, 0.8, 1.2, 1.6, 2.0, 2.5, 3.0];
    const counts = new Array(bins.length - 1).fill(0);
    allMaterials.forEach((m) => {
      for (let i = 0; i < bins.length - 1; i++) {
        if (m.bandGap >= bins[i] && m.bandGap < bins[i + 1]) {
          counts[i]++;
          break;
        }
      }
    });
    return counts.map((c, i) => ({ range: `${bins[i]}-${bins[i + 1]}`, count: c }));
  }, [allMaterials]);

  const strongCount = allMaterials.filter((m) => getTopologyLabel(m.topologyClass).idx >= 2).length;

  const toggleTopology = (v: string) => {
    setSelectedTopology((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const resetFilters = () => {
    setSearchText('');
    setSpaceGroupRange([1, 230]);
    setSelectedTopology([]);
    setBandGapRange([0, 3]);
  };

  const handleCardClick = (m: MaterialArchive) => {
    alert(`材料详情: ${m.formula}\n拓扑分类: ${m.topologyClass}\nZ2不变量: ${m.z2Invariant}\n来源任务: ${m.sourceTaskId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-7 h-7 text-primary" />
          材料数据库
        </h1>
        <span className="text-sm text-slate-400">共 {filteredMaterials.length} / {allMaterials.length} 条记录</span>
      </div>

      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">分子式 / 材料名</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="输入 Bi2Se3, Na3Bi..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">空间群编号范围</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} max={230} value={spaceGroupRange[0]}
                onChange={(e) => setSpaceGroupRange([Math.max(1, +e.target.value), spaceGroupRange[1]])}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
              />
              <span className="text-slate-500 text-xs">~</span>
              <input
                type="number" min={1} max={230} value={spaceGroupRange[1]}
                onChange={(e) => setSpaceGroupRange([spaceGroupRange[0], Math.min(230, +e.target.value)])}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">拓扑分类（多选）</label>
            <div className="flex flex-wrap gap-1.5">
              {topologyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleTopology(opt.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs border transition-all',
                    selectedTopology.includes(opt.value)
                      ? opt.color + ' shadow-sm'
                      : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:border-slate-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">带隙范围 (eV): {bandGapRange[0]} - {bandGapRange[1]}</label>
            <div className="space-y-1.5 pt-1">
              <input
                type="range" min={0} max={3} step={0.1} value={bandGapRange[0]}
                onChange={(e) => setBandGapRange([Math.min(+e.target.value, bandGapRange[1]), bandGapRange[1]])}
                className="w-full accent-cyan-500"
              />
              <input
                type="range" min={0} max={3} step={0.1} value={bandGapRange[1]}
                onChange={(e) => setBandGapRange([bandGapRange[0], Math.max(+e.target.value, bandGapRange[0])])}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-700/40">
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-800/70 border border-slate-700 hover:bg-slate-700/70 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
          <button className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium text-slate-900 bg-gradient-primary hover:shadow-glow-cyan transition-all">
            <Search className="w-4 h-4" /> 搜索
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
          <p className="text-sm text-slate-400 mb-2">材料总数</p>
          <p className="text-3xl font-bold text-white">{allMaterials.length}</p>
          <p className="text-xs text-slate-500 mt-2">已验证 {allMaterials.filter((m) => m.isVerified).length} 种</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow-cyan opacity-40" />
          <p className="text-sm text-slate-400 mb-2 relative">强拓扑材料数</p>
          <p className="text-3xl font-bold text-primary relative">{strongCount}</p>
          <p className="text-xs text-slate-500 mt-2 relative">占比 {((strongCount / allMaterials.length) * 100).toFixed(1)}%</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
          <p className="text-sm text-slate-400 mb-2">带隙分布直方图</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {histogramData.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? '#22D3EE' : i < 5 ? '#0891B2' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((m) => {
          const tl = getTopologyLabel(m.topologyClass);
          const topoColor = topologyOptions[tl.idx].color;
          const sgMatch = m.spaceGroup.match(/^(.*?)\s*\((\d+)\)/);
          const sgName = sgMatch?.[1] || m.spaceGroup;
          const sgNum = sgMatch?.[2] || '';
          const expanded = expandedId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => handleCardClick(m)}
              className="group p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/40 hover:shadow-card-hover transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold bg-gradient-mixed bg-clip-text text-transparent">{m.formula}</h3>
                {m.isVerified && (
                  <span className="px-2 py-0.5 rounded text-xs bg-success/15 text-success border border-success/30">已验证</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                  {sgName} <span className="text-primary font-mono">#{sgNum}</span>
                </span>
                <span className={cn('px-2 py-1 rounded-md text-xs border', topoColor)}>{tl.label}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> 带隙
                  </span>
                  <span className="text-white font-mono">
                    {m.bandGap.toFixed(3)} eV
                    <span className={cn('ml-1.5 text-xs', isDirectGap(m.formula) ? 'text-success' : 'text-warning')}>
                      {isDirectGap(m.formula) ? '直接' : '间接'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Z₂ 不变量</span>
                  <span className="text-secondary font-mono text-xs">{String(m.z2Invariant)}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(m.createdAt, 'short')}</span>
                <span className="flex items-center gap-1">
                  <Quote className="w-3 h-3" /> 引用 <span className="text-white font-medium">{m.citations}</span>
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedId(expanded ? null : m.id); }}
                className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? '收起' : '更多信息'}
              </button>
              {expanded && (
                <div className="mt-3 pt-3 border-t border-slate-700/40 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">分类体系</span><span className="text-slate-300">{m.classification}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">归档人</span><span className="text-slate-300">{m.archivedByName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">来源任务</span><span className="text-primary font-mono">{m.sourceTaskId}</span></div>
                  {m.doi && <div className="flex justify-between"><span className="text-slate-500">DOI</span><span className="text-info font-mono text-xs">{m.doi}</span></div>}
                </div>
              )}
            </div>
          );
        })}
        {filteredMaterials.length === 0 && (
          <div className="col-span-full p-12 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center text-slate-500">
            暂无符合筛选条件的材料
          </div>
        )}
      </div>
    </div>
  );
}
