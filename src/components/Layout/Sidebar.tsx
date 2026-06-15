import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  ClipboardCheck,
  Database,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  hasBadge?: boolean;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: '统计看板', icon: LayoutDashboard },
  { path: '/tasks', label: '任务管理', icon: ListTodo },
  { path: '/approvals', label: '审批中心', icon: ClipboardCheck },
  { path: '/materials', label: '材料数据库', icon: Database },
  { path: '/reports', label: '报告导出', icon: FileText },
  { path: '/notifications', label: '消息中心', icon: Bell, hasBadge: true },
  { path: '/settings', label: '系统设置', icon: Settings },
];

const roleLabels: Record<UserRole, string> = {
  admin: '系统管理员',
  phd_student: '博士研究生',
  supervisor: '导师',
  chief_scientist: '首席科学家',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div
          className={cn(
            'flex items-center h-16 px-4 border-b border-slate-700/50',
            collapsed ? 'justify-center' : 'gap-3'
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/20">
            <Hexagon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">TopoFlow</span>
              <span className="text-[10px] text-slate-400">高通量计算平台</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  collapsed ? 'justify-center' : '',
                  active
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border-l-2 border-transparent'
                )}
              >
                <div className="relative flex-shrink-0">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
                  )}
                </div>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/50 p-3">
          {user ? (
            <div
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer',
                collapsed ? 'justify-center' : ''
              )}
            >
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user.realName.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-white truncate">{user.realName}</span>
                  <span className="text-xs text-slate-400 truncate">
                    {roleLabels[user.role] || user.role}
                  </span>
                </div>
              )}
            </div>
          ) : (
            !collapsed && (
              <div className="text-sm text-slate-500 text-center py-2">未登录</div>
            )
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-md',
          collapsed ? 'rotate-180' : ''
        )}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
