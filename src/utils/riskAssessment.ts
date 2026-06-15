import dayjs from 'dayjs';
import type { InundationRisk, AlertItem, TideDayData, CollectionZone } from '../types';
import {
  RISK_LEVEL_LABELS,
  WALKING_SPEED_TIDELAND,
  SAFETY_MARGIN_MINUTES,
} from './constants';
import { getTideRiseRate, estimateInundationSpeed } from './tideHarmonics';

export function calculateInundationRisk(
  tideData: TideDayData,
  terrainSlope: number,
  distance: number,
  walkingSpeed: number = WALKING_SPEED_TIDELAND,
  currentTime: number = Date.now()
): InundationRisk {
  const tideRiseRate = getTideRiseRate(tideData.hourlyData, currentTime);
  const inundationSpeed = estimateInundationSpeed(Math.abs(tideRiseRate), terrainSlope);

  const safeReturnTime = (distance / walkingSpeed) * 60;

  const criticalWarning: string[] = [];

  const speedRatio = inundationSpeed / walkingSpeed;

  let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';

  if (speedRatio >= 1.0) {
    riskLevel = 'extreme';
    criticalWarning.push('漫滩速度超过步行速度，有严重围困风险！');
    criticalWarning.push('立即开始撤离，不要停留收集！');
  } else if (speedRatio >= 0.7) {
    riskLevel = 'high';
    criticalWarning.push('漫滩速度接近步行速度，风险较高');
    criticalWarning.push('建议提前15分钟内开始撤离');
  } else if (speedRatio >= 0.4) {
    riskLevel = 'medium';
    criticalWarning.push('涨潮速度较快，注意控制活动范围');
  } else {
    riskLevel = 'low';
  }

  if (safeReturnTime > 60) {
    criticalWarning.push('往返时间较长，注意控制活动范围');
  }

  return {
    riskLevel,
    inundationSpeed: Math.round(inundationSpeed * 10) / 10,
    walkingSpeed,
    safeReturnTime: Math.round(safeReturnTime),
    criticalWarning,
  };
}

export function generateAlerts(
  tideData: TideDayData,
  zones: CollectionZone[],
  risk: InundationRisk,
  currentTime: number = Date.now()
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = dayjs(currentTime);

  if (tideData.tideType === 'astronomical') {
    alerts.push({
      id: 'astro-001',
      type: 'general',
      title: '天文大潮警报',
      description: '今日为天文大潮，潮差极大，滩涂变化迅速',
      level: 'critical',
      time: '全天',
      action: '缩短赶海时间，提前撤离',
    });
  }

  if (tideData.tideType === 'spring') {
    alerts.push({
      id: 'spring-001',
      type: 'general',
      title: '大潮期',
      description: '今日大潮，潮差较大，可达滩涂面积增加',
      level: 'warning',
      time: '全天',
      action: '注意涨潮速度加快',
    });
  }

  if (risk.riskLevel === 'extreme' || risk.riskLevel === 'high') {
    alerts.push({
      id: 'inundation-001',
      type: 'inundation',
      title: '漫滩风险警报',
      description: `漫滩速度${risk.inundationSpeed.toFixed(1)}m/min，接近步行速度`,
      level: risk.riskLevel === 'extreme' ? 'critical' : 'danger',
      time: now.format('HH:mm'),
      action: risk.riskLevel === 'extreme' ? '立即撤离！' : '准备撤离',
    });
  }

  const nextHighTide = tideData.extremes.find(e => e.type === 'high' && e.timestamp > currentTime);
  if (nextHighTide) {
    const timeToHigh = (nextHighTide.timestamp - currentTime) / 1000 / 60;
    if (timeToHigh < 120 && timeToHigh > 0) {
      alerts.push({
        id: 'tide-001',
        type: 'inundation',
        title: '高潮临近',
        description: `距离下次高潮还有${Math.round(timeToHigh)}分钟`,
        level: timeToHigh < 60 ? 'danger' : 'warning',
        time: dayjs(nextHighTide.timestamp).format('HH:mm'),
        action: '确认撤离时间是否充足',
      });
    }
  }

  zones.forEach(zone => {
    const roundTrip = zone.estimatedTimeOneWay * 2 + SAFETY_MARGIN_MINUTES;
    const timeToHighTide = nextHighTide
      ? (nextHighTide.timestamp - currentTime) / 1000 / 60
      : 999;

    if (roundTrip > timeToHighTide) {
      alerts.push({
        id: `zone-${zone.id}`,
        type: 'inundation',
        title: `${zone.name} 时间不足`,
        description: `往返需${roundTrip}分钟，高潮前时间不足`,
        level: 'danger',
        time: now.format('HH:mm'),
        action: '不建议前往',
      });
    }
  });

  alerts.push({
    id: 'riptide-001',
    type: 'riptide',
    title: '回头潮注意',
    description: '落潮后期注意回头潮风险增加',
    level: 'warning',
    time: '落潮后2小时',
    action: '不要单独前往深水区',
  });

  alerts.push({
    id: 'dam-001',
    type: 'dam_gap',
    title: '堤坝缺口',
    description: '堤坝缺口处涨潮速度是平地3倍',
    level: 'warning',
    time: '涨潮期',
    action: '避免在缺口附近停留',
  });

  return alerts;
}

export function getSafeZones(
  zones: CollectionZone[],
  tideData: TideDayData,
  currentTime: number = Date.now()
): { zone: CollectionZone; safe: boolean; reason: string }[] {
  const currentHeight = tideData.hourlyData.find(
    p => p.timestamp <= currentTime
  )?.height || 0;

  const nextHighTide = tideData.extremes.find(
    e => e.type === 'high' && e.timestamp > currentTime
  );

  return zones.map(zone => {
    const roundTrip = zone.estimatedTimeOneWay * 2 + SAFETY_MARGIN_MINUTES;
    const timeToHighTide = nextHighTide
      ? (nextHighTide.timestamp - currentTime) / 1000 / 60
      : 999;

    const heightOk = currentHeight <= zone.targetTideHeight;
    const timeOk = roundTrip < timeToHighTide;

    let reason = '';
    if (!heightOk) {
      reason = '当前潮位过高';
    } else if (!timeOk) {
        reason = '往返时间不足';
      }

    return {
      zone,
      safe: heightOk && timeOk,
      reason,
    };
  });
}

export function formatRiskScore(riskLevel: string): number {
  const scores: Record<string, number> = {
    low: 25,
    medium: 50,
    high: 75,
    extreme: 100,
  };
  return scores[riskLevel] || 0;
}
