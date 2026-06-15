import { Router, type Request, type Response } from 'express';
import { mockMaterials } from '../data/mockData.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const formula = req.query.formula as string;
  const spaceGroup = req.query.spaceGroup as string;
  const topologyClass = req.query.topologyClass as string;
  const bandGapMin = parseFloat(req.query.bandGapMin as string);
  const bandGapMax = parseFloat(req.query.bandGapMax as string);

  let filtered = [...mockMaterials];
  if (formula) {
    filtered = filtered.filter((m) => m.formula.toLowerCase().includes(formula.toLowerCase()));
  }
  if (spaceGroup) {
    filtered = filtered.filter((m) => m.spaceGroup.toLowerCase().includes(spaceGroup.toLowerCase()));
  }
  if (topologyClass) {
    filtered = filtered.filter((m) => m.topologyClass.toLowerCase().includes(topologyClass.toLowerCase()));
  }
  if (!isNaN(bandGapMin)) {
    filtered = filtered.filter((m) => m.bandGap >= bandGapMin);
  }
  if (!isNaN(bandGapMax)) {
    filtered = filtered.filter((m) => m.bandGap <= bandGapMax);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  res.status(200).json({
    success: true,
    message: '获取材料列表成功',
    data: {
      items,
      total,
      page,
      pageSize,
    },
  });
});

router.get('/stats', (req: Request, res: Response): void => {
  const topologyClasses = [...new Set(mockMaterials.map((m) => m.topologyClass))];
  const distribution = topologyClasses.map((tc) => ({
    name: tc,
    count: mockMaterials.filter((m) => m.topologyClass === tc).length,
  }));
  const avgBandGap = mockMaterials.reduce((sum, m) => sum + m.bandGap, 0) / mockMaterials.length;
  const verifiedCount = mockMaterials.filter((m) => m.isVerified).length;

  res.status(200).json({
    success: true,
    message: '获取材料统计成功',
    data: {
      total: mockMaterials.length,
      verified: verifiedCount,
      unverified: mockMaterials.length - verifiedCount,
      avgBandGap: Number(avgBandGap.toFixed(4)),
      topologyDistribution: distribution,
      totalCitations: mockMaterials.reduce((sum, m) => sum + m.citations, 0),
    },
  });
});

router.get('/export', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: '导出数据已准备',
    data: {
      downloadUrl: '/downloads/materials_export.csv',
      jsonUrl: '/downloads/materials_export.json',
      format: req.query.format || 'csv',
      count: mockMaterials.length,
    },
  });
});

router.get('/:id', (req: Request, res: Response): void => {
  const material = mockMaterials.find((m) => m.id === req.params.id);
  if (!material) {
    res.status(200).json({
      success: false,
      message: '材料不存在',
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: '获取材料详情成功',
    data: material,
  });
});

export default router;
