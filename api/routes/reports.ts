import { Router, type Request, type Response } from 'express';
import { mockTasks, mockMaterials } from '../data/mockData.js';

const router = Router();

const exportHistory: any[] = [
  {
    id: 'report-1',
    type: 'pdf',
    title: '2026年6月拓扑材料计算报告',
    createdAt: '2026-06-01T10:00:00Z',
    downloadUrl: '/downloads/report-2026-06.pdf',
    fileSize: '2.4 MB',
    status: 'ready',
  },
  {
    id: 'report-2',
    type: 'csv',
    title: '材料数据库导出 (2026-05-28)',
    createdAt: '2026-05-28T14:30:00Z',
    downloadUrl: '/downloads/materials-2026-05-28.csv',
    fileSize: '856 KB',
    status: 'ready',
  },
  {
    id: 'report-3',
    type: 'json',
    title: '任务计算结果批量导出',
    createdAt: '2026-05-20T09:15:00Z',
    downloadUrl: '/downloads/tasks-export-2026-05-20.json',
    fileSize: '4.2 MB',
    status: 'ready',
  },
];

router.post('/generate', (req: Request, res: Response): void => {
  const { title, templateType, filters } = req.body;
  const reportId = 'report-' + (exportHistory.length + 1);
  const newReport = {
    id: reportId,
    type: 'pdf',
    title: title || '计算结果报告',
    createdAt: new Date().toISOString(),
    downloadUrl: `/downloads/${reportId}.pdf`,
    fileSize: (Math.random() * 3 + 1).toFixed(1) + ' MB',
    status: 'processing',
    templateType: templateType || 'standard',
    filters: filters || {},
    stats: {
      tasksIncluded: mockTasks.length,
      materialsIncluded: mockMaterials.length,
      generateTime: '约15秒',
    },
  };
  setTimeout(() => {
    newReport.status = 'ready';
  }, 100);
  exportHistory.unshift(newReport);
  res.status(200).json({
    success: true,
    message: '报告生成任务已提交',
    data: newReport,
  });
});

router.post('/export', (req: Request, res: Response): void => {
  const { fields, format, filters } = req.body;
  const exportId = 'export-' + Date.now();
  const url = `/downloads/${exportId}.${format || 'csv'}`;
  res.status(200).json({
    success: true,
    message: '数据导出成功',
    data: {
      id: exportId,
      downloadUrl: url,
      format: format || 'csv',
      fields: fields || ['all'],
      filters: filters || {},
      count: mockTasks.length + mockMaterials.length,
      fileSize: (Math.random() * 5 + 0.5).toFixed(1) + ' MB',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    },
  });
});

router.get('/history', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: '获取导出历史成功',
    data: {
      items: exportHistory,
      total: exportHistory.length,
    },
  });
});

router.get('/:id/download', (req: Request, res: Response): void => {
  const report = exportHistory.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(200).json({
      success: false,
      message: '报告不存在',
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: '下载链接已生成',
    data: {
      ...report,
      downloadUrl: report.downloadUrl,
      expiresIn: 3600,
    },
  });
});

export default router;
