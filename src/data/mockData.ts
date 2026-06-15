import type {
  User,
  ComputationTask,
  MaterialArchive,
  DashboardStats,
  Notification,
  ApprovalRecord,
  BandStructureData,
  DOSData,
  ConvergenceLog,
  CrystalStructure,
  CalculationParams,
  TopologyResult,
} from '../types';

export const researchGroups = [
  { id: 'group-1', name: '拓扑量子材料研究组', institution: '凝聚态物理国家重点实验室' },
  { id: 'group-2', name: '先进功能材料研究组', institution: '材料科学与工程学院' },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'liuxiaoming',
    email: 'liuxiaoming@lab.edu.cn',
    realName: '刘小明',
    role: 'phd_student',
    groupId: 'group-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liuxiaoming',
    createdAt: '2024-09-01T08:00:00Z',
    lastLoginAt: '2026-06-15T09:30:00Z',
  },
  {
    id: 'user-2',
    username: 'wangsupervisor',
    email: 'wangprofessor@lab.edu.cn',
    realName: '王建国',
    role: 'supervisor',
    groupId: 'group-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangprofessor',
    createdAt: '2020-03-15T10:00:00Z',
    lastLoginAt: '2026-06-14T17:45:00Z',
  },
  {
    id: 'user-3',
    username: 'chenchief',
    email: 'chenchief@lab.edu.cn',
    realName: '陈思远',
    role: 'chief_scientist',
    groupId: 'group-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenchief',
    createdAt: '2018-01-10T09:00:00Z',
    lastLoginAt: '2026-06-15T08:15:00Z',
  },
  {
    id: 'user-4',
    username: 'admin01',
    email: 'admin@lab.edu.cn',
    realName: '系统管理员',
    role: 'admin',
    groupId: 'group-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin01',
    createdAt: '2017-06-01T12:00:00Z',
    lastLoginAt: '2026-06-15T10:00:00Z',
  },
];

function generateBandStructureData(numBands: number = 10, inverted: boolean = true): BandStructureData[] {
  const numKpoints = 80;
  const labels = [
    { k: 0, label: 'Γ' },
    { k: 27, label: 'X' },
    { k: 54, label: 'M' },
    { k: 79, label: 'Γ' },
  ];
  const bands: BandStructureData[] = [];
  for (let b = 0; b < numBands; b++) {
    const points = [];
    const baseEnergy = (b - numBands / 2) * 1.5;
    for (let k = 0; k < numKpoints; k++) {
      const path1 = k < 27;
      const path2 = k >= 27 && k < 54;
      const path3 = k >= 54;
      let wave = 0;
      if (path1) {
        const t = k / 27;
        wave = Math.sin(t * Math.PI) * 0.8;
      } else if (path2) {
        const t = (k - 27) / 27;
        wave = Math.sin(t * Math.PI) * 0.6;
      } else {
        const t = (k - 54) / 25;
        wave = Math.sin(t * Math.PI) * 0.7;
      }
      let eigenvalue = baseEnergy + wave + Math.sin(k * 0.3 + b) * 0.2;
      if (inverted && (b === 4 || b === 5)) {
        if (b === 4) eigenvalue = baseEnergy + 0.3 + wave * 0.5;
        else eigenvalue = baseEnergy - 0.3 - wave * 0.5;
      }
      const labelInfo = labels.find((l) => l.k === k);
      points.push({
        kpoint: k,
        label: labelInfo?.label,
        eigenvalue: Number(eigenvalue.toFixed(4)),
      });
    }
    bands.push({ bandIndex: b, points });
  }
  return bands;
}

function generateDOSData(): DOSData[] {
  const data: DOSData[] = [];
  for (let e = -60; e <= 60; e++) {
    const energy = e / 10;
    const fermiShape = 1 / (1 + Math.exp(-(energy - 0.5) * 2));
    const base = Math.exp(-Math.pow(energy, 2) / 18) * 3.5 + fermiShape * 2;
    const s = base * 0.2 + Math.abs(Math.sin(energy * 1.5)) * 0.3;
    const p = base * 0.5 + Math.abs(Math.cos(energy * 1.2)) * 0.4;
    const d = base * 0.3 + Math.abs(Math.sin(energy * 0.8 + 1)) * 0.5;
    data.push({
      energy,
      total: Number((s + p + d).toFixed(4)),
      s: Number(s.toFixed(4)),
      p: Number(p.toFixed(4)),
      d: Number(d.toFixed(4)),
    });
  }
  return data;
}

function generateSurfaceStates(): number[][] {
  const size = 100;
  const matrix: number[][] = [];
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      const cx = size / 2;
      const cy = size / 2;
      const dx = (x - cx) / (size / 2);
      const dy = (y - cy) / (size / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const arc1 = Math.exp(-Math.pow(dist - 0.4, 2) / 0.02) * 2;
      const arc2 = Math.exp(-Math.pow(dist - 0.75, 2) / 0.015) * 1.5;
      const noise = Math.random() * 0.08;
      const val = Math.min(3, arc1 + arc2 + noise);
      row.push(Number(val.toFixed(3)));
    }
    matrix.push(row);
  }
  return matrix;
}

