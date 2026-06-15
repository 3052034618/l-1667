import { Router, type Request, type Response } from 'express';
import { mockDashboardStats, mockTasks, mockMaterials } from '../data/mockData.js';

const router = Router();

router.get('/stats', (req: Request, res: Response): void => {
  const completedTasks = mockTasks.filter((t) => t.status === 'completed').length;
  const totalTasks = mockTasks.length;
  const completionRate = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

  const scfIterations = mockTasks.map((t) => t.convergenceLogs.length).filter((n) => n > 0);
  const avgScfIterations = scfIterations.length > 0
    ? Number((scfIterations.reduce((a, b) => a + b, 0) / scfIterations.length).toFixed(1))
    : 18;

  const tasksWithResult = mockTasks.filter((t) => t.topologyResult);
  const topologyAccuracy = tasksWithResult.length > 0
    ? Number(((tasksWithResult.filter((t) => t.topologyResult!.bandInversion).length / tasksWithResult.length) * 100).toFixed(1))
    : 92.5;

  const abnormalTasks = mockTasks.filter((t) => t.status === 'error_fallback' || t.status === 'paused').length;

  res.status(200).json({
    success: true,
    message: '获取统计数据成功',
    data: {
      ...mockDashboardStats,
      completionRate,
      avgScfIterations,
      topologyAccuracy,
      abnormalTasks,
    },
  });
});

router.get('/trends', (req: Request, res: Response): void => {
  const trend = mockDashboardStats.trend;
  res.status(200).json({
    success: true,
    message: '获取趋势数据成功',
    data: {
      dates: trend.map((t) => t.date),
      created: trend.map((t) => t.tasksCreated),
      completed: trend.map((t) => t.tasksCompleted),
      computeHours: trend.map((t) => t.computeHours),
      materialsFound: trend.map((t) => t.topMaterialsFound),
    },
  });
});

router.get('/distribution', (req: Request, res: Response): void => {
  const statuses = [
    'pending_validation',
    'structure_optimization',
    'scf_calculation',
    'band_calculation',
    'topology_analysis',
    'pending_phd_approval',
    'pending_supervisor_approval',
    'completed',
    'error_fallback',
    'paused',
  ];
  const taskStatusDistribution = statuses.map((s) => ({
    name: s,
    count: mockTasks.filter((t) => t.status === s).length,
  }));

  const topologyClasses = [...new Set(mockMaterials.map((m) => m.topologyClass))];
  const topologyClassDistribution = topologyClasses.map((tc) => ({
    name: tc,
    count: mockMaterials.filter((m) => m.topologyClass === tc).length,
  }));

  const groupComparison = [
    {
      groupId: 'group-1',
      groupName: '拓扑量子材料研究组',
      totalTasks: mockTasks.filter((t) => t.groupId === 'group-1').length,
      completedTasks: mockTasks.filter((t) => t.groupId === 'group-1' && t.status === 'completed').length,
      materialsCount: mockMaterials.length,
    },
    {
      groupId: 'group-2',
      groupName: '先进功能材料研究组',
      totalTasks: 0,
      completedTasks: 0,
      materialsCount: 0,
    },
  ];

  res.status(200).json({
    success: true,
    message: '获取分布数据成功',
    data: {
      taskStatusDistribution,
      topologyClassDistribution,
      groupComparison,
    },
  });
});

export default router;
