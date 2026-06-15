import { useState, useMemo } from 'react';
import {
  FileText, Download, Filter, Calendar, ChevronRight, Check,
  FileJson, FileSpreadsheet, Database, History, Eye, Plus, Trash2,
  Settings2, Layers, Grid3x3, Sparkles, Info
} from 'lucide-react';
import { mockTasks, mockMaterials, mockUsers } from '../data/mockData';
import { cn, formatDate } from '../lib/utils';

type ReportTabType = 'pdf' | 'export';

const materialSystems = ['全部', 'V-VI族', 'I-V族', 'II-V族', 'V族', '赫斯勒', '过渡金属硫族', '铁基', '其他'];
const spaceGroups = ['全部', 'R-3m (166)', 'P63/mmc (194)', 'F-43m (216)', 'Fm-3m (225)', 'I41/acd (142)', 'I41md (109)', '其他'];
const gapTypes = ['全部', '直接带隙', '间接带隙', '零带隙(半金属)'];
const topologyClasses = ['全部', '强拓扑', '弱拓扑', '晶体拓扑', '平庸', '半金属'];

const exportFields = [
  { key: 'band_structure', label: '能带结构数据', icon: Layers },
  { key: 'dos', label: '态密度 (DOS)', icon: Sparkles },
  { key: 'z2', label: 'Z₂ 拓扑不变量', icon: Info },
  { key: 'surface_states', label: '表面态谱', icon: Grid3x3 },
  { key: 'convergence', label: '收敛日志', icon: Settings2 },
  { key: 'crystal', label: '晶体结构 (CIF)', icon: Database },
  { key: 'params', label: '计算参数', icon: Settings2 },
  { key: 'topology', label: '拓扑分类结果', icon: Sparkles },
];

const exportFormats = [
  { key: 'csv', label: 'CSV 表格', icon: FileSpreadsheet, desc: '通用电子表格格式' },
  { key: 'json', label: 'JSON', icon: FileJson, desc: '结构化数据交换' },
  { key: 'vaspkit', label: 'VASPKIT', icon: Database, desc: 'VASPKIT 输入格式' },
];