function generateConvergenceLogs(adjustment: boolean = true): ConvergenceLog[] {
  const logs: ConvergenceLog[] = [];
  let energy = -1234.5;
  let maxForce = 2.5;
  const baseTime = new Date('2026-06-10T08:00:00Z').getTime();
  for (let step = 1; step <= 25; step++) {
    energy += step < 10 ? -Math.random() * 0.5 : -Math.random() * 0.05;
    maxForce = Math.max(0.001, maxForce * (step < 12 ? 0.85 : 0.92));
    const stress = [
      [0.1 + Math.random() * 0.05, -0.02 + Math.random() * 0.01, 0.01],
      [-0.02 + Math.random() * 0.01, 0.08 + Math.random() * 0.04, -0.01],
      [0.01, -0.01, 0.12 + Math.random() * 0.03],
    ];
    const log: ConvergenceLog = {
      step,
      energy: Number(energy.toFixed(6)),
      maxForce: Number(maxForce.toFixed(6)),
      stressTensor: stress.map((r) => r.map((v) => Number(v.toFixed(5)))),
      timestamp: new Date(baseTime + step * 120000).toISOString(),
    };
    if (adjustment && step === 8) {
      log.paramAdjustment = {
        type: 'cutoff_energy',
        oldValue: 400,
        newValue: 500,
        reason: '电荷密度波动较大，增加截断能量以提高精度',
      };
    }
    logs.push(log);
  }
  return logs;
}

function createCrystalStructure(formula: string, sg: string, sgn: number, params: any, atoms: any[]): CrystalStructure {
  return {
    formula,
    spaceGroup: sg,
    spaceGroupNumber: sgn,
    latticeParams: params,
    atoms: atoms.map((a) => ({
      element: a.element,
      x: a.x,
      y: a.y,
      z: a.z,
      label: `${a.element}${a.idx}`,
    })),
    validationResult: {
      isValid: true,
      issues: [],
      warnings: ['原子坐标已标准化'],
      symmetryChecked: true,
      stoichiometryVerified: true,
    },
  };
}

function createCalculationParams(overrides: Partial<CalculationParams> = {}): CalculationParams {
  return {
    functional: 'PBE',
    kpointMesh: [12, 12, 6],
    cutoffEnergy: 500,
    pseudopotential: 'PAW_PBE',
    forceThreshold: 0.001,
    energyThreshold: 1e-8,
    spinPolarized: false,
    socEnabled: true,
    ...overrides,
  };
}

function createTopologyResult(inversion: boolean, z2: any, tclass: string, gap: number): TopologyResult {
  return {
    bandInversion: inversion,
    z2Invariant: z2,
    topologyClass: tclass,
    surfaceStates: generateSurfaceStates(),
    bandGap: gap,
    fermiLevel: 0.0,
    bandStructureData: generateBandStructureData(12, inversion),
    dosData: generateDOSData(),
  };
}

const bi2se3Crystal = createCrystalStructure(
  'Bi2Se3',
  'R-3m',
  166,
  { a: 4.14, b: 4.14, c: 28.64, alpha: 90, beta: 90, gamma: 120 },
  [
    { element: 'Bi', x: 0, y: 0, z: 0.399, idx: 1 },
    { element: 'Bi', x: 0, y: 0, z: 0.101, idx: 2 },
    { element: 'Se', x: 0, y: 0, z: 0.5, idx: 1 },
    { element: 'Se', x: 0, y: 0, z: 0.206, idx: 2 },
    { element: 'Se', x: 0, y: 0, z: 0.794, idx: 3 },
  ]
);

const na3biCrystal = createCrystalStructure(
  'Na3Bi',
  'P63/mmc',
  194,
  { a: 5.45, b: 5.45, c: 9.65, alpha: 90, beta: 90, gamma: 120 },
  [
    { element: 'Na', x: 1/3, y: 2/3, z: 0.25, idx: 1 },
    { element: 'Na', x: 2/3, y: 1/3, z: 0.75, idx: 2 },
    { element: 'Na', x: 0, y: 0, z: 0.5, idx: 3 },
    { element: 'Bi', x: 0, y: 0, z: 0, idx: 1 },
  ]
);

const cd3as2Crystal = createCrystalStructure(
  'Cd3As2',
  'I41/acd',
  142,
  { a: 12.66, b: 12.66, c: 25.43, alpha: 90, beta: 90, gamma: 90 },
  [
    { element: 'Cd', x: 0, y: 0.25, z: 0.125, idx: 1 },
    { element: 'Cd', x: 0.5, y: 0.25, z: 0.375, idx: 2 },
    { element: 'Cd', x: 0.25, y: 0, z: 0.125, idx: 3 },
    { element: 'As', x: 0, y: 0, z: 0.25, idx: 1 },
    { element: 'As', x: 0.5, y: 0, z: 0, idx: 2 },
  ]
);

const sbCrystal = createCrystalStructure(
  'Sb',
  'R-3m',
  166,
  { a: 4.31, b: 4.31, c: 11.27, alpha: 90, beta: 90, gamma: 120 },
  [{ element: 'Sb', x: 0, y: 0, z: 0.234, idx: 1 }]
);

const gapCrystal = createCrystalStructure(
  'GaP',
  'F-43m',
  216,
  { a: 5.45, b: 5.45, c: 5.45, alpha: 90, beta: 90, gamma: 90 },
  [
    { element: 'Ga', x: 0, y: 0, z: 0, idx: 1 },
    { element: 'P', x: 0.25, y: 0.25, z: 0.25, idx: 1 },
  ]
);

