import { useState } from 'react';
import {
  Settings, User, Users, Sliders, Shield, Camera, Mail, Building2,
  Lock, Plus, Edit2, Trash2, Search, Check, X, ChevronRight,
  Cpu, Grid3X3, Save, Eye, EyeOff, KeyRound, HardDrive, Send
} from 'lucide-react';
import { mockUsers, researchGroups } from '../data/mockData';
import { cn, formatDate, getRoleText } from '../lib/utils';
import type { UserRole } from '../types';

type SettingsTab = 'profile' | 'users' | 'templates' | 'system';

const functionals = [
  { id: 'f1', name: 'PBE', desc: '通用梯度近似，平衡精度与效率', default: true, type: 'GGA' },
  { id: 'f2', name: 'PBE+U', desc: '含Hubbard U校正，适合强关联体系', default: false, type: 'GGA+U' },
  { id: 'f3', name: 'HSE06', desc: '杂化泛函，高精度带隙计算', default: false, type: 'Hybrid' },
  { id: 'f4', name: 'SCAN', desc: '强约束并适当规范，改进型meta-GGA', default: false, type: 'meta-GGA' },
];

const kpointSchemes = [
  { id: 'k1', name: '粗网格 (快速)', mesh: '6×6×4', desc: '结构预优化，快速测试', default: false },
  { id: 'k2', name: '标准网格', mesh: '12×12×6', desc: '常规计算，推荐默认', default: true },
  { id: 'k3', name: '密网格 (高精度)', mesh: '18×18×10', desc: '精确能带、DOS计算', default: false },
  { id: 'k4', name: '二维体系', mesh: '15×15×1', desc: '二维材料/表面计算', default: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [currentUser] = useState(mockUsers[1]);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('f2');

  const isSupervisorAbove = currentUser.role !== 'phd_student';
  const isAdmin = currentUser.role === 'admin';

  const tabs = [
    { key: 'profile' as SettingsTab, label: '个人资料', icon: User, show: true },
    { key: 'users' as SettingsTab, label: '用户管理', icon: Users, show: isSupervisorAbove },
    { key: 'templates' as SettingsTab, label: '参数模板', icon: Sliders, show: true },
    { key: 'system' as SettingsTab, label: '系统配置', icon: Shield, show: isAdmin },
  ].filter((t) => t.show);

  const filteredUsers = mockUsers.filter((u) =>
    u.realName.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  const roleColors: Record<UserRole, string> = {
    phd_student: 'bg-info/20 text-info border-info/30',
    supervisor: 'bg-primary/20 text-primary border-primary/30',
    chief_scientist: 'bg-secondary/20 text-secondary border-secondary/30',
    admin: 'bg-danger/20 text-danger border-danger/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          系统设置
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-2 sticky top-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all',
                    active
                      ? 'bg-primary/15 border border-primary/30 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                  )}
                >
                  <Icon className={cn('w-5 h-5', active ? 'text-primary' : '')} />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {!tab.show && <span className="ml-auto text-[10px] text-slate-600">权限受限</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> 基本信息
                </h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.realName}
                        className="w-28 h-28 rounded-2xl border-2 border-slate-700 object-cover"
                      />
                      <button className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" /> 更换头像
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">姓名</label>
                      <input defaultValue={currentUser.realName} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3" /> 邮箱</label>
                      <input defaultValue={currentUser.email} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">用户名</label>
                      <input defaultValue={currentUser.username} disabled className="w-full px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1"><Building2 className="w-3 h-3" /> 课题组</label>
                      <input defaultValue={researchGroups[0].name} disabled className="w-full px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-sm text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-2">
                      <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-900 bg-gradient-primary hover:shadow-glow-cyan transition-all flex items-center gap-1.5">
                        <Save className="w-4 h-4" /> 保存修改
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-secondary" /> 修改密码
                </h3>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">当前密码</label>
                    <div className="relative">
                      <input type={showOldPwd ? 'text' : 'password'} placeholder="请输入当前密码" className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-primary/50 focus:outline-none" />
                      <button onClick={() => setShowOldPwd(!showOldPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1"><KeyRound className="w-3 h-3" /> 新密码</label>
                    <div className="relative">
                      <input type={showNewPwd ? 'text' : 'password'} placeholder="至少8位，包含大小写字母和数字" className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-primary/50 focus:outline-none" />
                      <button onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">确认新密码</label>
                    <div className="relative">
                      <input type={showConfirmPwd ? 'text' : 'password'} placeholder="再次输入新密码" className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-primary/50 focus:outline-none" />
                      <button onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-gradient-secondary hover:shadow-glow-purple transition-all flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> 更新密码
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> 课题组成员
                  </h3>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-900 bg-gradient-primary hover:shadow-glow-cyan transition-all flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> 邀请新成员
                  </button>
                </div>
                <div className="mb-4 relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="搜索成员..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-800/30">
                        <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">成员</th>
                        <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">邮箱</th>
                        <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">角色</th>
                        <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">加入时间</th>
                        <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">上次登录</th>
                        <th className="w-20 text-left text-xs font-medium text-slate-400 px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} alt={u.realName} className="w-9 h-9 rounded-lg border border-slate-700" />
                              <div>
                                <p className="text-sm text-white font-medium">{u.realName}</p>
                                <p className="text-xs text-slate-500">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex px-2.5 py-1 rounded-md text-xs font-medium border', roleColors[u.role])}>
                              {getRoleText(u.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.createdAt, 'short')}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.lastLoginAt, 'short')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                              {u.id !== currentUser.id && (
                                <button className="p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" /> 交换关联泛函配置
                  </h3>
                  <button className="px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> 新增泛函
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {functionals.map((f) => {
                    const selected = selectedTemplate === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedTemplate(f.id)}
                        className={cn(
                          'p-4 rounded-xl text-left transition-all border',
                          selected ? 'bg-primary/10 border-primary/40' : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold">{f.name}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">{f.type}</span>
                              {f.default && <span className="px-1.5 py-0.5 rounded text-[10px] bg-success/15 text-success border border-success/30">默认</span>}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                          </div>
                          {selected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30">
                          <button className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          {!f.default && <button className="p-1.5 rounded-md text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                          {!f.default && <span className="ml-auto"><button className="text-[10px] text-slate-500 hover:text-primary">设为默认</button></span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-secondary" /> k点方案
                  </h3>
                  <button className="px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> 新增方案
                  </button>
                </div>
                <div className="space-y-2">
                  {kpointSchemes.map((k) => (
                    <div key={k.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/60 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{k.name}</span>
                          <span className="font-mono text-sm text-primary">{k.mesh}</span>
                          {k.default && <span className="px-1.5 py-0.5 rounded text-[10px] bg-success/15 text-success border border-success/30">默认</span>}
                        </div>
                        <p className="text-xs text-slate-400">{k.desc}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        {!k.default && <button className="p-2 rounded-md text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                        <ChevronRight className="w-4 h-4 text-slate-600 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && isAdmin && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-danger" /> 全局计算参数
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">默认截断能量 (eV)</label>
                    <input type="number" defaultValue={500} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">力收敛阈值 (eV/Å)</label>
                    <input type="number" step="0.0001" defaultValue={0.001} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">能量收敛阈值 (eV)</label>
                    <input type="number" step="1e-9" defaultValue={1e-8} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">默认赝势</label>
                    <select defaultValue="PAW_PBE" className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none">
                      <option>PAW_PBE</option><option>PAW_PW91</option><option>USPP_LDA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">拓扑判定带隙阈值 (eV)</label>
                    <input type="number" step="0.01" defaultValue={0.05} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">最大并行任务数</label>
                    <input type="number" defaultValue={8} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-warning" /> 邮件服务器配置
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1.5">SMTP 服务器地址</label>
                    <input defaultValue="smtp.lab.edu.cn" className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">端口</label>
                    <input type="number" defaultValue={465} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">加密方式</label>
                    <select defaultValue="SSL" className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none">
                      <option>SSL</option><option>TLS</option><option>无</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">发件账号</label>
                    <input defaultValue="noreply@lab.edu.cn" className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">授权码</label>
                    <input type="password" defaultValue="********" className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-info" /> 存储配置
                  </h3>
                  <div className="text-xs text-slate-400">已使用 428.6 GB / 2 TB (21.4%)</div>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden mb-6">
                  <div className="h-full w-[21.4%] bg-gradient-to-r from-info to-primary rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">单个任务存储上限 (GB)</label>
                    <input type="number" defaultValue={50} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">自动清理周期 (天)</label>
                    <input type="number" defaultValue={90} className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-sm text-white focus:border-primary/50 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-slate-700/40">
                  <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-900 bg-gradient-primary hover:shadow-glow-cyan transition-all flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> 保存全部配置
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
