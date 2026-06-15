import dayjs from 'dayjs';
import type { TideDayData, CollectionZone, WindowPlan } from '../types';
import { SAFETY_MARGIN_MINUTES } from './constants';

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
