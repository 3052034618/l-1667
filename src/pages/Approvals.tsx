import { useState, useMemo, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, Clock, UserCheck, CalendarDays } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { cn, formatDate, getStatusColor, getStatusText } from '../lib/utils';
import type { ComputationTask } from '../types';

type TabType = 'pending' | 'approved';

export default function Approvals() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  
  const { user } = useAuthStore();
  const tasks = useTaskStore((s) => s.getTasks());
  const submitApproval = useTaskStore((s) => s.submitApproval);
  const batchSubmitApproval = useTaskStore((s) => s.batchSubmitApproval);
  const loadTasksFromStorage = useTaskStore((s) => s.loadTasksFromStorage);

  useEffect(() => {
    loadTasksFromStorage();
  }, [loadTasksFromStorage]);

  const phdPending = useMemo(() => tasks.filter((t) => t.status === 'pending_phd_approval'), [tasks]);
  const supervisorPending = useMemo(() => tasks.filter((t) => t.status === 'pending_supervisor_approval'), [tasks]);
  const allPending = useMemo(() => [...phdPending, ...supervisorPending], [phdPending, supervisorPending]);

  const approvedThisWeek = useMemo(() => tasks.filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    return d >= weekAgo && (t.status === 'completed');
  }), [tasks]);

  const approvedThisMonth = useMemo(() => tasks.filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.status === 'completed';
  }), [tasks]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === allPending.length) setSelectedIds([]);
    else setSelectedIds(allPending.map((t) => t.id));
  };

  const getApprovalType = (t: ComputationTask) => (t.status === 'pending_phd_approval' ? 'phd' : 'supervisor');

  const getWaitTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)} 分钟`;
    if (hours < 24) return `${hours} 小时`;
    return `${Math.floor(hours / 24)} 天 ${hours % 24} 小时`;
  };

  const handleApprove = (id: string) => {
    if (!user) return;
    const task = allPending.find((t) => t.id === id);
    if (!task) return;
    
    const approvalType = user.role === 'phd_student' ? 'phd' : 'supervisor';
    submitApproval(id, approvalType, 'approved', comments[id] || '', user.id, user.realName);
    
    setComments((prev) => {
      const newComments = { ...prev };
      delete newComments[id];
      return newComments;
    });
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setExpandedId(null);
  };

  const handleReject = (id: string) => {
    if (!user) return;
    const task = allPending.find((t) => t.id === id);
    if (!task) return;
    
    const approvalType = user.role === 'phd_student' ? 'phd' : 'supervisor';
    submitApproval(id, approvalType, 'rejected', comments[id] || '', user.id, user.realName);
    
    setComments((prev) => {
      const newComments = { ...prev };
      delete newComments[id];
      return newComments;
    });
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setExpandedId(null);
  };

  const handleBatchApprove = () => {
    if (!user || selectedIds.length === 0) return;
    
    const approvalType = user.role === 'phd_student' ? 'phd' : 'supervisor';
    const selectedTasks = tasks.filter((t) => selectedIds.includes(t.id));
    const phdTasks = selectedTasks.filter((t) => t.status === 'pending_phd_approval').map((t) => t.id);
    const supervisorTasks = selectedTasks.filter((t) => t.status === 'pending_supervisor_approval').map((t) => t.id);
    
    if (phdTasks.length > 0 && approvalType === 'phd') {
      batchSubmitApproval(phdTasks, 'phd', 'approved', '', user.id, user.realName);
    }
    if (supervisorTasks.length > 0 && approvalType === 'supervisor') {
      batchSubmitApproval(supervisorTasks, 'supervisor', 'approved', '', user.id, user.realName);
    }
    
    setSelectedIds([]);
    setComments({});
  };

  const handleBatchReject = () => {
    if (!user || selectedIds.length === 0) return;
    
    const approvalType = user.role === 'phd_student' ? 'phd' : 'supervisor';
    const selectedTasks = tasks.filter((t) => selectedIds.includes(t.id));
    const phdTasks = selectedTasks.filter((t) => t.status === 'pending_phd_approval').map((t) => t.id);
    const supervisorTasks = selectedTasks.filter((t) => t.status === 'pending_supervisor_approval').map((t) => t.id);
    
    if (phdTasks.length > 0 && approvalType === 'phd') {
      batchSubmitApproval(phdTasks, 'phd', 'rejected', '', user.id, user.realName);
    }
    if (supervisorTasks.length > 0 && approvalType === 'supervisor') {
      batchSubmitApproval(supervisorTasks, 'supervisor', 'rejected', '', user.id, user.realName);
    }
    
    setSelectedIds([]);
    setComments({});
  };

  const displayTasks = useMemo(() => {
    if (activeTab === 'pending') return allPending;
    return tasks.filter((t) => t.status === 'completed').slice(0, 8);
  }, [activeTab, allPending, tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-primary" />
          审批中心
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow-cyan opacity-30" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">待博士生审批</p>
              <p className="text-3xl font-bold text-cyan-400">{phdPending.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/15">
              <UserCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow-purple opacity-30" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">待导师审批</p>
              <p className="text-3xl font-bold text-secondary">{supervisorPending.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/15">
              <ClipboardCheck className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">本周已审批</p>
              <p className="text-3xl font-bold text-success">{approvedThisWeek.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-success/15">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">本月已审批</p>
              <p className="text-3xl font-bold text-white">{approvedThisMonth.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-700/50">
              <CalendarDays className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700/50">
          <div className="flex">
            {[
              { key: 'pending', label: '待我审批', count: allPending.length },
              { key: 'approved', label: '我已审批' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={cn(
                  'px-6 py-4 text-sm font-medium transition-colors relative',
                  activeTab === tab.key
                    ? 'text-primary'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-danger/20 text-danger border border-danger/30">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary" />
                )}
              </button>
            ))}
          </div>
          {activeTab === 'pending' && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-4">
              <span className="text-xs text-slate-400">已选 {selectedIds.length} 项</span>
              <button
                onClick={handleBatchApprove}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-900 bg-success hover:shadow-glow-success transition-all"
              >
                批量通过
              </button>
              <button
                onClick={handleBatchReject}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-danger hover:shadow-glow-danger transition-all"
              >
                批量驳回
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                {activeTab === 'pending' && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === allPending.length && allPending.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-cyan-500"
                    />
                  </th>
                )}
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">任务ID</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">分子式</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">空间群</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">状态</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">提交时间</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">等待时长</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">提交人</th>
                <th className="w-24 text-left text-xs font-medium text-slate-400 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {displayTasks.map((task) => {
                const expanded = expandedId === task.id;
                const approvalType = getApprovalType(task);
                return (
                  <>
                    <tr
                      key={task.id}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      {activeTab === 'pending' && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(task.id)}
                            onChange={() => toggleSelect(task.id)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-cyan-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-4 text-xs text-slate-400 font-mono">{task.id}</td>
                      <td className="px-4 py-4">
                        <span className="text-white font-semibold text-lg bg-gradient-mixed bg-clip-text text-transparent">
                          {task.formula}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300">
                        {task.crystalStructure.spaceGroup}
                        <span className="ml-1 text-xs text-primary font-mono">#{task.crystalStructure.spaceGroupNumber}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'inline-flex px-2.5 py-1 rounded-md text-xs font-medium border',
                          getStatusColor(task.status)
                        )}>
                          {getStatusText(task.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(task.createdAt, 'short')}
                      </td>
                      <td className="px-4 py-4 text-xs text-warning flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getWaitTime(task.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-300">
                        {task.creatorName}
                        {approvalType === 'supervisor' && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-secondary/20 text-secondary border border-secondary/30">
                            导师审
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => alert(`查看任务详情: ${task.id}`)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {activeTab === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(task.id)}
                                className="p-1.5 rounded-md text-success hover:bg-success/15 transition-colors"
                                title="通过"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(task.id)}
                                className="p-1.5 rounded-md text-danger hover:bg-danger/15 transition-colors"
                                title="驳回"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setExpandedId(expanded ? null : task.id)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                              >
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {activeTab === 'pending' && expanded && (
                      <tr className="border-b border-slate-700/30 bg-slate-800/20">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="flex items-start gap-4 max-w-3xl">
                            <div className="flex-1">
                              <label className="block text-xs text-slate-400 mb-1.5">审批意见</label>
                              <textarea
                                value={comments[task.id] || ''}
                                onChange={(e) => setComments({ ...comments, [task.id]: e.target.value })}
                                rows={2}
                                placeholder="请输入审批意见（可选）..."
                                className="w-full px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-primary/50 focus:outline-none resize-none"
                              />
                            </div>
                            <div className="flex flex-col gap-2 pt-5">
                              <button
                                onClick={() => handleApprove(task.id)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-900 bg-success hover:shadow-glow-success transition-all whitespace-nowrap"
                              >
                                ✓ 快速通过
                              </button>
                              <button
                                onClick={() => handleReject(task.id)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-danger hover:shadow-glow-danger transition-all whitespace-nowrap"
                              >
                                ✕ 驳回修改
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {displayTasks.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 9 : 8} className="px-4 py-12 text-center text-slate-500 text-sm">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