function generateApproval(id: string, taskId: string, type: 'phd' | 'supervisor', decision: 'approved' | 'rejected'): ApprovalRecord {
  const approver = type === 'phd' ? mockUsers[0] : mockUsers[1];
  return {
    id,
    taskId,
    type,
    approverId: approver.id,
    approverName: approver.realName,
    decision,
    comments: decision === 'approved'
      ? '计算结果符合预期，拓扑性质明显，同意提交归档。'
      : '收敛性需要进一步验证，建议增加SCF步骤重新计算。',
    createdAt: new Date(2026, 5, 12).toISOString(),
  };
}

export const mockApprovals: ApprovalRecord[] = [
  generateApproval('app-1', 'task-1', 'phd', 'approved'),
  generateApproval('app-2', 'task-1', 'supervisor', 'approved'),
  generateApproval('app-3', 'task-3', 'phd', 'approved'),
];

function createTask(
  id: string,
  title: string,
  description: string,
  formula: string,
  status: any,
  crystal: CrystalStructure,
  params: CalculationParams,
  progress: number,
  currentStep: string,
  tags: string[],
  hasResult: boolean = false,
  error?: string
): ComputationTask {
  const now = new Date();
  const created = new Date(now.getTime() - Math.random() * 30 * 86400000);
  const base: ComputationTask = {
    id,
    title,
    description,
    formula,
    status,
    creatorId: 'user-1',
    creatorName: '刘小明',
    groupId: 'group-1',
    crystalStructure: crystal,
    calculationParams: params,
    convergenceLogs: generateConvergenceLogs(),
    approvals: [],
    progress,
    currentStep,
    estimatedTimeRemaining: progress >= 100 ? '0分钟' : `${Math.ceil((100 - progress) * 1.5)}分钟`,
    createdAt: created.toISOString(),
    tags,
  };
  if (status === 'completed' || status === 'pending_phd_approval' || status === 'pending_supervisor_approval') {
    base.startedAt = new Date(created.getTime() + 3600000).toISOString();
    base.completedAt = new Date(created.getTime() + 86400000).toISOString();
  }
  if (hasResult) {
    base.topologyResult = createTopologyResult(
      true,
      formula === 'Bi2Se3' ? 1 : formula === 'Na3Bi' ? '(1;000)' : formula === 'Cd3As2' ? 'Dirac semimetal' : 0,
      formula === 'Bi2Se3' ? 'TI (3D)' : formula === 'Na3Bi' ? 'Dirac semimetal' : formula === 'Cd3As2' ? 'Dirac semimetal' : 'TI',
      formula === 'Bi2Se3' ? 0.3 : formula === 'Na3Bi' ? 0.0 : formula === 'Cd3As2' ? 0.0 : 0.15
    );
  }
  if (error) {
    base.errorMessage = error;
  }
  if (id === 'task-1') {
    base.approvals = [mockApprovals[0], mockApprovals[1]];
  }
  if (id === 'task-3') {
    base.approvals = [mockApprovals[2]];
  }
  return base;
}

