import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import PageLayout from '../components/Layout/PageLayout';
import Card, { CardHeader, CardContent } from '../components/Card/Card';
import RiskGauge from '../components/RiskGauge/RiskGauge';
import AlertItem from '../components/Alert/AlertItem';
import {
  AlertTriangle,
  Shield,
  Waves,
  MapPin,
  Navigation,
  Timer,
  AlertCircle,
  CheckCircle,
  XCircle,
  Footprints,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { CollectionZone } from '../types';
import { WALKING_SPEED_TIDELAND, SAFETY_MARGIN_MINUTES, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '../utils/constants';

export default function SafetyPage() {
  const {
    inundationRisk,
    alerts,
    tideData,
    collectionZones,
    currentBeachId,
    recalculateRisk,
    windowPlan,
  } = useAppStore();

  const [distance, setDistance] = useState(1000);
  const [walkingSpeed, setWalkingSpeed] = useState(WALKING_SPEED_TIDELAND);
  const [showAlerts, setShowAlerts] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [showZoneSelector, setShowZoneSelector] = useState(false);

  const beachZones = collectionZones.filter(z => z.beachId === currentBeachId);
  const selectedZone = beachZones.find(z => z.id === selectedZoneId) || null;

  useEffect(() => {
    recalculateRisk(distance, walkingSpeed);
  }, [distance, walkingSpeed, recalculateRisk]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const safeZones = useMemo(() => {
    if (!tideData) return [];
    let currentHeight = 0;
    for (let i = tideData.hourlyData.length - 1; i >= 0; i--) {
      if (tideData.hourlyData[i].timestamp <= now) {
        currentHeight = tideData.hourlyData[i].height;
        break;
      }
    }
    return beachZones.map(zone => {
      const zoneSafe = currentHeight <= zone.targetTideHeight;
      const reason = zoneSafe
        ? `当前潮位${currentHeight}cm ≤ 目标${zone.targetTideHeight}cm`
        : `当前潮位${currentHeight}cm > 目标${zone.targetTideHeight}cm，已被淹没`;
      return { zone, safe: zoneSafe, reason, currentHeight };
    });
  }, [tideData, beachZones, now]);

  const countdown = useMemo(() => {
    if (!selectedZone || !tideData || !windowPlan) return null;

    const mustReturnTime = dayjs(windowPlan.mustReturnTime, 'HH:mm').toDate();
    const mustReturnTs = dayjs(tideData.date).hour(mustReturnTime.getHours()).minute(mustReturnTime.getMinutes()).second(0).valueOf();
    const oneWayMinutes = selectedZone.estimatedTimeOneWay;
    const needToLeaveNow = mustReturnTs - oneWayMinutes * 60 * 1000;

    const remainingUntilMustReturn = Math.max(0, (mustReturnTs - now) / 60000);
    const remainingUntilLeave = Math.max(0, (needToLeaveNow - now) / 60000);
    const canReturnNow = remainingUntilMustReturn >= oneWayMinutes + 5;
    const isUrgent = remainingUntilLeave < 15;
    const isCritical = remainingUntilLeave <= 0;

    let level: 'safe' | 'warn' | 'danger' | 'critical' = 'safe';
    let advice = '';
    if (isCritical) {
      level = 'critical';
      advice = '时间已过！立即撤离，不要恋战，不要回头捡东西！';
    } else if (isUrgent) {
      level = 'danger';
      advice = `剩余时间紧张，建议现在立即开始返回，不要在途中停留！`;
    } else if (!canReturnNow) {
      level = 'warn';
      advice = `返程需约 ${oneWayMinutes.toFixed(0)} 分钟，建议控制活动范围，尽快准备撤离。`;
    } else {
      level = 'safe';
      advice = `当前时间充足，可安心采集，但请定时查看剩余时间。`;
    }

    return {
      mustReturnTs,
      needToLeaveNow,
      remainingUntilLeave,
      remainingUntilMustReturn,
      oneWayMinutes,
      canReturnNow,
      isUrgent,
      isCritical,
      level,
      advice,
    };
  }, [selectedZone, tideData, windowPlan, now]);

  const handleSelectZone = (zone: CollectionZone) => {
    setSelectedZoneId(zone.id);
    setShowZoneSelector(false);
  };

  const formatMinutes = (min: number) => {
    if (min < 60) return `${Math.round(min)}分钟`;
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return m > 0 ? `${h}小时${m}分` : `${h}小时`;
  };

  return (
    <PageLayout title="安全退路">
      <div className="space-y-4">
        {inundationRisk && (
          <Card>
            <CardContent className="p-4">
              <RiskGauge
                riskLevel={inundationRisk.riskLevel}
                inundationSpeed={inundationRisk.inundationSpeed}
                walkingSpeed={inundationRisk.walkingSpeed}
                safeReturnTime={inundationRisk.safeReturnTime}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">距离与速度</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">当前距海岸距离</span>
                  <span className="text-white font-bold">{distance} 米</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="100"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#3E92CC]"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>100m</span>
                  <span>1500m</span>
                  <span>3000m</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">估计步行速度</span>
                  <span className="text-white font-bold">{walkingSpeed} 米/分钟</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={walkingSpeed}
                  onChange={(e) => setWalkingSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#3E92CC]"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>慢 20m/min</span>
                  <span>正常 60m/min</span>
                  <span>快 100m/min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-orange-400" />
                <h3 className="text-white font-semibold">撤离倒计时</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => setShowZoneSelector(!showZoneSelector)}
              className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#3E92CC]" />
                <div className="text-left">
                  <div className="text-xs text-slate-400">我当前在</div>
                  <div className="text-white font-medium">
                    {selectedZone ? selectedZone.name : '选择当前所在采集区'}
                  </div>
                </div>
              </div>
              {showZoneSelector ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {showZoneSelector && (
              <div className="space-y-2 animate-fadeIn">
                {beachZones.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-sm">暂未配置采集区</div>
                ) : (
                  beachZones.map(zone => (
                    <button
                      key={zone.id}
                      onClick={() => handleSelectZone(zone)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between transition-colors ${
                        selectedZoneId === zone.id
                          ? 'bg-[#3E92CC]/20 border-2 border-[#3E92CC]'
                          : 'bg-slate-800/30 border border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className={selectedZoneId === zone.id ? 'text-[#3E92CC]' : 'text-slate-400'} />
                        <div className="text-left">
                          <div className={`font-medium ${selectedZoneId === zone.id ? 'text-white' : 'text-slate-200'}`}>{zone.name}</div>
                          <div className="text-xs text-slate-400">距入口 {zone.distanceFromEntry}m · 单程 {zone.estimatedTimeOneWay.toFixed(1)}min</div>
                        </div>
                      </div>
                      {selectedZoneId === zone.id && <CheckCircle size={18} className="text-[#3E92CC]" />}
                    </button>
                  ))
                )}
              </div>
            )}

            {countdown ? (
              <div
                className={`rounded-xl p-4 border-2 transition-all ${
                  countdown.level === 'critical'
                    ? 'bg-red-900/30 border-red-500 animate-pulse-soft'
                    : countdown.level === 'danger'
                    ? 'bg-orange-900/30 border-orange-500'
                    : countdown.level === 'warn'
                    ? 'bg-yellow-900/30 border-yellow-500'
                    : 'bg-green-900/20 border-green-700/50'
                }`}
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">距最晚回撤还剩</div>
                    <div className={`text-3xl font-bold font-mono ${
                      countdown.isCritical ? 'text-red-400' : countdown.isUrgent ? 'text-orange-400' : 'text-yellow-400'
                    }`}>
                      {formatMinutes(countdown.remainingUntilLeave)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">回到岸边还需</div>
                    <div className="text-3xl font-bold font-mono text-[#3E92CC]">
                      {countdown.oneWayMinutes.toFixed(0)}分钟
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg flex items-start gap-2 ${
                  countdown.level === 'critical' ? 'bg-red-900/50' :
                  countdown.level === 'danger' ? 'bg-orange-900/50' :
                  countdown.level === 'warn' ? 'bg-yellow-900/40' : 'bg-green-900/30'
                }`}>
                  {countdown.isCritical ? (
                    <Zap size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  ) : countdown.isUrgent ? (
                    <AlertTriangle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  ) : countdown.level === 'warn' ? (
                    <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-semibold mb-1 ${
                      countdown.isCritical ? 'text-red-200' :
                      countdown.isUrgent ? 'text-orange-200' :
                      countdown.level === 'warn' ? 'text-yellow-200' : 'text-green-200'
                    }`}>
                      {countdown.isCritical ? '⚠️ 时间紧迫！' : countdown.isUrgent ? '准备撤离' : countdown.level === 'warn' ? '注意时间' : '时间充足'}
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      countdown.isCritical ? 'text-red-300' :
                      countdown.isUrgent ? 'text-orange-300' :
                      countdown.level === 'warn' ? 'text-yellow-300' : 'text-green-300'
                    }`}>
                      {countdown.advice}
                    </p>
                    {!countdown.isCritical && (
                      <div className="mt-2 text-xs text-slate-400">
                        最晚 {dayjs(countdown.mustReturnTs).format('HH:mm')} 前必须回到岸边 · 建议 {dayjs(countdown.needToLeaveNow).format('HH:mm')} 前动身返回
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">
                <Timer size={32} className="mx-auto mb-2 opacity-50" />
                选择上方采集区后开始倒计时
              </div>
            )}
          </CardContent>
        </Card>

        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-400" />
                  <h3 className="text-white font-semibold">安全告警</h3>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                </div>
                {showAlerts ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
            </CardHeader>
            {showAlerts && (
              <CardContent>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-green-400" />
              <h3 className="text-white font-semibold">当前可安全前往区域</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {safeZones.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MapPin size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无采集区数据</p>
                </div>
              ) : (
                safeZones.map(({ zone, safe, reason }) => (
                  <div
                    key={zone.id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      safe
                        ? 'bg-green-900/20 border-green-700/50'
                        : 'bg-red-900/20 border-red-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {safe ? (
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle size={20} className="text-green-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <XCircle size={20} className="text-red-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{zone.name}</div>
                        <div className="text-xs text-slate-400">
                          {zone.distanceFromEntry}m · {zone.estimatedTimeOneWay.toFixed(1)}min单程
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${safe ? 'text-green-400' : 'text-red-400'}`}>
                        {safe ? '可前往' : '已淹没'}
                      </div>
                      <div className="text-xs text-slate-500">{reason}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">安全提醒</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: Waves, text: '时刻关注潮水变化，涨潮速度往往超出预期' },
                { icon: Footprints, text: '在滩涂行走注意泥沙下陷，结伴而行' },
                { icon: AlertCircle, text: '远离堤坝缺口、泄洪口等危险区域' },
                { icon: Timer, text: '预留充足返程时间，不要贪多恋战' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-[#3E92CC]" />
                  </div>
                  <p className="text-sm text-slate-300 pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-400" />
              <h3 className="text-white font-semibold">紧急撤离守则</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                '当潮水逼近时，立刻放下所有收获，轻装撤离',
                '沿原路返回，不要尝试抄近路穿越陌生滩涂',
                '遇到积水区域不要强行涉水，绕行高处',
                '若被困，立刻拨打求救电话并站在高处等待救援',
              ].map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-900/20 rounded-lg">
                  <span className="text-yellow-400 font-bold text-sm">{idx + 1}.</span>
                  <p className="text-sm text-yellow-200">{rule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
