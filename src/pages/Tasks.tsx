import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  X,
  Beaker,
  Users,
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { researchGroups } from '@/data/mockData';
import type { TaskStatus } from '@/types';
import { cn, getStatusColor, getStatusText } from '@/lib/utils';
import TaskCard from '@/components/Task/TaskCard';
import CreateTaskModal from '@/components/Task/CreateTaskModal';

const ALL_STATUSES: TaskStatus[] = [
  'pending_validation',
  'structure_optimization',
  'scf_calculation',
  'band_calculation',
  'topology_analysis',
  'pending_phd_approval',
  'pending_supervisor_approval',
  'completed',
  'error_fallback',
  'paused',
];

const statusDotColors: Record<TaskStatus, string> = {
  pending_validation: 'bg-amber-400',
  structure_optimization: 'bg-blue-400',
  scf_calculation: 'bg-blue-400',
  band_calculation: 'bg-purple-400',
  topology_analysis: 'bg-purple-400',
  pending_phd_approval: 'bg-amber-400',
  pending_supervisor_approval: 'bg-amber-400',
  completed: 'bg-emerald-400',
  error_fallback: 'bg-red-400',
  paused: 'bg-slate-400',
};

type SortKey = 'createdAt_desc' | 'createdAt_asc' | 'progress_desc' | 'progress_asc';

export default function Tasks() {
  const { getFilteredTasks, setFilters, filters, updateTaskStatus, createTask } = useTaskStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt_desc');
  const [modalOpen, setModalOpen] = useState(false);

  const allTasks = useTaskStore((s) => s.tasks);

  const filteredTasks = useMemo(() => {
    let result = getFilteredTasks();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.formula.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q)
      );
    }

    if (selectedStatuses.length > 0) {
      result = result.filter((t) => selectedStatuses.includes(t.status));
    }

    if (selectedGroup) {
      result = result.filter((t) => t.groupId === selectedGroup);
    }

    switch (sortKey) {
      case 'createdAt_desc':
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'createdAt_asc':
        result = [...result].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'progress_desc':
        result = [...result].sort((a, b) => b.progress - a.progress);
        break;
      case 'progress_asc':
        result = [...result].sort((a, b) => a.progress - b.progress);
        break;
    }

    return result;
  }, [getFilteredTasks, searchQuery, selectedStatuses, selectedGroup, sortKey]);

  const statusCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      pending_validation: 0,
      structure_optimization: 0,
      scf_calculation: 0,
      band_calculation: 0,
      topology_analysis: 0,
      pending_phd_approval: 0,
      pending_supervisor_approval: 0,
      completed: 0,
      error_fallback: 0,
      paused: 0,
    };
    allTasks.forEach((t) => {
      counts[t.status]++;
    });
    return counts;
  }, [allTasks]);

  const toggleStatus = (status: TaskStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedGroup('');
    setFilters({});
  };

  const handlePauseResume = (id: string) => {
    const task = allTasks.find((t) => t.id === id);
    if (!task) return;
    if (task.status === 'paused') {
      updateTaskStatus(id, 'structure_optimization');
    } else {
      updateTaskStatus(id, 'paused');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此任务吗？此操作不可撤销。')) {
      useTaskStore.getState().deleteTask(id);
    }
  };

  const handleCreateTask = (data: any) => {
    if (!user) return;
    createTask({
      title: data.title,
      description: '通过任务看板创建',
      formula: data.formula,
      crystalStructure: data.crystalStructure,
      calculationParams: data.calculationParams,
      tags: ['新建'],
      creatorId: user.id,
      creatorName: user.realName,
      groupId: user.groupId,
    });
  };

  const hasActiveFilters =
    searchQuery || selectedStatuses.length > 0 || selectedGroup;

  return (
    <div className="relative pb-24">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">任务管理看板</h1>
            <p className="text-sm text-slate-400 mt-1">
              共 {allTasks.length} 个任务 · 当前显示 {filteredTasks.length} 个
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className={cn(
              'inline-flex items-center gap-2 h-10 px-5 rounded-xl',
              'bg-gradient-mixed text-white font-semibold text-sm',
              'shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all duration-300',
              'hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            <Plus className="w-4.5 h-4.5" />
            新建任务
          </button>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索分子式、任务ID或标题..."
                className={cn(
                  'w-full h-10 pl-10 pr-4 rounded-lg text-sm',
                  'bg-slate-800/60 border border-slate-700/50',
                  'text-white placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={cn(
                  'h-10 px-3 pr-8 rounded-lg text-sm appearance-none cursor-pointer',
                  'bg-slate-800/60 border border-slate-700/50',
                  'text-white',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all'
                )}
              >
                <option value="">所有研究组</option>
                {researchGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className={cn(
                  'h-10 px-3 pr-8 rounded-lg text-sm appearance-none cursor-pointer',
                  'bg-slate-800/60 border border-slate-700/50',
                  'text-white',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all'
                )}
              >
                <option value="createdAt_desc">最新创建</option>
                <option value="createdAt_asc">最早创建</option>
                <option value="progress_desc">进度从高到低</option>
                <option value="progress_asc">进度从低到高</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                清除筛选
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => {
            const active = selectedStatuses.includes(status);
            const count = statusCounts[status];
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={cn(
                  'inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200 border',
                  active
                    ? getStatusColor(status).replace('/20', '/15').replace('/30', '/40') + ' shadow-sm'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:bg-slate-800/60 hover:border-slate-600/60'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', statusDotColors[status])} />
                {getStatusText(status)}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold',
                    active ? 'bg-white/15 text-white' : 'bg-slate-700/60 text-slate-300'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {ALL_STATUSES.map((status) => (
            <div
              key={status}
              className={cn(
                'rounded-lg border p-2.5 text-center transition-all',
                'bg-slate-900/40 border-slate-700/40 hover:border-slate-600/50'
              )}
            >
              <div className={cn('w-2 h-2 rounded-full mx-auto mb-1.5', statusDotColors[status])} />
              <div className="text-lg font-bold text-white">{statusCounts[status]}</div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {getStatusText(status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
            <Beaker className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">暂无匹配任务</h3>
          <p className="text-sm text-slate-400 mb-6">
            尝试调整筛选条件或创建新的计算任务
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-mixed text-white font-semibold text-sm shadow-glow-cyan transition-all hover:shadow-glow-cyan-lg"
          >
            <Plus className="w-4.5 h-4.5" />
            创建第一个任务
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPauseResume={handlePauseResume}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          'fixed bottom-8 right-8 z-30',
          'w-16 h-16 rounded-2xl',
          'bg-gradient-mixed text-white',
          'shadow-glow-purple-lg hover:shadow-glow-purple',
          'flex items-center justify-center',
          'hover:scale-110 active:scale-95 transition-all duration-300',
          'group'
        )}
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
        <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-slate-900">
          {allTasks.length > 99 ? '99+' : allTasks.length}
        </div>
      </button>

      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
