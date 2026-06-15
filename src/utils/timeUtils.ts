import dayjs from 'dayjs';
import type { TideDayData, CollectionZone, WindowPlan } from '../types';
import { SAFETY_MARGIN_MINUTES } from './constants';

export interface TimelineEvent {
  time: string;
  timestamp: number;
  type: 'entry' | 'arrive' | 'activity' | 'start_return' | 'return' | 'critical';
  title: string;
  subtitle?: string;
  zoneId?: string;
  zoneName?: string;
}

export function generateActionTimeline(
  tideData: TideDayData,
  zones: CollectionZone[],
  selectedZoneIds?: string[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  if (zones.length === 0) return events;

  const targetZones = selectedZoneIds && selectedZoneIds.length > 0
    ? zones.filter(z => selectedZoneIds.includes(z.id))
    : zones;

  if (targetZones.length === 0) return events;

  const sortedZones = [...targetZones].sort((a, b) => a.distanceFromEntry - b.distanceFromEntry);

  const lowTides = tideData.extremes.filter(e => e.type === 'low');
  const highTides = tideData.extremes.filter(e => e.type === 'high');
  if (lowTides.length === 0 || highTides.length === 0) return events;

  const lowTide = lowTides[0];
  const nextHighTide = highTides.find(e => e.timestamp > lowTide.timestamp) || highTides[0];

  const mustReturnTime = addMinutes(nextHighTide.timestamp, -SAFETY_MARGIN_MINUTES);

  const entryTime = addMinutes(lowTide.timestamp, -60);
  events.push({
    time: dayjs(entryTime).format('HH:mm'),
    timestamp: entryTime,
    type: 'entry',
    title: '下海出发',
    subtitle: `低潮前1小时从下海点出发`,
  });

  let currentTime = entryTime;
  for (const zone of sortedZones) {
    currentTime = addMinutes(currentTime, zone.estimatedTimeOneWay);
    events.push({
      time: dayjs(currentTime).format('HH:mm'),
      timestamp: currentTime,
      type: 'arrive',
      title: `抵达 ${zone.name}`,
      subtitle: `单程约 ${zone.estimatedTimeOneWay.toFixed(1)} 分钟，距离 ${zone.distanceFromEntry}m`,
      zoneId: zone.id,
      zoneName: zone.name,
    });

    const zoneStartTime = currentTime;
    const mustLeaveZone = addMinutes(mustReturnTime, -zone.estimatedTimeOneWay);
    const activityMinutes = Math.max(0, Math.round((mustLeaveZone - zoneStartTime) / 60000));

    events.push({
      time: dayjs(zoneStartTime).format('HH:mm') + ' - ' + dayjs(mustLeaveZone).format('HH:mm'),
      timestamp: zoneStartTime,
      type: 'activity',
      title: `${zone.name} 采集时段`,
      subtitle: `最多可采集约 ${activityMinutes} 分钟`,
      zoneId: zone.id,
      zoneName: zone.name,
    });

    events.push({
      time: dayjs(mustLeaveZone).format('HH:mm'),
      timestamp: mustLeaveZone,
      type: 'start_return',
      title: `从 ${zone.name} 开始回撤`,
      subtitle: `预留返程 ${zone.estimatedTimeOneWay.toFixed(1)} 分钟`,
      zoneId: zone.id,
      zoneName: zone.name,
    });
  }

  const farthestZone = sortedZones[sortedZones.length - 1];
  const finalReturnTime = addMinutes(nextHighTide.timestamp, -SAFETY_MARGIN_MINUTES);
  events.push({
    time: dayjs(finalReturnTime).format('HH:mm'),
    timestamp: finalReturnTime,
    type: 'return',
    title: '返回下海点',
    subtitle: `最晚 ${dayjs(finalReturnTime).format('HH:mm')} 前需回到岸边`,
  });

  events.push({
    time: dayjs(nextHighTide.timestamp).format('HH:mm'),
    timestamp: nextHighTide.timestamp,
    type: 'critical',
    title: `⚠ 达到高潮 ${nextHighTide.height}cm`,
    subtitle: `之后滩涂会被海水淹没，切勿滞留`,
  });

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

export function formatTime(timestamp: number): string {
  return dayjs(timestamp).format('HH:mm');
}

export function formatDate(date: Date | string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatDateTime(timestamp: number): string {
  return dayjs(timestamp).format('MM-DD HH:mm');
}

export function minutesBetween(start: number, end: number): number {
  return Math.round((end - start) / 1000 / 60);
}

export function addMinutes(timestamp: number, minutes: number): number {
  return dayjs(timestamp).add(minutes, 'minute').valueOf();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

export function calculateGatheringWindow(
  tideData: TideDayData,
  zones: CollectionZone[],
  currentTime: number = Date.now()
): WindowPlan | null {
  const lowTides = tideData.extremes.filter(e => e.type === 'low');
  const nextLowTide = lowTides.find(e => e.timestamp > currentTime) || lowTides[0];

  if (!nextLowTide) return null;

  const highTides = tideData.extremes.filter(e => e.type === 'high');
  const prevHighTide = highTides.find(e => e.timestamp < nextLowTide.timestamp);
  const nextHighTide = highTides.find(e => e.timestamp > nextLowTide.timestamp);

  if (!prevHighTide || !nextHighTide) return null;

  const windowStart = addMinutes(prevHighTide.timestamp, 90);
  const windowEnd = addMinutes(nextHighTide.timestamp, -SAFETY_MARGIN_MINUTES * 2);
  const bestEntryTime = addMinutes(nextLowTide.timestamp, -60);
  const mustReturnTime = addMinutes(nextHighTide.timestamp, -SAFETY_MARGIN_MINUTES);

  const durationMinutes = minutesBetween(windowStart, windowEnd);

  const zoneResults = zones.map(zone => {
    const roundTripTime = zone.estimatedTimeOneWay * 2;
    const availableTime = minutesBetween(bestEntryTime, mustReturnTime);
    const safetyMargin = availableTime - roundTripTime;

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      safe: safetyMargin >= SAFETY_MARGIN_MINUTES,
      roundTripTime,
      safetyMargin,
    };
  });

  return {
    windowStart: dayjs(windowStart).format('HH:mm'),
    windowEnd: dayjs(windowEnd).format('HH:mm'),
    bestEntryTime: dayjs(bestEntryTime).format('HH:mm'),
    mustReturnTime: dayjs(mustReturnTime).format('HH:mm'),
    durationMinutes,
    zones: zoneResults,
  };
}

export function generateTimeTicks(hourlyData: { timestamp: number }[], count: number = 8): number[] {
  if (hourlyData.length === 0) return [];

  const step = Math.floor(hourlyData.length / (count - 1));
  const ticks: number[] = [];

  for (let i = 0; i < hourlyData.length; i += step) {
    ticks.push(hourlyData[i].timestamp);
  }

  if (ticks.length < count) {
    ticks.push(hourlyData[hourlyData.length - 1].timestamp);
  }

  return ticks.slice(0, count);
}
