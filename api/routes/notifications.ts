import { Router, type Request, type Response } from 'express';
import { mockNotifications } from '../data/mockData.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  const type = req.query.type as string;
  const read = req.query.read as string;
  let filtered = [...mockNotifications];
  if (type) {
    filtered = filtered.filter((n) => n.type === type);
  }
  if (read === 'true') {
    filtered = filtered.filter((n) => n.isRead);
  } else if (read === 'false') {
    filtered = filtered.filter((n) => !n.isRead);
  }
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.status(200).json({
    success: true,
    message: '获取通知列表成功',
    data: {
      items: filtered,
      total: filtered.length,
      unreadCount: filtered.filter((n) => !n.isRead).length,
    },
  });
});

router.get('/unread-count', (req: Request, res: Response): void => {
  const count = mockNotifications.filter((n) => !n.isRead).length;
  res.status(200).json({
    success: true,
    message: '获取未读数量成功',
    data: {
      unreadCount: count,
    },
  });
});

router.put('/:id/read', (req: Request, res: Response): void => {
  const notif = mockNotifications.find((n) => n.id === req.params.id);
  if (!notif) {
    res.status(200).json({
      success: false,
      message: '通知不存在',
    });
    return;
  }
  notif.isRead = true;
  res.status(200).json({
    success: true,
    message: '标记已读成功',
    data: notif,
  });
});

router.put('/read-all', (req: Request, res: Response): void => {
  mockNotifications.forEach((n) => {
    n.isRead = true;
  });
  res.status(200).json({
    success: true,
    message: '全部标记已读成功',
    data: {
      updatedCount: mockNotifications.length,
    },
  });
});

router.delete('/:id', (req: Request, res: Response): void => {
  const idx = mockNotifications.findIndex((n) => n.id === req.params.id);
  if (idx === -1) {
    res.status(200).json({
      success: false,
      message: '通知不存在',
    });
    return;
  }
  mockNotifications.splice(idx, 1);
  res.status(200).json({
    success: true,
    message: '删除通知成功',
  });
});

router.delete('/read', (req: Request, res: Response): void => {
  const initialLen = mockNotifications.length;
  for (let i = mockNotifications.length - 1; i >= 0; i--) {
    if (mockNotifications[i].isRead) {
      mockNotifications.splice(i, 1);
    }
  }
  res.status(200).json({
    success: true,
    message: '删除已读通知成功',
    data: {
      deletedCount: initialLen - mockNotifications.length,
    },
  });
});

export default router;
