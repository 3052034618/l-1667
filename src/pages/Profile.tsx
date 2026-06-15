import { Link } from 'react-router-dom';
import { User, Mail, Shield, ChevronLeft, Calendar } from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/authStore';

const roleLabels: Record<UserRole, string> = {
  admin: '系统管理员',
  phd_student: '博士研究生',
  supervisor: '导师',
  chief_scientist: '首席科学家',
};

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>返回</span>
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">个人资料</h1>
      <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-700/50 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-cyan-500/20">
            {user?.realName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">{user?.realName || '未知用户'}</h2>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                {roleLabels[user?.role || 'phd_student']}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">用户ID</p>
              <p className="text-white font-mono text-sm">{user?.id || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">用户名</p>
              <p className="text-white text-sm">{user?.username || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50">
              <Mail className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">邮箱</p>
              <p className="text-white text-sm">{user?.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50">
              <Shield className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">权限角色</p>
              <p className="text-white text-sm">{roleLabels[user?.role || 'phd_student']}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">注册时间</p>
              <p className="text-white text-sm">{user?.createdAt || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">最后登录</p>
              <p className="text-white text-sm">{user?.lastLoginAt || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
