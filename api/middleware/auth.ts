import type { Request, Response, NextFunction } from 'express';
import { mockUsers } from '../data/mockData.js';

export interface UserInfo {
  userId: string;
  role: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user: UserInfo;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: '未授权访问，请先登录',
      code: 401,
    });
    return;
  }

  const token = authHeader.slice(7);

  if (!token.startsWith('tpf_')) {
    res.status(401).json({
      success: false,
      error: '无效的访问凭证',
      code: 401,
    });
    return;
  }

  const parts = token.split('_');
  if (parts.length < 3) {
    res.status(401).json({
      success: false,
      error: '无效的访问凭证',
      code: 401,
    });
    return;
  }

  const userId = parts[2];
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    res.status(401).json({
      success: false,
      error: '无效的访问凭证',
      code: 401,
    });
    return;
  }

  req.user = {
    userId: user.id,
    role: user.role,
    username: user.username,
  };

  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: '权限不足，无法执行此操作',
        code: 403,
      });
      return;
    }
    next();
  };
};