export const mockTasks: ComputationTask[] = [
  createTask('task-1', 'Bi2Se3拓扑绝缘体第一性原理计算', '经典Bi2Se3拓扑绝缘体体系的全流程计算验证，包含自旋轨道耦合', 'Bi2Se3', 'completed', bi2se3Crystal, createCalculationParams(), 100, '计算完成', ['经典拓扑材料', '3D TI', 'SOC'], true),
  createTask('task-2', 'Na3Bi三维狄拉克半金属计算', 'Na3Bi狄拉克点能带拓扑及表面态研究', 'Na3Bi', 'completed', na3biCrystal, createCalculationParams({ socEnabled: true, kpointMesh: [15, 15, 8] }), 100, '计算完成', ['狄拉克半金属', '3D DSM'], true),
  createTask('task-3', 'Cd3As2高迁移率拓扑材料计算', 'Cd3As2高迁移率半导体的拓扑性质分析', 'Cd3As2', 'pending_supervisor_approval', cd3as2Crystal, createCalculationParams({ kpointMesh: [8, 8, 4] }), 100, '等待导师审批', ['高迁移率', '拓扑半金属'], true),
  createTask('task-4', 'Sb单层拓扑相变研究', 'Sb元素单层材料的拓扑相变与应力调控', 'Sb', 'pending_phd_approval', sbCrystal, createCalculationParams({ spinPolarized: false }), 100, '等待博士生自审', ['二维材料', '相变'], true),
  createTask('task-5', 'GaP氮掺杂拓扑性质', 'GaP宽禁带半导体掺杂后的能带反转分析', 'GaP', 'topology_analysis', gapCrystal, createCalculationParams({ cutoffEnergy: 600 }), 82, '拓扑不变量计算中', ['掺杂', '宽禁带']),
  createTask('task-6', 'Bi2Te3热电拓扑材料', 'Bi2Te3与Bi2Se3同结构系列的对比计算', 'Bi2Te3', 'band_calculation', bi2se3Crystal, createCalculationParams({ kpointMesh: [10, 10, 6] }), 56, '能带结构计算中', ['热电材料', 'TI']),
  createTask('task-7', 'TaAs外尔半金属计算', 'TaAs手征外尔费米子的第一性原理研究', 'TaAs', 'scf_calculation', createCrystalStructure(
    'TaAs', 'I41md', 109,
    { a: 3.44, b: 3.44, c: 11.65, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Ta', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'As', x: 0, y: 0, z: 0.32, idx: 1 },
    ]
  ), createCalculationParams({ socEnabled: true, spinPolarized: true }), 34, 'SCF收敛迭代中', ['外尔半金属', '手征']),
  createTask('task-8', 'SnTe拓扑晶体绝缘体', 'SnTe镜像对称性保护的拓扑晶体绝缘态', 'SnTe', 'structure_optimization', createCrystalStructure(
    'SnTe', 'Fm-3m', 225,
    { a: 6.32, b: 6.32, c: 6.32, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Sn', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'Te', x: 0.5, y: 0.5, z: 0.5, idx: 1 },
    ]
  ), createCalculationParams({ forceThreshold: 0.005 }), 18, '结构优化弛豫中', ['拓扑晶体绝缘体', 'TCI']),
  createTask('task-9', 'CrI3二维磁性拓扑材料', 'CrI3单层铁磁拓扑绝缘体的自旋极化计算', 'CrI3', 'pending_validation', createCrystalStructure(
    'CrI3', 'R-3', 148,
    { a: 7.01, b: 7.01, c: 19.81, alpha: 90, beta: 90, gamma: 120 },
    [
      { element: 'Cr', x: 0, y: 0, z: 0.5, idx: 1 },
      { element: 'I', x: 1/3, y: 2/3, z: 0.35, idx: 1 },
      { element: 'I', x: 2/3, y: 1/3, z: 0.65, idx: 2 },
    ]
  ), createCalculationParams({ spinPolarized: true, socEnabled: true, functional: 'PBE+U' }), 5, '结构数据验证中', ['2D磁性', '铁磁']),
  createTask('task-10', 'HfTe5拓扑相变温度效应', 'HfTe5的温度依赖拓扑相变计算研究', 'HfTe5', 'error_fallback', createCrystalStructure(
    'HfTe5', 'Cmcm', 63,
    { a: 3.98, b: 14.48, c: 13.74, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Hf', x: 0, y: 0.13, z: 0.1, idx: 1 },
      { element: 'Te', x: 0, y: 0.37, z: 0.25, idx: 1 },
      { element: 'Te', x: 0, y: 0.0, z: 0.4, idx: 2 },
    ]
  ), createCalculationParams(), 45, 'SCF计算出错', ['相变', '范德华'], false, 'SCF迭代不收敛：电荷密度振荡超过阈值，建议增大截断能量或使用更平滑的赝势'),
  createTask('task-11', 'WTe2外尔半金属计算', 'WTe2第二类外尔半金属的Fermi弧研究', 'WTe2', 'paused', createCrystalStructure(
    'WTe2', 'Pnm21', 31,
    { a: 3.48, b: 6.25, c: 14.02, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'W', x: 0.5, y: 0.6, z: 0.5, idx: 1 },
      { element: 'Te', x: 0.5, y: 0.85, z: 0.35, idx: 1 },
      { element: 'Te', x: 0.5, y: 0.35, z: 0.65, idx: 2 },
    ]
  ), createCalculationParams({ socEnabled: true }), 28, '用户暂停任务', ['第二类外尔', 'Fermi弧']),
  createTask('task-12', 'GdPtBi半赫斯勒拓扑材料', 'GdPtBi磁性外尔半金属的输运性质', 'GdPtBi', 'structure_optimization', createCrystalStructure(
    'GdPtBi', 'F-43m', 216,
    { a: 6.78, b: 6.78, c: 6.78, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Gd', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'Pt', x: 0.25, y: 0.25, z: 0.25, idx: 1 },
      { element: 'Bi', x: 0.5, y: 0.5, z: 0.5, idx: 1 },
    ]
  ), createCalculationParams({ spinPolarized: true, socEnabled: true }), 12, '结构优化中', ['半赫斯勒', '磁性外尔']),
  createTask('task-13', 'BiH单层拓扑材料', 'BiH卤化类似物的二维拓扑绝缘态', 'BiH', 'scf_calculation', createCrystalStructure(
    'BiH', 'P-3m1', 164,
    { a: 4.32, b: 4.32, c: 20, alpha: 90, beta: 90, gamma: 120 },
    [
      { element: 'Bi', x: 0, y: 0, z: 0.5, idx: 1 },
      { element: 'H', x: 1/3, y: 2/3, z: 0.55, idx: 1 },
    ]
  ), createCalculationParams({ kpointMesh: [15, 15, 1] }), 41, 'SCF计算进行中', ['二维TI', 'QSH']),
  createTask('task-14', 'Pb1-xSnxSe合金拓扑相变', 'PbSnSe合金组分调控的拓扑相变', 'PbSe', 'band_calculation', createCrystalStructure(
    'PbSe', 'Fm-3m', 225,
    { a: 6.13, b: 6.13, c: 6.13, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Pb', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'Se', x: 0.5, y: 0.5, z: 0.5, idx: 1 },
    ]
  ), createCalculationParams({ socEnabled: true }), 67, '能带计算中', ['合金', '拓扑相变']),
  createTask('task-15', 'KZnBi拓扑半金属', 'KZnBi三元赫斯勒化合物的能带反转', 'KZnBi', 'completed', createCrystalStructure(
    'KZnBi', 'F-43m', 216,
    { a: 6.62, b: 6.62, c: 6.62, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'K', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'Zn', x: 0.25, y: 0.25, z: 0.25, idx: 1 },
      { element: 'Bi', x: 0.5, y: 0.5, z: 0.5, idx: 1 },
    ]
  ), createCalculationParams(), 100, '计算完成', ['三元化合物', '能带反转'], true),
  createTask('task-16', 'ZrTe5拓扑材料计算', 'ZrTe5的低温拓扑绝缘态性质', 'ZrTe5', 'topology_analysis', createCrystalStructure(
    'ZrTe5', 'Cmcm', 63,
    { a: 3.99, b: 14.52, c: 13.72, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Zr', x: 0, y: 0.13, z: 0.1, idx: 1 },
      { element: 'Te', x: 0, y: 0.37, z: 0.25, idx: 1 },
      { element: 'Te', x: 0, y: 0.0, z: 0.4, idx: 2 },
    ]
  ), createCalculationParams({ socEnabled: true }), 89, 'Z2不变量计算', ['过渡金属硫族']),
  createTask('task-17', 'BiBr3拓扑材料探索', 'BiBr3新型范德华拓扑材料预测', 'BiBr3', 'pending_validation', createCrystalStructure(
    'BiBr3', 'R-3', 148,
    { a: 7.32, b: 7.32, c: 23.45, alpha: 90, beta: 90, gamma: 120 },
    [
      { element: 'Bi', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'Br', x: 0.3, y: 0.1, z: 0.15, idx: 1 },
      { element: 'Br', x: 0.1, y: 0.3, z: -0.15, idx: 2 },
    ]
  ), createCalculationParams({ kpointMesh: [8, 8, 2] }), 3, '结构数据待验证', ['新预测', 'vdW']),
  createTask('task-18', 'FeSe基超导体拓扑带', 'FeSe单层的拓扑超导边界态探索', 'FeSe', 'band_calculation', createCrystalStructure(
    'FeSe', 'P4/nmm', 129,
    { a: 3.77, b: 3.77, c: 5.50, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Fe', x: 0.75, y: 0.25, z: 0, idx: 1 },
      { element: 'Se', x: 0.25, y: 0.25, z: 0.25, idx: 1 },
    ]
  ), createCalculationParams({ spinPolarized: true, socEnabled: true }), 73, '自旋极化能带计算', ['高温超导', '拓扑超导']),
  createTask('task-19', 'MoTe2结构相变拓扑', "MoTe2的1T'结构相变与外尔态", 'MoTe2', 'scf_calculation', createCrystalStructure(
    "MoTe2", 'P21/m', 11,
    { a: 6.33, b: 3.47, c: 13.84, alpha: 90, beta: 93.9, gamma: 90 },
    [
      { element: 'Mo', x: 0.5, y: 0.0, z: 0.5, idx: 1 },
      { element: 'Te', x: 0.0, y: 0.5, z: 0.35, idx: 1 },
      { element: 'Te', x: 0.0, y: 0.5, z: 0.65, idx: 2 },
    ]
  ), createCalculationParams({ socEnabled: true }), 52, 'SCF自洽迭代中', ["1T'相", '外尔']),
  createTask('task-20', 'SmB6混合价拓扑近藤', 'SmB6拓扑近藤绝缘体计算', 'SmB6', 'error_fallback', createCrystalStructure(
    'SmB6', 'Pm-3m', 221,
    { a: 4.13, b: 4.13, c: 4.13, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Sm', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'B', x: 0.5, y: 0.5, z: 0, idx: 1 },
    ]
  ), createCalculationParams({ functional: 'PBE+U', spinPolarized: true }), 22, 'DFT+U计算失败', ['近藤绝缘体', '强关联'], false, 'DFT+U计算未收敛：f轨道电子相互作用处理需更高级方法'),
  createTask('task-21', 'Bi4Br4链状拓扑材料', 'Bi4Br4准一维拓扑绝缘态', 'Bi4Br4', 'pending_supervisor_approval', createCrystalStructure(
    'Bi4Br4', 'C2/m', 12,
    { a: 14.50, b: 4.38, c: 8.30, alpha: 90, beta: 107.5, gamma: 90 },
    [
      { element: 'Bi', x: 0.15, y: 0.0, z: 0.3, idx: 1 },
      { element: 'Bi', x: 0.35, y: 0.5, z: 0.7, idx: 2 },
      { element: 'Br', x: 0.0, y: 0.5, z: 0.1, idx: 1 },
      { element: 'Br', x: 0.5, y: 0.0, z: 0.9, idx: 2 },
    ]
  ), createCalculationParams({ socEnabled: true }), 100, '等待导师审批', ['准一维', '弱TI'], true),
  createTask('task-22', 'Cu2ZnSnS4光伏拓扑', 'CZTS光伏材料的意外拓扑性质', 'Cu2ZnSnS4', 'paused', createCrystalStructure(
    'Cu2ZnSnS4', 'I-4', 82,
    { a: 5.43, b: 5.43, c: 10.86, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Cu', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'Cu', x: 0.5, y: 0.5, z: 0.5, idx: 2 },
      { element: 'Zn', x: 0, y: 0, z: 0.5, idx: 1 },
      { element: 'Sn', x: 0.5, y: 0.5, z: 0, idx: 1 },
      { element: 'S', x: 0.25, y: 0.25, z: 0.125, idx: 1 },
    ]
  ), createCalculationParams(), 15, '用户暂停：需修改掺杂模型', ['光伏', '硫族化合物']),
  createTask('task-23', 'PtTe2过渡金属硫族', 'PtTe2的Type-II狄拉克点计算', 'PtTe2', 'structure_optimization', createCrystalStructure(
    'PtTe2', 'P-3m1', 164,
    { a: 4.02, b: 4.02, c: 5.23, alpha: 90, beta: 90, gamma: 120 },
    [
      { element: 'Pt', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'Te', x: 1/3, y: 2/3, z: 0.25, idx: 1 },
      { element: 'Te', x: 2/3, y: 1/3, z: -0.25, idx: 2 },
    ]
  ), createCalculationParams({ socEnabled: true }), 23, '晶格常数优化中', ['TMDC', '狄拉克']),
  createTask('task-24', 'InAs/GaSb量子阱', 'InAs/GaSb量子阱的拓扑边缘态计算', 'InAs', 'topology_analysis', createCrystalStructure(
    'InAs', 'F-43m', 216,
    { a: 6.06, b: 6.06, c: 6.06, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'In', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'As', x: 0.25, y: 0.25, z: 0.25, idx: 1 },
    ]
  ), createCalculationParams({ kpointMesh: [10, 10, 1] }), 78, '超胞拓扑分析中', ['量子阱', '异质结']),
  createTask('task-25', 'RuO2氧化物拓扑金属', 'RuO2金红石结构氧化物中拓扑节点', 'RuO2', 'pending_validation', createCrystalStructure(
    'RuO2', 'P42/mnm', 136,
    { a: 4.49, b: 4.49, c: 3.11, alpha: 90, beta: 90, gamma: 90 },
    [
      { element: 'Ru', x: 0, y: 0, z: 0, idx: 1 },
      { element: 'O', x: 0.3, y: 0.3, z: 0, idx: 1 },
    ]
  ), createCalculationParams({ socEnabled: true, spinPolarized: true }), 7, '参数与结构校验中', ['氧化物', '拓扑金属']),
];

