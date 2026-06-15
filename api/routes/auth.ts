import { Router, type Request, type Response } from 'express';
import { mockUsers } from '../data/mockData.js';

const router = Router();

router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body;
  const testAccounts: Record<string, { password: string; userId: string }> = {
    liuxiaoming: { password: '123456', userId: 'user-1' },
    wangsupervisor: { password: '123456', userId: 'user-2' },
    chenchief: { password: '123456', userId: 'user-3' },
    admin01: { password: '123456', userId: 'user-4' },
  };
  const account = testAccounts[username];
  if (!account || account.password !== password) {
    res.status(200).json({
      success: false,
      message: '用户名或密码错误',
    });
    return;
  }
  const user = mockUsers.find((u) => u.id === account.userId);
  if (!user) {
    res.status(200).json({
      success: false,
      message: '用户不存在',
    });
    return;
  }
  const accessToken = 'mock_access_token_' + Date.now();
  const refreshToken = 'mock_refresh_token_' + Date.now();
  res.status(200).json({
    success: true,
    message: '登录成功',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

router.post('/register', (req: Request, res: Response): void => {
  const { username, email, password, realName } = req.body;
  if (!username || !email || !password) {
    res.status(200).json({
      success: false,
      message: '请填写完整的注册信息',
    });
    return;
  }
  const newUser = {
    id: 'user-' + (mockUsers.length + 1),
    username,
    email,
    realName: realName || username,
    role: 'phd_student' as const,
    groupId: 'group-1',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  res.status(200).json({
    success: true,
    message: '注册成功',
    data: {
      user: newUser,
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    },
  });
});

router.post('/logout', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: '退出登录成功',
  });
});

router.get('/me', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  let userId = 'user-1';
  if (authHeader) {
    if (authHeader.includes('user-2') || authHeader.includes('wangsupervisor')) {
      userId = 'user-2';
    } else if (authHeader.includes('user-3') || authHeader.includes('chenchief')) {
      userId = 'user-3';
    } else if (authHeader.includes('user-4') || authHeader.includes('admin01')) {
      userId = 'user-4';
    }
  }
  const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
  res.status(200).json({
    success: true,
    message: '获取用户信息成功',
    data: user,
  });
});

export default router;
