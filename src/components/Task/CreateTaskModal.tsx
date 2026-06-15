import { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    title: string;
    formula: string;
    crystalStructure: any;
    calculationParams: any;
  }) => void;
}

type Step = 1 | 2 | 3;

const functionals = [
  { id: 'PBE', name: 'PBE', desc: '标准GGA泛函', recommended: true, confidence: 89 },
  { id: 'PBE+U', name: 'PBE+U', desc: '含Hubbard U校正', recommended: false },
  { id: 'HSE06', name: 'HSE06', desc: '杂化泛函，高精度', recommended: false },
  { id: 'meta-GGA', name: 'meta-GGA', desc: '含动能密度', recommended: false },
];

const pseudopotentials = [
  { id: 'PAW_PBE', name: 'PAW_PBE (推荐)' },
  { id: 'PAW_PW91', name: 'PAW_PW91' },
  { id: 'USPP_LDA', name: 'USPP_LDA' },
  { id: 'NCPP_PBE', name: 'NCPP_PBE' },
];

const steps = [
  { id: 1, label: '上传结构文件' },
  { id: 2, label: '结构校验结果' },
  { id: 3, label: '计算参数配置' },
];

export default function CreateTaskModal({ open, onClose, onSubmit }: CreateTaskModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [formula, setFormula] = useState('');

  const [functional, setFunctional] = useState('PBE');
  const [kpointA, setKpointA] = useState(12);
  const [kpointB, setKpointB] = useState(12);
  const [kpointC, setKpointC] = useState(6);
  const [cutoffEnergy, setCutoffEnergy] = useState(500);
  const [pseudopotential, setPseudopotential] = useState('PAW_PBE');
  const [forceThreshold, setForceThreshold] = useState(0.001);
  const [energyThreshold, setEnergyThreshold] = useState('1e-8');
  const [spinPolarized, setSpinPolarized] = useState(false);
  const [socEnabled, setSocEnabled] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setUploadedFile(null);
      setTitle('');
      setFormula('');
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'cif' || ext === 'vasp' || ext === 'poscar' || file.name.toLowerCase() === 'poscar') {
        setUploadedFile(file);
        const nameWithoutExt = file.name.replace(/\.(cif|vasp|poscar)$/i, '');
        if (!title) setTitle(nameWithoutExt + ' 第一性原理计算');
        if (!formula) {
          const m = nameWithoutExt.match(/([A-Z][a-z]?\d*)+/g);
          if (m) setFormula(m.join(''));
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      const nameWithoutExt = file.name.replace(/\.(cif|vasp|poscar)$/i, '');
      if (!title) setTitle(nameWithoutExt + ' 第一性原理计算');
      if (!formula) {
        const m = nameWithoutExt.match(/([A-Z][a-z]?\d*)+/g);
        if (m) setFormula(m.join(''));
      }
    }
  };

  const canNextStep1 = uploadedFile !== null;
  const canNextStep2 = true;
  const canSubmit = functional && kpointA > 0 && kpointB > 0 && kpointC > 0 && cutoffEnergy >= 300;

  const handleSubmit = () => {
    onSubmit?.({
      title: title || uploadedFile?.name?.replace(/\.(cif|vasp|poscar)$/i, '') || '未命名任务',
      formula: formula || '未知',
      crystalStructure: {
        formula: formula || 'Bi2Se3',
        spaceGroup: 'R-3m',
        spaceGroupNumber: 166,
        latticeParams: { a: 4.14, b: 4.14, c: 28.64, alpha: 90, beta: 90, gamma: 120 },
        atoms: [],
        validationResult: {
          isValid: true,
          issues: [],
          warnings: ['原子坐标已标准化'],
          symmetryChecked: true,
          stoichiometryVerified: true,
        },
      },
      calculationParams: {
        functional,
        kpointMesh: [kpointA, kpointB, kpointC],
        cutoffEnergy,
        pseudopotential,
        forceThreshold,
        energyThreshold: parseFloat(energyThreshold),
        spinPolarized,
        socEnabled,
      },
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl shadow-cyan-500/5 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-mixed flex items-center justify-center shadow-glow-cyan">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">创建计算任务</h2>
              <p className="text-xs text-slate-400">步骤 {step} / 3 · {steps[step - 1].label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center',
              'bg-slate-800/60 text-slate-400 border border-slate-700/50',
              'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all',
                      step > s.id
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : step === s.id
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-glow-cyan'
                          : 'bg-slate-800/60 text-slate-500 border-slate-700/50'
                    )}
                  >
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors',
                      step >= s.id ? 'text-white' : 'text-slate-500'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-px bg-gradient-to-r from-slate-700/80 to-slate-700/30" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300',
                  dragOver
                    ? 'border-cyan-500/60 bg-cyan-500/10 shadow-glow-cyan'
                    : 'border-slate-700/60 bg-slate-800/30 hover:border-cyan-500/40 hover:bg-slate-800/50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".cif,.vasp,POSCAR,.poscar"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
                      dragOver
                        ? 'bg-cyan-500/20 shadow-glow-cyan'
                        : 'bg-slate-800/80 border border-slate-700/50'
                    )}
                  >
                    <Upload className={cn('w-8 h-8', dragOver ? 'text-cyan-400' : 'text-slate-400')} />
                  </div>
                  <div>
                    <p className={cn('font-medium', dragOver ? 'text-cyan-400' : 'text-white')}>
                      拖拽文件到此处，或点击选择
                    </p>
                    <p className="text-sm text-slate-400 mt-1">支持 CIF / POSCAR / VASP 格式</p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB · 已就绪
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-800/60 text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-slate-700/50 flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">任务标题</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="如：Bi2Se3拓扑绝缘体第一性原理计算"
                    className="w-full h-10 px-4 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">分子式</label>
                  <input
                    type="text"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    placeholder="如：Bi2Se3"
                    className="w-full h-10 px-4 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-white font-semibold">空间群识别结果</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-slate-900/60 p-4 border border-slate-700/40">
                    <p className="text-xs text-slate-400 mb-1">空间群符号</p>
                    <p className="text-xl font-bold text-cyan-400 font-mono">R-3m</p>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 p-4 border border-slate-700/40">
                    <p className="text-xs text-slate-400 mb-1">国际编号</p>
                    <p className="text-xl font-bold text-white">#166</p>
                  </div>
                  <div className="rounded-lg bg-slate-900/60 p-4 border border-slate-700/40">
                    <p className="text-xs text-slate-400 mb-1">晶系</p>
                    <p className="text-xl font-bold text-purple-400">三方晶系</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-white font-semibold">原子占位校验</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
                    <span className="text-slate-300">化学计量比</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Bi:Se = 2:3
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
                    <span className="text-slate-300">Wyckoff位置</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> 位置匹配
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
                    <span className="text-slate-300">对称性一致性</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> 验证通过
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
                    <span className="text-slate-300">原子总数</span>
                    <span className="text-white font-medium font-mono">5 个原子</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-amber-300 font-semibold">警告提示</h3>
                </div>
                <ul className="space-y-2 text-sm text-amber-200/90">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span>原子坐标已标准化至原胞，如需使用超胞请手动设置扩展</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span>该结构存在较重元素（Bi, Se），建议开启自旋轨道耦合（SOC）</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">结构校验通过</p>
                  <p className="text-sm text-slate-400">所有关键校验项已通过，可进入下一步配置计算参数</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-300">交换关联泛函</label>
                  <div className="flex items-center gap-1 text-xs text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    AI 智能推荐
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {functionals.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFunctional(f.id)}
                      className={cn(
                        'relative text-left rounded-xl border p-4 transition-all duration-200',
                        functional === f.id
                          ? f.recommended
                            ? 'border-cyan-500/50 bg-cyan-500/10 shadow-glow-cyan'
                            : 'border-slate-500/50 bg-slate-700/30'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/60',
                        f.recommended && 'ring-1 ring-cyan-500/20'
                      )}
                    >
                      {f.recommended && (
                        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-mixed text-white text-xs font-medium shadow-glow-cyan">
                          <Sparkles className="w-3 h-3" />
                          推荐 {f.confidence}%
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'font-semibold',
                            functional === f.id ? 'text-white' : 'text-slate-200'
                          )}
                        >
                          {f.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">K 点网格</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'kx', val: kpointA, set: setKpointA, rec: 12 },
                    { label: 'ky', val: kpointB, set: setKpointB, rec: 12 },
                    { label: 'kz', val: kpointC, set: setKpointC, rec: 6 },
                  ].map((k) => (
                    <div key={k.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-400">{k.label}</span>
                        <span className="text-xs text-cyan-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          推荐 {k.rec}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={k.val}
                        onChange={(e) => k.set(parseInt(e.target.value) || 1)}
                        className={cn(
                          'w-full h-10 px-4 rounded-lg bg-slate-800/60 border text-sm text-white focus:outline-none focus:ring-2 transition-all font-mono',
                          k.val === k.rec
                            ? 'border-cyan-500/50 focus:ring-cyan-500/30 bg-cyan-500/5'
                            : 'border-slate-700/50 focus:ring-cyan-500/30 focus:border-cyan-500/50'
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-300">
                    平面波截断能
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      推荐 500
                    </span>
                    <span className="text-sm font-mono font-semibold text-white">
                      {cutoffEnergy} eV
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={300}
                  max={800}
                  step={10}
                  value={cutoffEnergy}
                  onChange={(e) => setCutoffEnergy(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-cyan-500 bg-slate-800"
                  style={{
                    background: `linear-gradient(to right, #22D3EE 0%, #22D3EE ${((cutoffEnergy - 300) / 500) * 100}%, #1e293b ${((cutoffEnergy - 300) / 500) * 100}%, #1e293b 100%)`,
                  }}
                />
                <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                  <span>300 eV</span>
                  <span>550 eV</span>
                  <span>800 eV</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    赝势类型
                  </label>
                  <select
                    value={pseudopotential}
                    onChange={(e) => setPseudopotential(e.target.value)}
                    className="w-full h-10 px-4 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                  >
                    {pseudopotentials.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    能量收敛阈值
                  </label>
                  <input
                    type="text"
                    value={energyThreshold}
                    onChange={(e) => setEnergyThreshold(e.target.value)}
                    className="w-full h-10 px-4 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    力收敛阈值 (eV/Å)
                  </label>
                  <input
                    type="number"
                    step={0.0001}
                    value={forceThreshold}
                    onChange={(e) => setForceThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-4 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all font-mono"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2.5 h-10 px-4 rounded-lg bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:border-slate-600/60 transition-all">
                    <input
                      type="checkbox"
                      checked={spinPolarized}
                      onChange={(e) => setSpinPolarized(e.target.checked)}
                      className="w-4 h-4 rounded accent-cyan-500 bg-slate-700 border-slate-600"
                    />
                    <span className="text-sm text-slate-300">自旋极化</span>
                  </label>
                  <label className="flex items-center gap-2.5 h-10 px-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={socEnabled}
                      onChange={(e) => setSocEnabled(e.target.checked)}
                      className="w-4 h-4 rounded accent-cyan-500 bg-slate-700 border-slate-600"
                    />
                    <span className="text-sm text-cyan-300 flex items-center gap-1">
                      SOC
                      <Zap className="w-3 h-3" />
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-200/90 leading-relaxed">
                  <p className="font-medium text-cyan-300 mb-1">AI 参数推荐说明</p>
                  <p>
                    根据该体系包含 Bi、Se 等高原子序数元素，以及目标研究拓扑绝缘体性质，
                    系统推荐使用 PBE 泛函配合高截断能，并自动开启 SOC 以正确描述自旋轨道耦合效应。
                    如需更高精度，可考虑切换至 HSE06 杂化泛函。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-900/80">
          <button
            onClick={() => step > 1 && setStep((step - 1) as Step)}
            disabled={step === 1}
            className={cn(
              'inline-flex items-center gap-1.5 h-10 px-5 rounded-lg text-sm font-medium transition-all',
              step === 1
                ? 'text-slate-600 bg-slate-800/40 border border-slate-700/40 cursor-not-allowed'
                : 'text-slate-300 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            上一步
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center h-10 px-5 rounded-lg text-sm font-medium text-slate-300 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 transition-all"
            >
              取消
            </button>
            {step < 3 ? (
              <button
                onClick={() =>
                  (step === 1 && canNextStep1) || (step === 2 && canNextStep2)
                    ? setStep((step + 1) as Step)
                    : null
                }
                disabled={(step === 1 && !canNextStep1) || (step === 2 && !canNextStep2)}
                className={cn(
                  'inline-flex items-center gap-1.5 h-10 px-5 rounded-lg text-sm font-semibold transition-all',
                  (step === 1 && !canNextStep1) || (step === 2 && !canNextStep2)
                    ? 'bg-slate-700/60 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-mixed text-white shadow-glow-cyan hover:shadow-glow-cyan-lg'
                )}
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  'inline-flex items-center gap-1.5 h-10 px-6 rounded-lg text-sm font-semibold transition-all',
                  !canSubmit
                    ? 'bg-slate-700/60 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-mixed text-white shadow-glow-purple hover:shadow-glow-purple-lg'
                )}
              >
                <Sparkles className="w-4 h-4" />
                提交任务
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
