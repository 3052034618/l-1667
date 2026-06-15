import { Router, type Request, type Response } from 'express';
import { mockTasks, mockApprovals, type ComputationTask, type TaskStatus } from '../data/mockData.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const status = req.query.status as string;
  const keyword = req.query.keyword as string;
  const groupId = req.query.groupId as string;

  let filtered = [...mockTasks];
  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(kw) ||
        t.formula.toLowerCase().includes(kw) ||
        t.description.toLowerCase().includes(kw)
    );
  }
  if (groupId) {
    filtered = filtered.filter((t) => t.groupId === groupId);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  res.status(200).json({
    success: true,
    message: '获取任务列表成功',
    data: {
      items,
      total,
      page,
      pageSize,
    },
  });
});

router.get('/:id', (req: Request, res: Response): void => {
  const task = mockTasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(200).json({
      success: false,
      message: '任务不存在',
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: '获取任务详情成功',
    data: task,
  });
});

router.post('/', (req: Request, res: Response): void => {
  const { title, description, formula, crystalStructure, calculationParams, tags } = req.body;
  const newTask: ComputationTask = {
    id: 'task-' + (mockTasks.length + 1),
    title: title || '新建计算任务',
    description: description || '',
    formula: formula || 'Unknown',
    status: 'pending_validation',
    creatorId: 'user-1',
    creatorName: '刘小明',
    groupId: 'group-1',
    crystalStructure: crystalStructure || mockTasks[0].crystalStructure,
    calculationParams: calculationParams || mockTasks[0].calculationParams,
    convergenceLogs: [],
    approvals: [],
    progress: 0,
    currentStep: '待提交验证',
    estimatedTimeRemaining: '预计4小时',
    createdAt: new Date().toISOString(),
    tags: tags || [],
  };
  mockTasks.unshift(newTask);
  res.status(200).json({
    success: true,
    message: '任务创建成功',
    data: newTask,
  });
});

router.put('/:id/status', (req: Request, res: Response): void => {
  const task = mockTasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(200).json({
      success: false,
      message: '任务不存在',
    });
    return;
  }
  const { status, progress } = req.body;
  if (status) task.status = status as TaskStatus;
  if (progress !== undefined) task.progress = progress;
  res.status(200).json({
    success: true,
    message: '任务状态更新成功',
    data: task,
  });
});

router.post('/:id/submit', (req: Request, res: Response): void => {
  const task = mockTasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(200).json({
      success: false,
      message: '任务不存在',
    });
    return;
  }
  const { type } = req.body;
  if (type === 'phd') {
    task.status = 'pending_phd_approval';
    task.currentStep = '等待博士生自审';
  } else {
    task.status = 'pending_supervisor_approval';
    task.currentStep = '等待导师审批';
  }
  res.status(200).json({
    success: true,
    message: '审批已提交',
    data: task,
  });
});

router.get('/:id/convergence', (req: Request, res: Response): void => {
  const task = mockTasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(200).json({
      success: false,
      message: '任务不存在',
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: '获取收敛日志成功',
    data: task.convergenceLogs,
  });
});

router.get('/:id/topology', (req: Request, res: Response): void => {
  const task = mockTasks.find((t) => t.id === req.params.id);
  if (!task || !task.topologyResult) {
    res.status(200).json({
      success: false,
      message: '拓扑结果不存在',
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: '获取拓扑结果成功',
    data: task.topologyResult,
  });
});

router.delete('/:id', (req: Request, res: Response): void => {
  const idx = mockTasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(200).json({
      success: false,
      message: '任务不存在',
    });
    return;
  }
  mockTasks.splice(idx, 1);
  res.status(200).json({
    success: true,
    message: '任务删除成功',
  });
});

export default router;
