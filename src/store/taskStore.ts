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
} from '../types';
import { mockTasks, mockApprovals } from '../data/mockData';

interface TaskState {
  tasks: ComputationTask[];
  currentTask: ComputationTask | null;
  filters: TaskFilters;
  approvals: ApprovalRecord[];
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
  setFilters: (filters: TaskFilters) => void;
  setCurrentTask: (task: ComputationTask | null) => void;
  getFilteredTasks: () => ComputationTask[];
  updateTaskProgress: (id: string, progress: number, currentStep: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [...mockTasks],
  currentTask: null,
  filters: {},
  approvals: [...mockApprovals],

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
  },

  submitApproval: (taskId, type, decision, comments, approverId, approverName) => {
    const approvalId = `app-${Date.now()}`;
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
          } else if (type === 'supervisor') {
            updatedTask.status = 'completed';
            updatedTask.currentStep = '计算完成';
            updatedTask.progress = 100;
            updatedTask.completedAt = now;
          }
        }
        return updatedTask;
      });
      return newState;
    });
    return approval;
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
  },
}));
