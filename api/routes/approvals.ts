import { Router, type Request, type Response } from 'express';
import { mockApprovals, mockTasks, mockUsers, type ApprovalRecord } from '../data/mockData.js';

const router = Router();

router.get('/pending', (req: Request, res: Response): void => {
  const approvalType = req.query.approvalType as string;
  let pendingTasks = mockTasks.filter((t) => {
    if (approvalType === 'phd') {
      return t.status === 'pending_phd_approval';
    }
    if (approvalType === 'supervisor') {
      return t.status === 'pending_supervisor_approval';
    }
    return t.status === 'pending_phd_approval' || t.status === 'pending_supervisor_approval';
  });
  const items = pendingTasks.map((t) => ({
    taskId: t.id,
    taskTitle: t.title,
    formula: t.formula,
    status: t.status,
    approvalType: t.status === 'pending_phd_approval' ? 'phd' : 'supervisor',
    creatorId: t.creatorId,
    creatorName: t.creatorName,
    createdAt: t.createdAt,
    progress: t.progress,
  }));
  res.status(200).json({
    success: true,
    message: '获取待审批列表成功',
    data: items,
  });
});

router.get('/history', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: '获取审批历史成功',
    data: mockApprovals,
  });
});

router.post('/:taskId/submit', (req: Request, res: Response): void => {
  const { taskId } = req.params;
  const { type, decision, comments, approverId } = req.body;
  const task = mockTasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(200).json({
      success: false,
      message: '任务不存在',
    });
    return;
  }
  const approver = mockUsers.find((u) => u.id === approverId) || mockUsers[1];
  const newApproval: ApprovalRecord = {
    id: 'app-' + (mockApprovals.length + 1),
    taskId,
    type: type || 'supervisor',
    approverId: approver.id,
    approverName: approver.realName,
    decision: decision || 'approved',
    comments: comments || '',
    createdAt: new Date().toISOString(),
  };
  mockApprovals.push(newApproval);
  task.approvals.push(newApproval);
  if (decision === 'approved') {
    if (type === 'phd') {
      task.status = 'pending_supervisor_approval';
      task.currentStep = '等待导师审批';
    } else if (type === 'supervisor') {
      task.status = 'completed';
      task.currentStep = '计算完成';
      task.progress = 100;
    }
  } else {
    task.status = 'scf_calculation';
    task.currentStep = '返回修改，重新计算';
  }
  res.status(200).json({
    success: true,
    message: '审批提交成功',
    data: {
      approval: newApproval,
      task,
    },
  });
});

router.post('/batch', (req: Request, res: Response): void => {
  const { items, decision, comments } = req.body;
  const results: any[] = [];
  if (items && Array.isArray(items)) {
    items.forEach((item: any) => {
      const task = mockTasks.find((t) => t.id === item.taskId);
      if (task) {
        if (decision === 'approved') {
          if (task.status === 'pending_phd_approval') {
            task.status = 'pending_supervisor_approval';
          } else {
            task.status = 'completed';
            task.progress = 100;
          }
        }
        results.push({ taskId: item.taskId, success: true });
      }
    });
  }
  res.status(200).json({
    success: true,
    message: `批量审批完成，共处理 ${results.length} 项`,
    data: results,
  });
});

export default router;
