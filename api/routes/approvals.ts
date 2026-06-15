import { Router, type Request, type Response } from 'express';
import { mockApprovals, mockTasks, mockUsers, type ApprovalRecord } from '../data/mockData.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/pending', (req: Request, res: Response): void => {
  const approvalType = req.query.approvalType as string;
  const userRole = req.user.role;

  let pendingTasks = mockTasks.filter((t) => {
    if (userRole === 'phd_student') {
      return t.status === 'pending_phd_approval';
    }
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

router.post('/:taskId/submit', requireRole(['phd_student', 'supervisor', 'chief_scientist', 'admin']), (req: Request, res: Response): void => {
  const { taskId } = req.params;
  const { type, decision, comments } = req.body;
  const userRole = req.user.role;
  const approverId = req.user.userId;

  if (userRole === 'phd_student' && type !== 'phd') {
    res.status(200).json({
      success: false,
      message: '博士生只能审批phd类型的审批',
    });
    return;
  }
  if (userRole === 'supervisor' && type !== 'supervisor') {
    res.status(200).json({
      success: false,
      message: '导师只能审批supervisor类型的审批',
    });
    return;
  }

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

router.post('/batch', requireRole(['phd_student', 'supervisor', 'chief_scientist', 'admin']), (req: Request, res: Response): void => {
  const { items, decision, comments } = req.body;
  const userRole = req.user.role;
  const results: any[] = [];

  if (items && Array.isArray(items)) {
    items.forEach((item: any) => {
      const task = mockTasks.find((t) => t.id === item.taskId);
      if (task) {
        const approvalType = task.status === 'pending_phd_approval' ? 'phd' : 'supervisor';

        if (userRole === 'phd_student' && approvalType !== 'phd') {
          results.push({ taskId: item.taskId, success: false, message: '博士生只能审批phd类型的审批' });
          return;
        }
        if (userRole === 'supervisor' && approvalType !== 'supervisor') {
          results.push({ taskId: item.taskId, success: false, message: '导师只能审批supervisor类型的审批' });
          return;
        }

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
