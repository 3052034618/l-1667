import { create } from 'zustand';
import type {
  ComputationTask,
  TaskStatus,
  TaskFilters,
  ApprovalRecord,
  ApprovalType,
  ApprovalDecision,
  CrystalStructure,
  CalculationParams,
  MaterialArchive,
  TopologyResult,
} from '../types';
import { mockTasks, mockApprovals } from '../data/mockData';

const STORAGE_KEY = 'topoflow_tasks';

interface TaskState {
  tasks: ComputationTask[];
  currentTask: ComputationTask | null;
  filters: TaskFilters;
  approvals: ApprovalRecord[];
  materials: MaterialArchive[];
  getTasks: () => ComputationTask[];
  getTaskById: (id: string) => ComputationTask | undefined;
  createTask: (data: {
    title: string;
    description: string;
    formula: string;
    crystalStructure: CrystalStructure;
    calculationParams: CalculationParams;
    tags: string[];
    creatorId: string;
    creatorName: string;
    groupId: string;
  }) => ComputationTask;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  submitApproval: (
    taskId: string,
    type: ApprovalType,
    decision: ApprovalDecision,
    comments: string,
    approverId: string,
    approverName: string
  ) => ApprovalRecord | null;
  batchSubmitApproval: (
    taskIds: string[],
    type: ApprovalType,
    decision: ApprovalDecision,
    comments: string,
    approverId: string,
    approverName: string
  ) => number;
  getMaterials: (filters?: {
    formula?: string;
    spaceGroup?: string;
    topologyClass?: string;
    bandGap?: [number, number];
  }) => MaterialArchive[];
  setFilters: (filters: TaskFilters) => void;
  setCurrentTask: (task: ComputationTask | null) => void;
  getFilteredTasks: () => ComputationTask[];
  updateTaskProgress: (id: string, progress: number, currentStep: string) => void;
  loadTasksFromStorage: () => void;
  saveTasksToStorage: () => void;
  deleteTask: (id: string) => void;
}

const emptyTopologyResult: TopologyResult = {
  bandInversion: false,
  z2Invariant: 0,
  topologyClass: '未定',
  surfaceStates: [],
  bandGap: 0,
  fermiLevel: 0,
  bandStructureData: [],
  dosData: [],
};

