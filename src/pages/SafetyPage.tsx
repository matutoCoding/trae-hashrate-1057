import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import PageLayout from '../components/Layout/PageLayout';
import Card, { CardHeader, CardContent } from '../components/Card/Card';
import RiskGauge from '../components/RiskGauge/RiskGauge';
import AlertItem from '../components/Alert/AlertItem';
import {
  Shield,
  AlertTriangle,
  Map,
  Navigation,
  Footprints,
  Clock,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { getSafeZones } from '../utils/riskAssessment';
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '../utils/constants';

export default function SafetyPage() {
  const {
    tideData,
    inundationRisk,
    alerts,
    currentBeachId,
    collectionZones,
    beaches,
    recalculateRisk,
  } = useAppStore();

  const [selectedDistance, setSelectedDistance] = useState(1000);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const currentBeach = beaches.find((b) => b.id === currentBeachId);
  const beachZones = collectionZones.filter((z) => z.beachId === currentBeachId);
  const safeZones = tideData ? getSafeZones(beachZones, tideData, currentTime) : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    recalculateRisk(selectedDistance);
  }, [selectedDistance, recalculateRisk]);

  if (!tideData || !inundationRisk) {
    return (
      <PageLayout title="安全退路">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-slate-400">加载中...</div>
        </div>
      </PageLayout>
    );
  }

  const criticalAlerts = alerts.filter(a => a.level === 'critical' || a.level === 'danger');
  const warningAlerts = alerts.filter(a => a.level === 'warning' || a.level === 'info');

  return (
    <PageLayout title="安全退路">
      <div className="space-y-4">
        <RiskGauge
          riskLevel={inundationRisk.riskLevel}
          inundationSpeed={inundationRisk.inundationSpeed}
          walkingSpeed={inundationRisk.walkingSpeed}
          safeReturnTime={inundationRisk.safeReturnTime}
        />

        {inundationRisk.criticalWarning.length > 0 && (
          <div className="space-y-2">
            {inundationRisk.criticalWarning.map((warning, idx) => (
              <div
                key={idx}
                className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3"
              >
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{warning}</p>
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#3E92CC]" />
                <h3 className="text-white font-semibold">风险模拟参数</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-300">距离入口</label>
                  <span className="text-[#3E92CC] font-bold">{selectedDistance}m</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="100"
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#3E92CC]"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>100m</span>
                  <span>1500m</span>
                  <span>3000m</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">地形坡度</div>
                  <div className="text-white font-bold">
                    {currentBeach?.terrainSlope} m/km
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">当前时间</div>
                  <div className="text-white font-bold">
                    {new Date(currentTime).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {criticalAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                <h3 className="text-white font-semibold">紧急告警</h3>
                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                  {criticalAlerts.length} 项
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Map size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">当前可安全前往区域</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-slate-900/50 rounded-xl p-4 mb-4">
              <div className="aspect-video relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-blue-500/30 to-transparent rounded-t-xl">
                      <div className="text-xs text-blue-300 text-center pt-4">深海区</div>
                    </div>
                    <div className="absolute top-1/4 left-0 right-0 h-1/4 bg-gradient-to-b from-blue-400/20 to-transparent">
                      <div className="text-xs text-blue-300 text-center pt-4">中潮区</div>
                    </div>
                    <div className="absolute top-1/2 left-0 right-0 h-1/4 bg-gradient-to-b from-green-500/20 to-transparent">
                      <div className="text-xs text-green-300 text-center pt-4">低潮区</div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-yellow-500/30 to-transparent rounded-b-xl">
                      <div className="text-xs text-yellow-300 text-center pt-6">入口岸线</div>
                    </div>
                    {safeZones.map(({ zone, safe }, idx) => {
                      const positions = [
                        { top: '60%', left: '25%' },
                        { top: '45%', left: '50%' },
                        { top: '30%', left: '75%' },
                      ];
                      const pos = positions[idx % positions.length];
                      return (
                        <div
                          key={zone.id}
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 ${
                            safe
                              ? 'bg-green-500/80 ring-4 ring-green-400/30'
                              : 'bg-red-500/80 ring-4 ring-red-400/30'
                          }`}
                          style={{ top: pos.top, left: pos.left }}
                        >
                          {safe ? (
                            <CheckCircle size={16} className="text-white" />
                          ) : (
                            <XCircle size={16} className="text-white" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {safeZones.map(({ zone, safe, reason }) => (
                <div
                  key={zone.id}
                  className={`p-3 rounded-xl flex items-center gap-3 ${
                    safe ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      safe ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                  >
                    {safe ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <XCircle size={18} className="text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${safe ? 'text-green-300' : 'text-red-300'}`}>
                        {zone.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {zone.distanceFromEntry}m · {zone.estimatedTimeOneWay.toFixed(1)}min单程
                      </span>
                    </div>
                    {!safe && reason && (
                      <div className="text-xs text-red-400 mt-1">{reason}</div>
                    )}
                    {safe && (
                      <div className="text-xs text-green-400 mt-1">
                        目标潮高 {zone.targetTideHeight}cm，当前潮位符合条件
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {warningAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-yellow-400" />
                <h3 className="text-white font-semibold">安全提醒</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warningAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">安全撤离守则</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3E92CC]/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-[#3E92CC]" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">定时查看</div>
                  <div className="text-slate-400 text-xs">每30分钟查看一次潮位和撤退时间</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Footprints size={16} className="text-green-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">结伴而行</div>
                  <div className="text-slate-400 text-xs">绝不单独前往远滩区域，保持互相可见</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">尽早撤离</div>
                  <div className="text-slate-400 text-xs">宁可提前撤回，也不冒险多停留1分钟</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