export const mockMaterials: MaterialArchive[] = [
  {
    id: 'mat-1',
    formula: 'Bi2Se3',
    classification: 'V-VI族化合物',
    topologyClass: '3D Strong TI',
    bandGap: 0.3,
    z2Invariant: '1; (000)',
    spaceGroup: 'R-3m (166)',
    sourceTaskId: 'task-1',
    archivedBy: 'user-2',
    archivedByName: '王建国',
    doi: '10.1038/nphys1271',
    cifFileUrl: '/cif/Bi2Se3.cif',
    bandStructureData: generateBandStructureData(12, true),
    dosData: generateDOSData(),
    createdAt: '2026-05-12T10:30:00Z',
    citations: 1247,
    isVerified: true,
  },
  {
    id: 'mat-2',
    formula: 'Na3Bi',
    classification: 'I-V族化合物',
    topologyClass: '3D Dirac Semimetal',
    bandGap: 0.0,
    z2Invariant: '(1;000)',
    spaceGroup: 'P63/mmc (194)',
    sourceTaskId: 'task-2',
    archivedBy: 'user-3',
    archivedByName: '陈思远',
    doi: '10.1126/science.1245085',
    cifFileUrl: '/cif/Na3Bi.cif',
    bandStructureData: generateBandStructureData(12, true),
    dosData: generateDOSData(),
    createdAt: '2026-05-08T14:20:00Z',
    citations: 892,
    isVerified: true,
  },
  {
    id: 'mat-3',
    formula: 'Cd3As2',
    classification: 'II-V族化合物',
    topologyClass: '3D Dirac Semimetal',
    bandGap: 0.0,
    z2Invariant: 'Dirac points',
    spaceGroup: 'I41/acd (142)',
    sourceTaskId: 'task-3',
    archivedBy: 'user-2',
    archivedByName: '王建国',
    cifFileUrl: '/cif/Cd3As2.cif',
    bandStructureData: generateBandStructureData(14, true),
    dosData: generateDOSData(),
    createdAt: '2026-05-28T09:15:00Z',
    citations: 567,
    isVerified: true,
  },
  {
    id: 'mat-4',
    formula: 'Sb',
    classification: 'V族元素',
    topologyClass: 'Topological Semimetal',
    bandGap: 0.0,
    z2Invariant: 1,
    spaceGroup: 'R-3m (166)',
    sourceTaskId: 'task-4',
    archivedBy: 'user-1',
    archivedByName: '刘小明',
    doi: '10.1103/PhysRevLett.116.156401',
    cifFileUrl: '/cif/Sb_monolayer.cif',
    bandStructureData: generateBandStructureData(10, true),
    dosData: generateDOSData(),
    createdAt: '2026-06-02T16:45:00Z',
    citations: 234,
    isVerified: false,
  },
  {
    id: 'mat-5',
    formula: 'TaAs',
    classification: 'V-V族化合物',
    topologyClass: 'Weyl Semimetal',
    bandGap: 0.0,
    z2Invariant: '12 Weyl points',
    spaceGroup: 'I41md (109)',
    sourceTaskId: 'task-7',
    archivedBy: 'user-3',
    archivedByName: '陈思远',
    doi: '10.1103/PhysRevX.5.011029',
    cifFileUrl: '/cif/TaAs.cif',
    bandStructureData: generateBandStructureData(16, true),
    dosData: generateDOSData(),
    createdAt: '2026-04-20T11:30:00Z',
    citations: 789,
    isVerified: true,
  },
  {
    id: 'mat-6',
    formula: 'KZnBi',
    classification: 'I-II-V赫斯勒',
    topologyClass: 'Topological Insulator',
    bandGap: 0.12,
    z2Invariant: 1,
    spaceGroup: 'F-43m (216)',
    sourceTaskId: 'task-15',
    archivedBy: 'user-1',
    archivedByName: '刘小明',
    cifFileUrl: '/cif/KZnBi.cif',
    bandStructureData: generateBandStructureData(14, true),
    dosData: generateDOSData(),
    createdAt: '2026-06-05T08:20:00Z',
    citations: 18,
    isVerified: true,
  },
  {
    id: 'mat-7',
    formula: 'SnTe',
    classification: 'IV-VI族化合物',
    topologyClass: 'Topological Crystalline Insulator',
    bandGap: 0.08,
    z2Invariant: 'Mirror Chern number',
    spaceGroup: 'Fm-3m (225)',
    sourceTaskId: 'task-8',
    archivedBy: 'user-2',
    archivedByName: '王建国',
    doi: '10.1038/nmat3506',
    cifFileUrl: '/cif/SnTe.cif',
    bandStructureData: generateBandStructureData(10, true),
    dosData: generateDOSData(),
    createdAt: '2026-04-15T13:00:00Z',
    citations: 456,
    isVerified: true,
  },
  {
    id: 'mat-8',
    formula: 'Bi4Br4',
    classification: 'V-VII族化合物',
    topologyClass: 'Weak Topological Insulator',
    bandGap: 0.18,
    z2Invariant: '0; (111)',
    spaceGroup: 'C2/m (12)',
    sourceTaskId: 'task-21',
    archivedBy: 'user-1',
    archivedByName: '刘小明',
    cifFileUrl: '/cif/Bi4Br4.cif',
    bandStructureData: generateBandStructureData(18, true),
    dosData: generateDOSData(),
    createdAt: '2026-06-10T15:30:00Z',
    citations: 45,
    isVerified: true,
  },
  {
    id: 'mat-9',
    formula: 'WTe2',
    classification: '过渡金属硫族',
    topologyClass: 'Type-II Weyl Semimetal',
    bandGap: 0.0,
    z2Invariant: '8 Weyl points',
    spaceGroup: 'Pnm21 (31)',
    sourceTaskId: 'task-11',
    archivedBy: 'user-3',
    archivedByName: '陈思远',
    doi: '10.1038/nphys3530',
    cifFileUrl: '/cif/WTe2.cif',
    bandStructureData: generateBandStructureData(14, true),
    dosData: generateDOSData(),
    createdAt: '2026-03-28T10:10:00Z',
    citations: 567,
    isVerified: true,
  },
  {
    id: 'mat-10',
    formula: 'HfTe5',
    classification: '过渡金属硫族',
    topologyClass: 'Topological Insulator',
    bandGap: 0.05,
    z2Invariant: 1,
    spaceGroup: 'Cmcm (63)',
    sourceTaskId: 'task-16',
    archivedBy: 'user-1',
    archivedByName: '刘小明',
    cifFileUrl: '/cif/HfTe5.cif',
    bandStructureData: generateBandStructureData(12, true),
    dosData: generateDOSData(),
    createdAt: '2026-06-08T11:45:00Z',
    citations: 123,
    isVerified: false,
  },
  {
    id: 'mat-11',
    formula: 'Bi2Te3',
    classification: 'V-VI族化合物',
    topologyClass: '3D Strong TI',
    bandGap: 0.15,
    z2Invariant: '1; (000)',
    spaceGroup: 'R-3m (166)',
    sourceTaskId: 'task-6',
    archivedBy: 'user-2',
    archivedByName: '王建国',
    doi: '10.1103/PhysRevLett.103.266801',
    cifFileUrl: '/cif/Bi2Te3.cif',
    bandStructureData: generateBandStructureData(12, true),
    dosData: generateDOSData(),
    createdAt: '2026-04-02T14:30:00Z',
    citations: 2345,
    isVerified: true,
  },
  {
    id: 'mat-12',
    formula: 'CrI3',
    classification: '磁性硫族化合物',
    topologyClass: '2D Magnetic TI',
    bandGap: 0.25,
    z2Invariant: 1,
    spaceGroup: 'R-3 (148)',
    sourceTaskId: 'task-9',
    archivedBy: 'user-1',
    archivedByName: '刘小明',
    doi: '10.1038/s41586-017-0031-x',
    cifFileUrl: '/cif/CrI3.cif',
    bandStructureData: generateBandStructureData(16, true),
    dosData: generateDOSData(),
    createdAt: '2026-05-18T09:50:00Z',
    citations: 189,
    isVerified: false,
  },
  {
    id: 'mat-13',
    formula: 'FeSe',
    classification: '铁基超导体',
    topologyClass: 'Topological Superconductor',
    bandGap: 0.01,
    z2Invariant: 'Majorana modes',
    spaceGroup: 'P4/nmm (129)',
    sourceTaskId: 'task-18',
    archivedBy: 'user-3',
    archivedByName: '陈思远',
    cifFileUrl: '/cif/FeSe.cif',
    bandStructureData: generateBandStructureData(12, true),
    dosData: generateDOSData(),
    createdAt: '2026-06-01T16:20:00Z',
    citations: 342,
    isVerified: true,
  },
  {
    id: 'mat-14',
    formula: 'MoTe2',
    classification: 'TMDC',
    topologyClass: 'Type-II Weyl Semimetal',
    bandGap: 0.03,
    z2Invariant: 'Weyl nodes',
    spaceGroup: 'P21/m (11)',
    sourceTaskId: 'task-19',
    archivedBy: 'user-1',
    archivedByName: '刘小明',
    doi: '10.1038/nphys3918',
    cifFileUrl: '/cif/MoTe2_1Tp.cif',
    bandStructureData: generateBandStructureData(14, true),
    dosData: generateDOSData(),
    createdAt: '2026-05-22T11:15:00Z',
    citations: 278,
    isVerified: true,
  },
  {
    id: 'mat-15',
    formula: 'GdPtBi',
    classification: '半赫斯勒',
    topologyClass: 'Magnetic Weyl Semimetal',
    bandGap: 0.0,
    z2Invariant: 'Triple points',
    spaceGroup: 'F-43m (216)',
    sourceTaskId: 'task-12',
    archivedBy: 'user-2',
    archivedByName: '王建国',
    cifFileUrl: '/cif/GdPtBi.cif',
    bandStructureData: generateBandStructureData(18, true),
    dosData: generateDOSData(),
    createdAt: '2026-05-30T13:40:00Z',
    citations: 67,
    isVerified: false,
  },
];

