import { Priority } from '@/types/todo'

const BADGE_STYLES: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const LABELS: Record<Priority, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[priority]}`}
    >
      {LABELS[priority]}
    </span>
  )
}
