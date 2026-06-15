import { Router, type Request, type Response } from 'express';
import { mockTasks, mockMaterials } from '../data/mockData.js';

const router = Router();

export interface ReportRecord {
  id: string;
  type: 'pdf' | 'csv' | 'json' | 'vaspkit';
  taskIds: string[];
  filename: string;
  downloadUrl: string;
  size: string;
  createdAt: string;
  content?: string;
}

const reportStorage = new Map<string, ReportRecord>();

router.post('/generate', (req: Request, res: Response): void => {
  const { taskIds, options } = req.body;
  const timestamp = Date.now();
  const id = `report-${timestamp}`;
  const filename = `topoflow_report_${timestamp}.pdf`;
  const downloadUrl = `/api/reports/download/${id}`;

  const content = `
TopoFlow 拓扑材料计算报告
========================

生成时间: ${new Date().toLocaleString('zh-CN')}
报告ID: ${id}

== 报告配置 ==
包含任务数: ${taskIds?.length || 0}
包含封面: ${options?.includeCover !== false}
能带结构图: ${options?.includeBandStructure !== false}
态密度图: ${options?.includeDOS !== false}
拓扑分析结果: ${options?.includeTopologyAnalysis !== false}
收敛曲线: ${options?.includeConvergence === true}

== 摘要统计 ==
总拓扑材料: ${mockMaterials.length} 种
总任务数: ${mockTasks.length} 个
平均带隙: ${(mockMaterials.reduce((s, m) => s + m.bandGap, 0) / mockMaterials.length).toFixed(3)} eV

== 包含的任务 ==
${(taskIds || []).map((tid: string) => {
    const task = mockTasks.find((t) => t.id === tid);
    return task ? `- ${task.formula} (${task.title})` : `- ${tid} (未知任务)`;
  }).join('\n')}

== 报告结束 ==
  `.trim();

  const record: ReportRecord = {
    id,
    type: 'pdf',
    taskIds: taskIds || [],
    filename,
    downloadUrl,
    size: '2.4 MB',
    createdAt: new Date().toISOString(),
    content,
  };

  reportStorage.set(id, record);

  res.status(200).json({
    success: true,
    message: 'PDF报告生成成功',
    data: {
      id,
      filename,
      downloadUrl,
      size: '2.4 MB',
    },
  });
});

router.post('/export', (req: Request, res: Response): void => {
  const { taskIds, fields, format, filters } = req.body;
  const timestamp = Date.now();
  const id = `export-${timestamp}`;
  const ext = format || 'csv';
  const filename = `topoflow_export_${timestamp}.${ext}`;
  const downloadUrl = `/api/reports/download/${id}`;

  const sizeMap: Record<string, string> = {
    csv: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    json: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
    vaspkit: `${(Math.random() * 4 + 2).toFixed(1)} MB`,
  };

  let content = '';
  if (ext === 'csv') {
    const headers = (fields || []).join(',');
    const rows = (taskIds || []).map((tid: string) => {
      const task = mockTasks.find((t) => t.id === tid);
      return task ? `${task.id},${task.formula},${task.status}` : tid;
    }).join('\n');
    content = `${headers}\n${rows}`;
  } else if (ext === 'json') {
    content = JSON.stringify({
      exportTime: new Date().toISOString(),
      fields: fields || [],
      filters: filters || {},
      tasks: (taskIds || []).map((tid: string) => {
        const task = mockTasks.find((t) => t.id === tid);
        return task ? { id: task.id, formula: task.formula, status: task.status } : { id: tid };
      }),
    }, null, 2);
  } else {
    content = `# VASPKIT Export\n# Generated: ${new Date().toLocaleString('zh-CN')}\n# Fields: ${(fields || []).join(', ')}\n\n`;
    (taskIds || []).forEach((tid: string) => {
      const task = mockTasks.find((t) => t.id === tid);
      if (task) {
        content += `# Task: ${task.id} - ${task.formula}\n`;
        content += `POSCAR for ${task.formula}\n1.0\n1.0 0.0 0.0\n0.0 1.0 0.0\n0.0 0.0 1.0\n${task.formula.replace(/[0-9]/g, '')}\nDirect\n0.0 0.0 0.0\n\n`;
      }
    });
  }

  const record: ReportRecord = {
    id,
    type: ext as any,
    taskIds: taskIds || [],
    filename,
    downloadUrl,
    size: sizeMap[ext] || '1.0 MB',
    createdAt: new Date().toISOString(),
    content,
  };

  reportStorage.set(id, record);

  res.status(200).json({
    success: true,
    message: '数据导出成功',
    data: {
      id,
      filename,
      downloadUrl,
      size: record.size,
    },
  });
});

router.get('/download/:id', (req: Request, res: Response): void => {
  const record = reportStorage.get(req.params.id);

  if (!record) {
    res.status(404).json({
      success: false,
      message: '文件不存在或已过期',
    });
    return;
  }

  const contentTypeMap: Record<string, string> = {
    pdf: 'application/pdf',
    csv: 'text/csv; charset=utf-8',
    json: 'application/json; charset=utf-8',
    vaspkit: 'text/plain; charset=utf-8',
  };

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(record.filename)}"`);
  res.setHeader('Content-Type', contentTypeMap[record.type] || 'application/octet-stream');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

  if (record.type === 'pdf') {
    const pdfContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Count 1/Kids[3 0 R]>>\nendobj\n3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>>>\nendobj\n4 0 obj\n<</Length ${record.content?.length || 0}>>\nstream\nBT\n/F1 12 Tf\n50 750 Td\n${record.content?.split('\n').map((line, i) => `(${line.replace(/[()\\]/g, '\\$&')}) Tj\n0 -15 Td\n`).join('')}ET\nendstream\nendobj\nxref\n0 5\ntrailer\n<</Size 5/Root 1 0 R>>\nstartxref\n1000\n%%EOF`;
    res.send(pdfContent);
  } else {
    res.send(record.content || '');
  }
});

router.get('/history', (req: Request, res: Response): void => {
  const items = Array.from(reportStorage.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.status(200).json({
    success: true,
    message: '获取导出历史成功',
    data: {
      items,
      total: items.length,
    },
  });
});

export default router;
