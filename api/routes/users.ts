import { Router, type Request, type Response } from 'express';
import { mockUsers, type User, type UserRole } from '../data/mockData.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireRole(['supervisor', 'chief_scientist', 'admin']), (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: '获取用户列表成功',
    data: mockUsers,
  });
});

router.post('/invite', requireRole(['supervisor', 'chief_scientist', 'admin']), (req: Request, res: Response): void => {
  const { email, role, realName } = req.body;

  if (!email || !role) {
    res.status(200).json({
      success: false,
      message: '请填写完整的邀请信息',
    });
    return;
  }

  const validRoles: UserRole[] = ['phd_student', 'supervisor', 'chief_scientist', 'admin'];
  if (!validRoles.includes(role as UserRole)) {
    res.status(200).json({
      success: false,
      message: '无效的用户角色',
    });
    return;
  }

  const existingUser = mockUsers.find((u) => u.email === email);
  if (existingUser) {
    res.status(200).json({
      success: false,
      message: '该邮箱已被注册',
    });
    return;
  }

  const username = email.split('@')[0];
  const newUser: User = {
    id: 'user-' + (mockUsers.length + 1),
    username,
    email,
    realName: realName || username,
    role: role as UserRole,
    groupId: 'group-1',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);

  res.status(200).json({
    success: true,
    message: '用户邀请成功',
    data: newUser,
  });
});

router.put('/:id/role', requireRole(['chief_scientist', 'admin']), (req: Request, res: Response): void => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles: UserRole[] = ['phd_student', 'supervisor', 'chief_scientist', 'admin'];
  if (!validRoles.includes(role as UserRole)) {
    res.status(200).json({
      success: false,
      message: '无效的用户角色',
    });
    return;
  }

  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    res.status(200).json({
      success: false,
      message: '用户不存在',
    });
    return;
  }

  user.role = role as UserRole;

  res.status(200).json({
    success: true,
    message: '用户角色更新成功',
    data: user,
  });
});

router.delete('/:id', requireRole(['admin']), (req: Request, res: Response): void => {
  const { id } = req.params;

  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    res.status(200).json({
      success: false,
      message: '用户不存在',
    });
    return;
  }

  const deletedUser = mockUsers.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: '用户删除成功',
    data: deletedUser,
  });
});

export default router;
