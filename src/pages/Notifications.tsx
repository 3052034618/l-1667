import { useState, useMemo } from 'react';
import {
  Bell, CheckCheck, Trash2, Inbox, CheckCircle, XCircle,
  ClipboardCheck, AlertTriangle, Link as LinkIcon, Clock
} from 'lucide-react';
import { mockNotifications, mockTasks } from '../data/mockData';
import { cn, formatDate } from '../lib/utils';
import type { Notification, NotificationType } from '../types';

type CategoryType = 'all' | 'task_completed' | 'approval_requested' | 'system' | 'topology_anomaly';

const categories: { key: CategoryType; label: string; icon: typeof Bell; color: string }[] = [
  { key: 'all', label: '全部消息', icon: Inbox, color: 'text-slate-300' },
  { key: 'task_completed', label: '任务完成', icon: CheckCircle, color: 'text-success' },
  { key: 'approval_requested', label: '审批请求', icon: ClipboardCheck, color: 'text-secondary' },
  { key: 'system', label: '系统告警', icon: AlertTriangle, color: 'text-warning' },
  { key: 'topology_anomaly', label: '拓扑异常', icon: XCircle, color: 'text-danger' },
];

function getTypeInfo(type: NotificationType) {
  const map: Record<NotificationType, { icon: typeof Bell; color: string; bg: string; label: string }> = {
    task_completed: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/15 border-success/30', label: '任务完成' },
    task_failed: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/15 border-danger/30', label: '任务失败' },
    approval_requested: { icon: ClipboardCheck, color: 'text-secondary', bg: 'bg-secondary/15 border-secondary/30', label: '审批请求' },
    approval_processed: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/15 border-success/30', label: '审批结果' },
    material_archived: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/15 border-primary/30', label: '材料归档' },
    system: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/15 border-warning/30', label: '系统通知' },
    mention: { icon: Bell, color: 'text-info', bg: 'bg-info/15 border-info/30', label: '提及提醒' },
  };
  return map[type] || map.system;
}

export default function Notifications() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const categoryUnread = useMemo(() => {
    const counts: Record<string, number> = {};
    notifications.forEach((n) => {
      if (!n.isRead) {
        counts.all = (counts.all || 0) + 1;
        if (n.type === 'task_completed' || n.type === 'task_failed') {
          counts.task_completed = (counts.task_completed || 0) + 1;
        }
        if (n.type === 'approval_requested') {
          counts.approval_requested = (counts.approval_requested || 0) + 1;
        }
        if (n.type === 'system') {
          counts.system = (counts.system || 0) + 1;
        }
      }
    });
    return counts;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (activeCategory === 'all') return true;
        if (activeCategory === 'task_completed') return n.type === 'task_completed' || n.type === 'task_failed' || n.type === 'approval_processed' || n.type === 'material_archived';
        if (activeCategory === 'approval_requested') return n.type === 'approval_requested';
        if (activeCategory === 'system') return n.type === 'system' || n.type === 'mention';
        if (activeCategory === 'topology_anomaly') return n.type === 'task_failed';
        return true;
      })
      .sort((a, b) => (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1));
  }, [notifications, activeCategory]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));
  };

  const handleClick = (n: Notification) => {
    toggleRead(n.id);
    if (n.relatedTaskId) {
      alert(`跳转到任务详情: ${n.relatedTaskId}`);
    } else if (n.relatedMaterialId) {
      alert(`跳转到材料详情: ${n.relatedMaterialId}`);
    } else {
      alert(`消息详情: ${n.title}`);
    }
  };

  const getRelatedTask = (id?: string) => mockTasks.find((t) => t.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-7 h-7 text-primary" />
          消息中心
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-800/70 border border-slate-700 hover:bg-slate-700/70 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> 全部标为已读
          </button>
          <button
            onClick={clearRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-danger bg-danger/10 border border-danger/30 hover:bg-danger/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> 删除已读
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-2 sticky top-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const unread = categoryUnread[cat.key] || 0;
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-all',
                    active
                      ? 'bg-primary/15 border border-primary/30 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-5 h-5', active ? cat.color : '')} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-danger text-white min-w-[24px] text-center">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">暂无消息</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {filteredNotifications.map((n) => {
                  const typeInfo = getTypeInfo(n.type);
                  const TypeIcon = typeInfo.icon;
                  const relatedTask = getRelatedTask(n.relatedTaskId);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={cn(
                        'relative p-5 cursor-pointer transition-all group',
                        n.isRead ? 'hover:bg-slate-800/30' : 'bg-slate-800/20 hover:bg-slate-800/40'
                      )}
                    >
                      {!n.isRead && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500" />
                      )}
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'flex-shrink-0 p-2.5 rounded-lg border',
                          typeInfo.bg
                        )}>
                          <TypeIcon className={cn('w-5 h-5', typeInfo.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className={cn(
                                'text-sm font-semibold',
                                n.isRead ? 'text-slate-300' : 'text-white'
                              )}>
                                {n.title}
                              </h3>
                              <span className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-medium border',
                                typeInfo.bg,
                                typeInfo.color
                              )}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(n.createdAt, 'short')}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleRead(n.id); }}
                                className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-all"
                                title={n.isRead ? '标为未读' : '标为已读'}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className={cn(
                            'text-sm leading-relaxed line-clamp-2 mb-3',
                            n.isRead ? 'text-slate-500' : 'text-slate-400'
                          )}>
                            {n.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-500">
                              发送者: <span className="text-slate-400">{n.senderName || '系统'}</span>
                            </span>
                            {(n.relatedTaskId || n.relatedMaterialId) && (
                              <span className="inline-flex items-center gap-1 text-primary hover:text-cyan-300 transition-colors">
                                <LinkIcon className="w-3 h-3" />
                                {n.relatedTaskId
                                  ? `关联任务: ${relatedTask?.formula || n.relatedTaskId}`
                                  : `关联材料: ${n.relatedMaterialId}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
