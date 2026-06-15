import { ChevronDown, ChevronUp, AlertTriangle, Waves, Zap, Info } from 'lucide-react';
import { useState } from 'react';
import type { AlertItem as AlertItemType } from '../../types';
import { ALERT_LEVEL_COLORS, DANGER_ZONE_TYPES } from '../../utils/constants';

interface AlertItemProps {
  alert: AlertItemType;
}

const iconMap: Record<string, React.ElementType> = {
  riptide: Waves,
  dam_gap: Zap,
  return_tide: Waves,
  inundation: AlertTriangle,
  general: Info,
  mudflat: AlertTriangle,
};

export default function AlertItem({ alert }: AlertItemProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[alert.type] || Info;
  const color = ALERT_LEVEL_COLORS[alert.level];

  const levelLabel: Record<string, string> = {
    info: '提示',
    warning: '警告',
    danger: '危险',
    critical: '危急',
  };

  return (
    <div
      className={`rounded-xl border-l-4 overflow-hidden transition-all ${
        alert.level === 'critical'
          ? 'bg-red-900/30 border-red-500 animate-pulse'
          : alert.level === 'danger'
          ? 'bg-orange-900/20 border-orange-500'
          : alert.level === 'warning'
          ? 'bg-yellow-900/20 border-yellow-500'
          : 'bg-blue-900/20 border-blue-500'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}30`, color }}
            >
              {levelLabel[alert.level]}
            </span>
            <span className="text-xs text-slate-400">{alert.time}</span>
          </div>
          <h4 className="text-white font-semibold mb-1">{alert.title}</h4>
          <p className="text-sm text-slate-300 line-clamp-2">{alert.description}</p>
          {expanded && alert.action && (
            <div className="mt-3 p-3 bg-black/20 rounded-lg">
              <p className="text-sm text-yellow-300 font-medium">
                应对措施：{alert.action}
              </p>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-slate-400 mt-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>
    </div>
  );
}
