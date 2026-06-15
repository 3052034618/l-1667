import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Trash2,
  Eye,
  Clock,
  Calendar,
  User,
  Layers,
} from 'lucide-react';
import type { ComputationTask, TaskStatus } from '@/types';
import { cn, formatDate, getStatusColor, getStatusText } from '@/lib/utils';

interface TaskCardProps {
  task: ComputationTask;
  onPauseResume?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusProgressMap: Record<TaskStatus, number> = {
  pending_validation: 5,
  structure_optimization: 20,
  scf_calculation: 40,
  band_calculation: 60,
  topology_analysis: 80,
  pending_phd_approval: 92,
  pending_supervisor_approval: 96,
  completed: 100,
  error_fallback: 45,
  paused: 30,
};

const progressBarColors: Record<TaskStatus, string> = {
  pending_validation: 'from-amber-500 to-orange-500',
  structure_optimization: 'from-blue-500 to-cyan-500',
  scf_calculation: 'from-blue-500 to-cyan-500',
  band_calculation: 'from-purple-500 to-fuchsia-500',
  topology_analysis: 'from-purple-500 to-fuchsia-500',
  pending_phd_approval: 'from-amber-500 to-yellow-500',
  pending_supervisor_approval: 'from-amber-500 to-yellow-500',
  completed: 'from-emerald-500 to-teal-500',
  error_fallback: 'from-red-500 to-rose-500',
  paused: 'from-slate-500 to-slate-400',
};

export default function TaskCard({ task, onPauseResume, onDelete }: TaskCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/tasks/${task.id}`);
  };

  const handlePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPauseResume?.(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task.id);
  };

  const displayProgress =
    task.status === 'completed' ? 100 : Math.max(task.progress, statusProgressMap[task.status]);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative rounded-xl border backdrop-blur-sm overflow-hidden',
        'bg-slate-900/60 border-slate-700/50',
        'hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5',
        'transition-all duration-300 cursor-pointer',
        task.status === 'completed' && 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
        task.status === 'error_fallback' && 'hover:border-red-500/40 hover:shadow-red-500/5',
        task.status === 'paused' && 'hover:border-slate-400/40'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base leading-snug truncate group-hover:text-cyan-400 transition-colors">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="w-3 h-3" />
                {task.formula}
              </span>
              <span className="text-xs text-slate-500 font-mono">{task.id}</span>
            </div>
          </div>
          <span
            className={cn(
              'shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border',
              getStatusColor(task.status)
            )}
          >
            {getStatusText(task.status)}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">空间群:</span>
            <span className="text-slate-300 font-mono">
              {task.crystalStructure.spaceGroup}
              <span className="text-slate-500">#{task.crystalStructure.spaceGroupNumber}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">{task.creatorName}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">计算进度</span>
            <span className="text-xs font-medium text-slate-300">{displayProgress}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                progressBarColors[task.status]
              )}
              style={{ width: `${displayProgress}%` }}
            />
            {task.status !== 'completed' &&
              task.status !== 'error_fallback' &&
              task.status !== 'paused' && (
                <div
                  className={cn(
                    'absolute top-0 h-full w-1/3 rounded-full blur-sm opacity-60 animate-pulse',
                    'bg-gradient-to-r',
                    progressBarColors[task.status]
                  )}
                  style={{ left: `calc(${displayProgress}% - 33%)` }}
                />
              )}
          </div>
          <p className="mt-2 text-xs text-slate-500 truncate">{task.currentStep}</p>
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(task.createdAt, 'short')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {task.status === 'completed'
                ? '已完成'
                : task.status === 'error_fallback'
                  ? '异常终止'
                  : `预计 ${task.estimatedTimeRemaining}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-700/40">
          <button
            onClick={handleViewDetail}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg',
              'text-xs font-medium transition-all duration-200',
              'bg-slate-800/60 text-slate-300 border border-slate-700/50',
              'hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            查看详情
          </button>
          {task.status !== 'completed' && task.status !== 'error_fallback' && (
            <button
              onClick={handlePauseResume}
              className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded-lg',
                'text-xs font-medium transition-all duration-200',
                task.status === 'paused'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
              )}
            >
              {task.status === 'paused' ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            onClick={handleDelete}
            className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-lg',
              'text-xs font-medium transition-all duration-200',
              'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