const exportHistory = [
  { id: 'exp-1', name: 'Bi2Se3系列_全量数据', format: 'JSON', size: '2.4 MB', fields: 6, date: '2026-06-14 15:32', status: '完成' },
  { id: 'exp-2', name: '狄拉克半金属汇总', format: 'CSV', size: '856 KB', fields: 4, date: '2026-06-12 10:18', status: '完成' },
  { id: 'exp-3', name: '拓扑材料月度报告', format: 'VASPKIT', size: '5.8 MB', fields: 8, date: '2026-06-01 08:45', status: '完成' },
  { id: 'exp-4', name: 'Weyl半金属专题', format: 'JSON', size: '3.2 MB', fields: 5, date: '2026-05-28 19:22', status: '已过期' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTabType>('pdf');
  const [system, setSystem] = useState('全部');
  const [sg, setSg] = useState('全部');
  const [gapType, setGapType] = useState('全部');
  const [topoClass, setTopoClass] = useState('全部');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>(['band_structure', 'dos', 'z2', 'params']);
  const [selectedFormat, setSelectedFormat] = useState('csv');

  const completedTasks = useMemo(() => {
    return mockTasks.filter((t) => t.status === 'completed' || t.status === 'pending_supervisor_approval' || t.status === 'pending_phd_approval');
  }, []);

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleField = (key: string) => {
    setSelectedFields((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" />
          报告与导出
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-5 space-y-5 sticky top-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Filter className="w-4 h-4 text-primary" /> 筛选条件
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">材料体系</label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
              >
                {materialSystems.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">空间群</label>
              <select
                value={sg}
                onChange={(e) => setSg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
              >
                {spaceGroups.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">带隙类型</label>
              <select
                value={gapType}
                onChange={(e) => setGapType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
              >
                {gapTypes.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">拓扑分类</label>
              <select
                value={topoClass}
                onChange={(e) => setTopoClass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
              >
                {topologyClasses.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> 日期范围
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>
            <button className="w-full py-2 rounded-lg text-sm text-slate-300 bg-slate-800/70 border border-slate-700 hover:bg-slate-700/70 transition-colors">
              应用筛选
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <div className="flex border-b border-slate-700/50">
              {[
                { key: 'pdf', label: 'PDF 报告预览', icon: FileText },
                { key: 'export', label: '数据导出', icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as ReportTabType)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative',
                      active ? 'text-primary' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                    {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'pdf' ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white">选择任务 (已选 {selectedTasks.length})</h3>
                      <button
                        onClick={() => setSelectedTasks(completedTasks.slice(0, 5).map((t) => t.id))}
                        className="text-xs text-primary hover:text-cyan-300"
                      >
                        快速选择前5个
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {completedTasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => toggleTask(t.id)}
                          className={cn(
                            'p-3 rounded-lg text-left transition-all border',
                            selectedTasks.includes(t.id)
                              ? 'bg-primary/10 border-primary/40'
                              : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                          )}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-white font-semibold">{t.formula}</span>
                            {selectedTasks.includes(t.id) && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{t.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-white">报告预览</span>
                      </div>
                      <div className="aspect-[3/4] bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg shadow-lg flex items-center justify-center">
                        {selectedTasks.length > 0 ? (
                          <div className="text-center p-6 text-slate-700 w-full">
                            <p className="font-bold text-lg mb-4">拓扑材料计算报告</p>
                            <p className="text-xs text-slate-500 mb-6">生成日期: {formatDate(new Date().toISOString(), 'short')}</p>
                            <div className="text-left text-xs space-y-2 px-4">
                              <p>• 包含任务数: {selectedTasks.length}</p>
                              <p>• 材料体系: {system}</p>
                              <p>• 拓扑分类: {topoClass}</p>
                              <p>• 带隙类型: {gapType}</p>
                              <div className="mt-4 pt-4 border-t border-slate-300">
                                <p className="font-semibold mb-2">摘要统计:</p>
                                <p>总拓扑材料: {mockMaterials.length} 种</p>
                                <p>平均带隙: {(mockMaterials.reduce((s, m) => s + m.bandGap, 0) / mockMaterials.length).toFixed(3)} eV</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">选择任务以生成预览</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                        <h4 className="text-sm font-medium text-white mb-3">报告设置</h4>
                        <div className="space-y-3 text-xs">
                          <label className="flex items-center justify-between text-slate-300">
                            <span>包含封面</span>
                            <input type="checkbox" defaultChecked className="accent-cyan-500" />
                          </label>
                          <label className="flex items-center justify-between text-slate-300">
                            <span>能带结构图</span>
                            <input type="checkbox" defaultChecked className="accent-cyan-500" />
                          </label>
                          <label className="flex items-center justify-between text-slate-300">
                            <span>态密度图</span>
                            <input type="checkbox" defaultChecked className="accent-cyan-500" />
                          </label>
                          <label className="flex items-center justify-between text-slate-300">
                            <span>拓扑分析结果</span>
                            <input type="checkbox" defaultChecked className="accent-cyan-500" />
                          </label>
                          <label className="flex items-center justify-between text-slate-300">
                            <span>收敛曲线</span>
                            <input type="checkbox" className="accent-cyan-500" />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button
                          disabled={selectedTasks.length === 0}
                          className="w-full py-3 rounded-lg text-sm font-medium text-slate-900 bg-gradient-primary hover:shadow-glow-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 inline mr-1" /> 生成 PDF 报告
                        </button>
                        <button
                          disabled={selectedTasks.length === 0}
                          className="w-full py-3 rounded-lg text-sm font-medium text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-4 h-4" /> 下载报告
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3">选择导出字段 ({selectedFields.length}/{exportFields.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {exportFields.map((f) => {
                        const Icon = f.icon;
                        const selected = selectedFields.includes(f.key);
                        return (
                          <button
                            key={f.key}
                            onClick={() => toggleField(f.key)}
                            className={cn(
                              'p-3 rounded-lg text-left transition-all border',
                              selected
                                ? 'bg-primary/10 border-primary/40'
                                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={cn('w-4 h-4', selected ? 'text-primary' : 'text-slate-500')} />
                              <span className={cn('text-xs font-medium', selected ? 'text-white' : 'text-slate-300')}>{f.label}</span>
                              {selected && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white mb-3">选择导出格式</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {exportFormats.map((f) => {
                        const Icon = f.icon;
                        const selected = selectedFormat === f.key;
                        return (
                          <button
                            key={f.key}
                            onClick={() => setSelectedFormat(f.key)}
                            className={cn(
                              'p-4 rounded-lg text-left transition-all border',
                              selected
                                ? 'bg-secondary/10 border-secondary/40'
                                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={cn('w-6 h-6 flex-shrink-0', selected ? 'text-secondary' : 'text-slate-500')} />
                              <div>
                                <p className={cn('text-sm font-medium', selected ? 'text-white' : 'text-slate-300')}>{f.label}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      disabled={selectedFields.length === 0}
                      className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-900 bg-gradient-secondary hover:shadow-glow-purple transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> 立即导出
                    </button>
                    <span className="text-xs text-slate-500">
                      将导出 {completedTasks.length} 个任务的 {selectedFields.length} 类数据
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-700/40">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-slate-400" />
                      <h3 className="text-sm font-medium text-white">历史导出记录</h3>
                    </div>
                    <div className="space-y-2">
                      {exportHistory.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{h.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {h.format} · {h.fields} 个字段 · {h.size} · {h.date}
                            </p>
                          </div>
                          <span className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-medium',
                            h.status === '完成' ? 'bg-success/15 text-success' : 'bg-slate-700 text-slate-400'
                          )}>
                            {h.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