function generateTrend(days: number = 30) {
  const trend = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const seed = i * 12.9898;
    const base = 5 + Math.abs(Math.sin(seed)) * 8;
    trend.push({
      date: d.toISOString().slice(0, 10),
      tasksCreated: Math.floor(base + Math.abs(Math.cos(seed * 2)) * 4),
      tasksCompleted: Math.floor(base * 0.85 + Math.abs(Math.sin(seed * 1.5)) * 3),
      computeHours: Number((80 + Math.abs(Math.sin(seed * 0.7)) * 120 + Math.random() * 30).toFixed(1)),
      topMaterialsFound: Math.floor(Math.abs(Math.cos(seed * 0.5)) * 3),
    });
  }
  return trend;
}

export const mockDashboardStats: DashboardStats = {
  totalUsers: 48,
  activeUsers: 23,
  totalTasks: 342,
  runningTasks: 18,
  completedTasks: 287,
  errorTasks: 17,
  pendingApprovals: 12,
  totalMaterials: 156,
  topologicalMaterials: 98,
  totalComputeHours: 8547.5,
  averageCompletionTime: '4.2小时',
  trend: generateTrend(30),
};

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'task_completed',
    title: 'Bi2Se3计算任务已完成',
    message: '您提交的Bi2Se3拓扑绝缘体全流程计算已完成，发现明显的能带反转和Z2=1不变量。',
    relatedTaskId: 'task-1',
    senderId: 'user-4',
    senderName: '系统通知',
    isRead: false,
    createdAt: '2026-06-15T09:12:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'approval_processed',
    title: 'Cd3As2审批通过',
    message: '王建国导师已批准您的Cd3As2计算结果提交归档。',
    relatedTaskId: 'task-3',
    senderId: 'user-2',
    senderName: '王建国',
    isRead: false,
    createdAt: '2026-06-15T08:45:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'task_failed',
    title: 'SmB6计算出错',
    message: 'SmB6的DFT+U计算未收敛，请检查参数设置或尝试更高级计算方法。',
    relatedTaskId: 'task-20',
    senderId: 'user-4',
    senderName: '系统通知',
    isRead: true,
    createdAt: '2026-06-14T22:30:00Z',
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'material_archived',
    title: 'KZnBi材料已归档',
    message: 'KZnBi计算结果已作为拓扑绝缘体材料归档至材料库，ID: mat-6。',
    relatedMaterialId: 'mat-6',
    senderId: 'user-1',
    senderName: '刘小明',
    isRead: true,
    createdAt: '2026-06-13T16:20:00Z',
  },
  {
    id: 'notif-5',
    userId: 'user-2',
    type: 'approval_requested',
    title: 'Bi4Br4待您审批',
    message: '刘小明提交了Bi4Br4的计算结果，请在导师审批环节进行审核。',
    relatedTaskId: 'task-21',
    senderId: 'user-1',
    senderName: '刘小明',
    isRead: false,
    createdAt: '2026-06-15T10:05:00Z',
  },
  {
    id: 'notif-6',
    userId: 'user-2',
    type: 'approval_requested',
    title: 'Cd3As2待您审批',
    message: '刘小明提交了Cd3As2的计算结果等待导师审批。',
    relatedTaskId: 'task-3',
    senderId: 'user-1',
    senderName: '刘小明',
    isRead: false,
    createdAt: '2026-06-14T11:30:00Z',
  },
  {
    id: 'notif-7',
    userId: 'user-3',
    type: 'system',
    title: '月度计算报告已生成',
    message: '5月份高通量计算平台报告已生成：共完成计算89次，发现拓扑材料17种，累计计算时长2340小时。',
    senderId: 'user-4',
    senderName: '系统通知',
    isRead: true,
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'notif-8',
    userId: 'user-3',
    type: 'mention',
    title: '陈思远被@在项目讨论中',
    message: '王建国在"Na3Bi系列深入研究"项目中提到了您，建议讨论狄拉克半金属的输运计算方案。',
    senderId: 'user-2',
    senderName: '王建国',
    isRead: false,
    createdAt: '2026-06-14T14:15:00Z',
  },
  {
    id: 'notif-9',
    userId: 'user-1',
    type: 'system',
    title: '计算节点扩容完成',
    message: 'GPU计算队列已新增4个节点，预计任务等待时间减少60%。',
    senderId: 'user-4',
    senderName: '系统通知',
    isRead: true,
    createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'notif-10',
    userId: 'user-1',
    type: 'task_completed',
    title: 'Sb单层任务计算完成',
    message: 'Sb单层拓扑相变计算完成，发现应力可有效调控其拓扑相变点。',
    relatedTaskId: 'task-4',
    senderId: 'user-4',
    senderName: '系统通知',
    isRead: true,
    createdAt: '2026-06-12T18:22:00Z',
  },
];
