import { AlertTriangle, Shield } from 'lucide-react';
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '../../utils/constants';
import { formatRiskScore } from '../../utils/riskAssessment';

interface RiskGaugeProps {
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  inundationSpeed: number;
  walkingSpeed: number;
  safeReturnTime: number;
}

export default function RiskGauge({
  riskLevel,
  inundationSpeed,
  walkingSpeed,
  safeReturnTime,
}: RiskGaugeProps) {
  const score = formatRiskScore(riskLevel);
  const color = RISK_LEVEL_COLORS[riskLevel];
  const label = RISK_LEVEL_LABELS[riskLevel];

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        {riskLevel === 'low' ? (
          <Shield size={20} className="text-green-400" />
        ) : (
          <AlertTriangle size={20} className="text-orange-400" />
        )}
        <h3 className="text-white font-semibold">围困风险评估</h3>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-44 h-28">
          <svg className="w-full h-full" viewBox="0 0 200 120">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.5}`}
              strokeDashoffset={`${offset * 0.5}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <text
              x="100"
              y="85"
              textAnchor="middle"
              fill="white"
              fontSize="28"
              fontWeight="bold"
            >
              {score}%
            </text>
            <text
              x="100"
              y="108"
              textAnchor="middle"
              fill={color}
              fontSize="12"
              fontWeight="600"
            >
              {label}
            </text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="text-2xl font-bold text-orange-400">
            {inundationSpeed.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400 mt-1">漫滩速度 m/min</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="text-2xl font-bold text-blue-400">
            {walkingSpeed}
          </div>
          <div className="text-xs text-slate-400 mt-1">步行速度 m/min</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="text-2xl font-bold text-green-400">
            {safeReturnTime.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400 mt-1">单程返回 min</div>
        </div>
      </div>
    </div>
  );
}
