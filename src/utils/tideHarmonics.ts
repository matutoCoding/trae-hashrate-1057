import dayjs from 'dayjs';
import type { HarmonicConstituent, TidePoint, TideExtreme, TideDayData } from '../types';

const BASE_DATE = dayjs('2000-01-01T00:00:00Z');

export function hoursSinceBase(date: Date): number {
  return dayjs(date).diff(BASE_DATE, 'hour', true);
}

export function calculateTideLevel(
  constituents: HarmonicConstituent[],
  date: Date,
  referenceLevel: number
): number {
  let level = referenceLevel;
  const t = hoursSinceBase(date);

  for (const c of constituents) {
    const angle = (c.speed * t - c.phase) * (Math.PI / 180);
    level += c.amplitude * Math.cos(angle);
  }

  return Math.round(level * 10) / 10;
}

export function generateHourlyTideData(
  constituents: HarmonicConstituent[],
  date: Date,
  referenceLevel: number,
  hours: number = 48
): TidePoint[] {
  const data: TidePoint[] = [];
  const startOfDay = dayjs(date).startOf('day');

  for (let i = 0; i <= hours; i += 0.25) {
    const time = startOfDay.add(i, 'hour');
    const height = calculateTideLevel(constituents, time.toDate(), referenceLevel);
    data.push({
      time: time.format('HH:mm'),
      timestamp: time.valueOf(),
      height,
    });
  }

  return data;
}

export function findTideExtremes(hourlyData: TidePoint[]): TideExtreme[] {
  const extremes: TideExtreme[] = [];

  for (let i = 1; i < hourlyData.length - 1; i++) {
    const prev = hourlyData[i - 1];
    const curr = hourlyData[i];
    const next = hourlyData[i + 1];

    if (curr.height > prev.height && curr.height > next.height) {
      extremes.push({
        type: 'high',
        time: curr.time,
        timestamp: curr.timestamp,
        height: curr.height,
      });
    } else if (curr.height < prev.height && curr.height < next.height) {
      extremes.push({
        type: 'low',
        time: curr.time,
        timestamp: curr.timestamp,
        height: curr.height,
      });
    }
  }

  return extremes.slice(0, 4);
}

export function determineTideType(extremes: TideExtreme[], date: Date): {
  type: 'spring' | 'neap' | 'astronomical';
  range: number;
  areaImpact: number;
} {
  const highs = extremes.filter(e => e.type === 'high');
  const lows = extremes.filter(e => e.type === 'low');

  if (highs.length === 0 || lows.length === 0) {
    return { type: 'neap', range: 0, areaImpact: 0 };
  }

  const maxHigh = Math.max(...highs.map(h => h.height));
  const minLow = Math.min(...lows.map(l => l.height));
  const range = maxHigh - minLow;

  const dayOfMonth = dayjs(date).date();
  const isNearFullMoon = dayOfMonth >= 14 && dayOfMonth <= 16;
  const isNearNewMoon = dayOfMonth >= 29 || dayOfMonth <= 2;
  const isAstronomical = (isNearFullMoon || isNearNewMoon) && range > 300;

  let type: 'spring' | 'neap' | 'astronomical' = 'neap';
  let areaImpact = 30;

  if (isAstronomical) {
    type = 'astronomical';
    areaImpact = 80;
  } else if (range > 250) {
    type = 'spring';
    areaImpact = 60;
  } else if (range > 180) {
    type = 'spring';
    areaImpact = 45;
  } else if (range > 120) {
    type = 'neap';
    areaImpact = 25;
  } else {
    type = 'neap';
    areaImpact = 10;
  }

  return { type, range, areaImpact };
}

export function calculateDailyTideData(
  constituents: HarmonicConstituent[],
  date: Date,
  referenceLevel: number
): TideDayData {
  const hourlyData = generateHourlyTideData(constituents, date, referenceLevel, 48);
  const extremes = findTideExtremes(hourlyData);
  const { type, range, areaImpact } = determineTideType(extremes, date);

  return {
    date: dayjs(date).format('YYYY-MM-DD'),
    extremes,
    hourlyData: hourlyData.slice(0, 97),
    tideType: type,
    tidalRange: range,
    areaImpactPercent: areaImpact,
  };
}

export function getTideRiseRate(
  hourlyData: TidePoint[],
  currentTime: number
): number {
  const idx = hourlyData.findIndex(p => p.timestamp >= currentTime);
  if (idx < 1 || idx >= hourlyData.length - 1) return 0;

  const prev = hourlyData[Math.max(0, idx - 4)];
  const next = hourlyData[Math.min(hourlyData.length - 1, idx + 4)];
  const timeDiff = (next.timestamp - prev.timestamp) / 1000 / 60;
  const heightDiff = next.height - prev.height;

  return heightDiff / timeDiff;
}

export function estimateInundationSpeed(
  tideRiseRate: number,
  terrainSlope: number
): number {
  if (terrainSlope <= 0) return 0;
  return (tideRiseRate * 100) / terrainSlope;
}
