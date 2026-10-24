import React from 'react';
import { History } from 'lucide-react';
import type { ContextDecisionLog } from '../../types/event';

interface DecisionAuditFeedProps {
  decisionLogs: ContextDecisionLog[];
}

export const DecisionAuditFeed: React.FC<DecisionAuditFeedProps> = ({ decisionLogs }) => {
  return (
    <section
      aria-label="Decision Audit Log"
      className="rounded-3xl bg-vesta-card border border-vesta-border p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-vesta-gold" />
          <h2 className="text-sm font-bold text-vesta-text">
            Context Decision Audit Feed
          </h2>
        </div>
        <span className="text-xs font-mono text-vesta-muted">
          {decisionLogs.length} Logged Entries
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {decisionLogs.map((log) => {
          const impactBadge =
            log.impactLevel === 'high'
              ? 'bg-vesta-danger/15 text-vesta-danger border-vesta-danger/30'
              : log.impactLevel === 'medium'
              ? 'bg-vesta-warning/15 text-vesta-warning border-vesta-warning/30'
              : 'bg-vesta-foam/15 text-vesta-foam border-vesta-foam/30';

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-vesta-surface/80 border border-vesta-border text-xs space-y-1.5 hover:border-vesta-iris/40 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-vesta-text">{log.trigger}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${impactBadge}`}
                  >
                    {log.impactLevel}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-vesta-muted">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-vesta-muted text-[11px] leading-relaxed">{log.reasoning}</p>

              <div className="text-[11px] font-medium text-vesta-foam flex items-center gap-1.5 pt-0.5">
                <span className="text-vesta-muted">Action:</span>
                <span>{log.actionTaken}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
