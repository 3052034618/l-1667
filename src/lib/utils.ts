import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export type TaskStatus =
  | 'pending_validation'
  | 'structure_optimization'
  | 'scf_calculation'
  | 'band_calculation'
  | 'topology_analysis'
  | 'pending_phd_approval'
  | 'pending_supervisor_approval'
  | 'completed'
  | 'error_fallback'
  | 'paused'

export type UserRole = 'phd_student' | 'supervisor' | 'chief_scientist' | 'admin'

export type TopologyClass = 'trivial' | 'weak_topological' | 'strong_topological' | 'crystalline_topological'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined | null, format: 'full' | 'short' | 'time' = 'full'): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  switch (format) {
    case 'short':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'full':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

export function formatEnergy(energy: number | undefined | null, unit: 'eV' | 'meV' | 'Ry' = 'eV'): string {
  if (energy === undefined || energy === null || isNaN(energy)) return '-'

  switch (unit) {
    case 'meV':
      return `${(energy * 1000).toFixed(2)} meV`
    case 'Ry':
      return `${(energy / 13.605693).toFixed(6)} Ry`
    case 'eV':
    default:
      if (Math.abs(energy) >= 1000) {
        return `${energy.toFixed(2)} eV`
      } else if (Math.abs(energy) >= 1) {
        return `${energy.toFixed(4)} eV`
      } else {
        return `${energy.toFixed(6)} eV`
      }
  }
}

export function getStatusColor(status: TaskStatus): string {
  const statusColors: Record<TaskStatus, string> = {
    pending_validation: 'bg-warning/20 text-warning border-warning/30',
    structure_optimization: 'bg-info/20 text-info border-info/30',
    scf_calculation: 'bg-info/20 text-info border-info/30',
    band_calculation: 'bg-secondary/20 text-secondary border-secondary/30',
    topology_analysis: 'bg-secondary/20 text-secondary border-secondary/30',
    pending_phd_approval: 'bg-warning/20 text-warning border-warning/30',
    pending_supervisor_approval: 'bg-warning/20 text-warning border-warning/30',
    completed: 'bg-success/20 text-success border-success/30',
    error_fallback: 'bg-danger/20 text-danger border-danger/30',
    paused: 'bg-surface-border/20 text-text-muted border-surface-border/30',
  }
  return statusColors[status] || 'bg-surface/20 text-text-secondary border-surface-border/30'
}

export function getStatusText(status: TaskStatus): string {
  const statusTexts: Record<TaskStatus, string> = {
    pending_validation: '待校验',
    structure_optimization: '结构优化',
    scf_calculation: 'SCF计算',
    band_calculation: '能带计算',
    topology_analysis: '拓扑分析',
    pending_phd_approval: '待博士生审批',
    pending_supervisor_approval: '待导师审批',
    completed: '已完成',
    error_fallback: '异常终止',
    paused: '已暂停',
  }
  return statusTexts[status] || '未知状态'
}

export function getRoleText(role: UserRole): string {
  const roleTexts: Record<UserRole, string> = {
    phd_student: '博士生',
    supervisor: '导师',
    chief_scientist: '首席科学家',
    admin: '系统管理员',
  }
  return roleTexts[role] || '未知角色'
}

export function getTopologyClassText(topologyClass: TopologyClass): string {
  const topologyTexts: Record<TopologyClass, string> = {
    trivial: '普通绝缘体',
    weak_topological: '弱拓扑绝缘体',
    strong_topological: '强拓扑绝缘体',
    crystalline_topological: '拓扑晶体绝缘体',
  }
  return topologyTexts[topologyClass] || '未分类'
}

export function getTopologyClassColor(topologyClass: TopologyClass): string {
  const topologyColors: Record<TopologyClass, string> = {
    trivial: 'bg-surface-border/20 text-text-muted border-surface-border/30',
    weak_topological: 'bg-info/20 text-info border-info/30',
    strong_topological: 'bg-primary/20 text-primary border-primary/30',
    crystalline_topological: 'bg-secondary/20 text-secondary border-secondary/30',
  }
  return topologyColors[topologyClass] || 'bg-surface/20 text-text-secondary border-surface-border/30'
}
