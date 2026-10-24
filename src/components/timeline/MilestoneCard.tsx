import React from 'react';
import {
  Flame,
  Users,
  GitBranch,
  CheckCircle2,
  Hourglass,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { TimelineItem } from '../../types/event';

interface MilestoneCardProps {
  item: TimelineItem;
  onUpdateStatus: (itemId: string, status: TimelineItem['status']) => void;
}

const getStatusConfig = (status: TimelineItem['status']) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        badge: 'bg-vesta-success/15 text-vesta-success border-vesta-success/30',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    case 'in-progress':
      return {
        label: 'In Progress',
        badge: 'bg-vesta-warning/15 text-vesta-warning border-vesta-warning/30',
        icon: <Hourglass className="w-3.5 h-3.5 animate-spin" />,
      };
    case 'pending':
      return {
        label: 'Pending',
        badge: 'bg-vesta-muted/15 text-vesta-muted border-vesta-muted/30',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
    case 'at-risk':
      return {
        label: 'At Risk',
        badge: 'bg-vesta-danger/15 text-vesta-danger border-vesta-danger/30',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
      };
  }
};

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  item,
  onUpdateStatus,
}) => {
  const statusConfig = getStatusConfig(item.status);

  return (
    <div
      className={`p-4 rounded-2xl bg-vesta-card border transition-all space-y-2.5 ${
        item.isCriticalPath
          ? 'border-vesta-danger/30 shadow-sm shadow-vesta-danger/5'
          : 'border-vesta-border hover:border-vesta-iris/40'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Time badge & Title */}
        <div className="flex items-start gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-vesta-surface border border-vesta-border font-mono text-[11px] font-semibold text-vesta-text shrink-0 mt-0.5">
            {item.timeSlot || item.timeframe}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-xs text-vesta-text">{item.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-vesta-surface text-vesta-muted border border-vesta-border uppercase tracking-wider font-mono">
                {item.category}
              </span>
              {item.isCriticalPath && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-vesta-danger/15 text-vesta-danger border border-vesta-danger/30 font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Critical Path
                </span>
              )}
            </div>

            {/* Details row: Assignee & Dependencies */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-vesta-muted mt-1">
              {item.assignee && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-vesta-iris" />
                  {item.assignee}
                </span>
              )}
              {item.dependencyNote && (
                <span className="flex items-center gap-1 text-vesta-text/70">
                  <GitBranch className="w-3 h-3 text-vesta-gold" />
                  {item.dependencyNote}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Selector */}
        <div className="flex items-center gap-2">
          <select
            value={item.status}
            onChange={(e) =>
              onUpdateStatus(item.id, e.target.value as TimelineItem['status'])
            }
            aria-label={`Update status for ${item.title}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-vesta-iris ${statusConfig.badge}`}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="at-risk">At Risk</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
