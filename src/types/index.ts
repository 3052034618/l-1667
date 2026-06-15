export type UserRole = 'phd_student' | 'supervisor' | 'chief_scientist' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  realName: string;
  role: UserRole;
  groupId: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
}

export type TaskStatus =
  | 'pending_validation'
  | 'structure_optimization'
  | 'scf_calculation'
  | 'band_calculation'
  | 'topology_analysis'
  | 'pending_phd_approval'
  | 'pending_supervisor_approval'
  | 'completed'
  | 'error_fallback'
  | 'paused';

export interface AtomPosition {
  element: string;
  x: number;
  y: number;
  z: number;
  label: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  symmetryChecked: boolean;
  stoichiometryVerified: boolean;
}

export interface CrystalStructure {
  formula: string;
  spaceGroup: string;
  spaceGroupNumber: number;
  latticeParams: {
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  atoms: AtomPosition[];
  validationResult: ValidationResult;
}

export interface CalculationParams {
  functional: string;
  kpointMesh: [number, number, number];
  cutoffEnergy: number;
  pseudopotential: string;
  forceThreshold: number;
  energyThreshold: number;
  spinPolarized: boolean;
  socEnabled: boolean;
}

export interface ConvergenceLog {
  step: number;
  energy: number;
  maxForce: number;
  stressTensor: number[][];
  timestamp: string;
  paramAdjustment?: {
    type: string;
    oldValue: number;
    newValue: number;
    reason: string;
  };
}

export interface BandStructurePoint {
  kpoint: number;
  label?: string;
  eigenvalue: number;
}

export interface BandStructureData {
  bandIndex: number;
  spin?: 'up' | 'down';
  points: BandStructurePoint[];
}

export interface DOSData {
  energy: number;
  total: number;
  s: number;
  p: number;
  d: number;
}

export interface TopologyResult {
  bandInversion: boolean;
  z2Invariant: number | string;
  topologyClass: string;
  surfaceStates: number[][];
  bandGap: number;
  fermiLevel: number;
  bandStructureData: BandStructureData[];
  dosData: DOSData[];
}

export type ApprovalType = 'phd' | 'supervisor';
export type ApprovalDecision = 'approved' | 'rejected';

export interface ApprovalRecord {
  id: string;
  taskId: string;
  type: ApprovalType;
  approverId: string;
  approverName: string;
  decision: ApprovalDecision;
  comments: string;
  createdAt: string;
}

export interface ComputationTask {
  id: string;
  title: string;
  description: string;
  formula: string;
  status: TaskStatus;
  creatorId: string;
  creatorName: string;
  groupId: string;
  crystalStructure: CrystalStructure;
  calculationParams: CalculationParams;
  convergenceLogs: ConvergenceLog[];
  topologyResult?: TopologyResult;
  approvals: ApprovalRecord[];
  materials?: Array<MaterialArchive & { isArchived?: boolean }>;
  progress: number;
  currentStep: string;
  estimatedTimeRemaining: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  tags: string[];
}

export interface MaterialArchive {
  id: string;
  formula: string;
  classification: string;
  topologyClass: string;
  bandGap: number;
  z2Invariant: number | string;
  spaceGroup: string;
  sourceTaskId: string;
  archivedBy: string;
  archivedByName: string;
  doi?: string;
  cifFileUrl: string;
  bandStructureData: BandStructureData[];
  dosData: DOSData[];
  createdAt: string;
  citations: number;
  isVerified: boolean;
  isArchived?: boolean;
}

export interface DailyStats {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  computeHours: number;
  topMaterialsFound: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  errorTasks: number;
  pendingApprovals: number;
  totalMaterials: number;
  topologicalMaterials: number;
  totalComputeHours: number;
  averageCompletionTime: string;
  trend: DailyStats[];
}

export type NotificationType =
  | 'task_completed'
  | 'task_failed'
  | 'approval_requested'
  | 'approval_processed'
  | 'material_archived'
  | 'system'
  | 'mention';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedTaskId?: string;
  relatedMaterialId?: string;
  senderId?: string;
  senderName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  groupId?: string;
  creatorId?: string;
  formula?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export type ExportFormat = 'pdf' | 'csv' | 'json' | 'vaspkit';

export interface ExportHistoryItem {
  id: string;
  type: ExportFormat;
  taskIds: string[];
  createdAt: string;
  downloadUrl: string;
  filename: string;
  size: string;
}

export interface ReportGenerateOptions {
  includeCover?: boolean;
  includeBandStructure?: boolean;
  includeDOS?: boolean;
  includeTopologyAnalysis?: boolean;
  includeConvergence?: boolean;
}

export interface ExportFilters {
  system?: string;
  spaceGroup?: string;
  gapType?: string;
  topologyClass?: string;
  dateFrom?: string;
  dateTo?: string;
}