function taskToMaterial(task: ComputationTask, approverId: string, approverName: string): MaterialArchive {
  const topology = task.topologyResult || emptyTopologyResult;
  return {
    id: `mat-${task.id}`,
    formula: task.formula,
    classification: task.tags[0] || '未分类',
    topologyClass: topology.topologyClass,
    bandGap: topology.bandGap,
    z2Invariant: topology.z2Invariant,
    spaceGroup: `${task.crystalStructure.spaceGroup} (${task.crystalStructure.spaceGroupNumber})`,
    sourceTaskId: task.id,
    archivedBy: approverId,
    archivedByName: approverName,
    cifFileUrl: `/cif/${task.formula}.cif`,
    bandStructureData: topology.bandStructureData,
    dosData: topology.dosData,
    createdAt: new Date().toISOString(),
    citations: 0,
    isVerified: false,
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  filters: {},
  approvals: [...mockApprovals],
  materials: [],

  loadTasksFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedTasks: ComputationTask[] = stored ? JSON.parse(stored) : [];
      const storedIds = new Set(storedTasks.map(t => t.id));
      const uniqueMockTasks = mockTasks.filter(t => !storedIds.has(t.id));
      set({ tasks: [...storedTasks, ...uniqueMockTasks] });
    } catch {
      set({ tasks: [...mockTasks] });
    }
  },

  saveTasksToStorage: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().tasks));
    } catch {
      console.error('Failed to save tasks to localStorage');
    }
  },

  getTasks: () => get().tasks,

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  createTask: (data) => {
    const now = new Date().toISOString();
    const newId = `task-${Date.now()}`;
    const newTask: ComputationTask = {
      id: newId,
      title: data.title,
      description: data.description,
      formula: data.formula,
      status: 'pending_validation',
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      groupId: data.groupId,
      crystalStructure: data.crystalStructure,
      calculationParams: data.calculationParams,
      convergenceLogs: [],
      topologyResult: { ...emptyTopologyResult },
      approvals: [],
      progress: 0,
      currentStep: '任务已创建，等待验证',
      estimatedTimeRemaining: '待评估',
      createdAt: now,
      tags: data.tags,
    };
    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }));
    get().saveTasksToStorage();
    return newTask;
  },

  updateTaskStatus: (id, status) => {
    const now = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, status };
        if (status === 'structure_optimization' && !t.startedAt) {
          updated.startedAt = now;
        }
        if (status === 'completed' || status === 'pending_phd_approval' || status === 'pending_supervisor_approval') {
          if (!t.startedAt) updated.startedAt = now;
          updated.completedAt = now;
          updated.progress = 100;
        }
        if (status === 'pending_validation') {
          updated.progress = 5;
          updated.currentStep = '结构数据验证中';
        } else if (status === 'structure_optimization') {
          updated.progress = 20;
          updated.currentStep = '结构优化弛豫中';
        } else if (status === 'scf_calculation') {
          updated.progress = 40;
          updated.currentStep = 'SCF自洽计算中';
        } else if (status === 'band_calculation') {
          updated.progress = 60;
          updated.currentStep = '能带结构计算中';
        } else if (status === 'topology_analysis') {
          updated.progress = 80;
          updated.currentStep = '拓扑不变量分析中';
        } else if (status === 'pending_phd_approval') {
          updated.currentStep = '等待博士生自审';
        } else if (status === 'pending_supervisor_approval') {
          updated.currentStep = '等待导师审批';
        } else if (status === 'completed') {
          updated.currentStep = '计算完成';
          updated.estimatedTimeRemaining = '0分钟';
        } else if (status === 'error_fallback') {
          updated.currentStep = '计算出错，等待处理';
        } else if (status === 'paused') {
          updated.currentStep = '任务已暂停';
        }
        return updated;
      }),
    }));
    get().saveTasksToStorage();
  },

  submitApproval: (taskId, type, decision, comments, approverId, approverName) => {
    const approvalId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const approval: ApprovalRecord = {
      id: approvalId,
      taskId,
      type,
      approverId,
      approverName,
      decision,
      comments,
      createdAt: now,
    };

    let newMaterial: MaterialArchive | null = null;

    set((state) => {
      const taskExists = state.tasks.some((t) => t.id === taskId);
      if (!taskExists) return state;

      const newState: Partial<TaskState> = {
        approvals: [...state.approvals, approval],
      };

      newState.tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedTask = { ...t, approvals: [...t.approvals, approval] };

        if (decision === 'approved') {
          if (type === 'phd') {
            updatedTask.status = 'pending_supervisor_approval';
            updatedTask.currentStep = '等待导师审批';
            (updatedTask as any).materials = [{
              ...taskToMaterial(updatedTask, approverId, approverName),
              isArchived: false,
            }];
          } else if (type === 'supervisor') {
            updatedTask.status = 'completed';
            updatedTask.currentStep = '计算完成';
            updatedTask.progress = 100;
            updatedTask.completedAt = now;
            const material = taskToMaterial(updatedTask, approverId, approverName);
            (updatedTask as any).materials = [{ ...material, isArchived: true }];
            newMaterial = { ...material, isArchived: true };
          }
        } else if (decision === 'rejected') {
          updatedTask.status = 'error_fallback';
          updatedTask.currentStep = '审批驳回，等待处理';
        }

        return updatedTask;
      });

      if (newMaterial) {
        newState.materials = [newMaterial, ...state.materials];
      }

      return newState;
    });

    get().saveTasksToStorage();
    return approval;
  },

  batchSubmitApproval: (taskIds, type, decision, comments, approverId, approverName) => {
    let successCount = 0;
    taskIds.forEach((taskId) => {
      const result = get().submitApproval(taskId, type, decision, comments, approverId, approverName);
      if (result) successCount++;
    });
    return successCount;
  },

  getMaterials: (filters) => {
    const { tasks } = get();
    const completedTasks = tasks.filter((t) => {
      if (t.status !== 'completed') return false;
      const hasPhdApproval = t.approvals.some(a => a.type === 'phd' && a.decision === 'approved');
      const hasSupervisorApproval = t.approvals.some(a => a.type === 'supervisor' && a.decision === 'approved');
      return hasPhdApproval && hasSupervisorApproval;
    });

    let materials = completedTasks.map((t) => {
      const supervisorApproval = t.approvals.find(a => a.type === 'supervisor' && a.decision === 'approved');
      return taskToMaterial(t, supervisorApproval?.approverId || '', supervisorApproval?.approverName || '');
    });

    if (filters) {
      if (filters.formula) {
        materials = materials.filter(m => m.formula.toLowerCase().includes(filters.formula!.toLowerCase()));
      }
      if (filters.spaceGroup) {
        materials = materials.filter(m => m.spaceGroup.toLowerCase().includes(filters.spaceGroup!.toLowerCase()));
      }
      if (filters.topologyClass) {
        materials = materials.filter(m => m.topologyClass.toLowerCase().includes(filters.topologyClass!.toLowerCase()));
      }
      if (filters.bandGap) {
        const [min, max] = filters.bandGap;
        materials = materials.filter(m => m.bandGap >= min && m.bandGap <= max);
      }
    }

    return materials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  setFilters: (filters) => set({ filters }),

  setCurrentTask: (task) => set({ currentTask: task }),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((t) => {
      if (filters.status?.length && !filters.status.includes(t.status)) return false;
      if (filters.groupId && t.groupId !== filters.groupId) return false;
      if (filters.creatorId && t.creatorId !== filters.creatorId) return false;
      if (filters.formula && !t.formula.toLowerCase().includes(filters.formula.toLowerCase())) return false;
      if (filters.dateFrom && new Date(t.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(t.createdAt) > new Date(filters.dateTo)) return false;
      if (filters.tags?.length && !filters.tags.some((tag) => t.tags.includes(tag))) return false;
      return true;
    });
  },

  updateTaskProgress: (id, progress, currentStep) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              progress: Math.min(100, Math.max(0, progress)),
              currentStep,
              estimatedTimeRemaining:
                progress >= 100 ? '0分钟' : `${Math.ceil((100 - progress) * 1.5)}分钟`,
            }
          : t
      ),
    }));
    get().saveTasksToStorage();
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    get().saveTasksToStorage();
  },
}));

useTaskStore.getState().loadTasksFromStorage();
