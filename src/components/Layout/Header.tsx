import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Home,
  Slash,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, { label: string; path?: string }[]> = {
  '/dashboard': [{ label: '统计看板' }],
  '/tasks': [{ label: '任务管理' }],
  '/approvals': [{ label: '审批中心' }],
  '/materials': [{ label: '材料数据库' }],
  '/reports': [{ label: '报告导出' }],
  '/notifications': [{ label: '消息中心' }],
  '/settings': [{ label: '系统设置' }],
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = 5;

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return [{ label: '首页', path: '/' }];
    }

    const basePath = '/' + segments[0];
    const crumbs: { label: string; path?: string }[] = [{ label: '首页', path: '/' }];

    if (breadcrumbMap[basePath]) {
      crumbs.push(...breadcrumbMap[basePath]);
    } else {
      crumbs.push({ label: segments[0] });
    }

    if (segments.length > 1) {
      for (let i = 1; i < segments.length; i++) {
        crumbs.push({ label: segments[i] });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewTask = () => {
    navigate('/tasks/new');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center h-full px-6 gap-4">
        <nav className="flex items-center gap-2 text-sm min-w-0 flex-shrink-0">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2 min-w-0">
              {idx > 0 && <Slash className="w-4 h-4 text-slate-600 flex-shrink-0" />}
              {crumb.path && idx < breadcrumbs.length - 1 ? (
                <Link
                  to={crumb.path}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors truncate"
                >
                  {idx === 0 && <Home className="w-4 h-4" />}
                  <span className="truncate">{crumb.label}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
                  {idx === 0 && <Home className="w-4 h-4" />}
                  <span className="truncate">{crumb.label}</span>
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="relative max-w-md w-full hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索任务、材料、报告..."
            className="w-full h-9 pl-10 pr-4 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
          />
        </div>

        <button
          onClick={handleNewTask}
          className="group flex items-center gap-2 px-4 py-2 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-medium hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新建任务</span>
        </button>

        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-all"
          aria-label="通知"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-slate-900">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 h-9 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.realName.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium text-white">{user?.realName || '用户'}</span>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-1.5 rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xl shadow-black/30 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors rounded-lg mx-1.5"
              >
                <User className="w-4 h-4" />
                <span>个人资料</span>
              </Link>
              <div className="my-1 mx-3 border-t border-slate-700/50" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-lg mx-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
