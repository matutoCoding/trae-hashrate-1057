import dayjs from 'dayjs';
import type { Beach, CollectionZone, DangerZone, TideWindow, JournalEntry } from '../types';

export const DEFAULT_HARMONIC_PARAMS = [
  { name: 'M2', amplitude: 120, phase: 45, speed: 28.984104 },
  { name: 'S2', amplitude: 40, phase: 30, speed: 30.0 },
  { name: 'K1', amplitude: 35, phase: 60, speed: 15.041069 },
  { name: 'O1', amplitude: 30, phase: 50, speed: 13.943035 },
  { name: 'P1', amplitude: 10, phase: 55, speed: 14.958931 },
  { name: 'N2', amplitude: 25, phase: 40, speed: 28.43973 },
];

export const DEFAULT_BEACHES: Beach[] = [
  {
    id: 'beach-001',
    name: '青岛金沙滩',
    baseStation: '青岛港',
    latitude: 36.05,
    longitude: 120.3,
    terrainSlope: 50,
    referenceLevel: 200,
    harmonicParams: DEFAULT_HARMONIC_PARAMS,
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  },
  {
    id: 'beach-002',
    name: '厦门黄厝海滩',
    baseStation: '厦门港',
    latitude: 24.45,
    longitude: 118.18,
    terrainSlope: 40,
    referenceLevel: 180,
    harmonicParams: DEFAULT_HARMONIC_PARAMS.map(p => ({
      ...p,
      amplitude: p.amplitude * 0.85,
      phase: p.phase + 15,
    })),
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  },
  {
    id: 'beach-003',
    name: '北海银滩',
    baseStation: '北海港',
    latitude: 21.45,
    longitude: 109.18,
    terrainSlope: 30,
    referenceLevel: 220,
    harmonicParams: DEFAULT_HARMONIC_PARAMS.map(p => ({
      ...p,
      amplitude: p.amplitude * 1.2,
      phase: p.phase - 10,
    })),
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  },
];

export const DEFAULT_COLLECTION_ZONES: CollectionZone[] = [
  {
    id: 'zone-001',
    beachId: 'beach-001',
    name: '近岸花蛤区',
    distanceFromEntry: 500,
    walkingSpeed: 60,
    targetTideHeight: 100,
    estimatedTimeOneWay: 10,
    notes: '多花蛤、小螃蟹，适合新手',
  },
  {
    id: 'zone-002',
    beachId: 'beach-001',
    name: '中滩蛏子区',
    distanceFromEntry: 1200,
    walkingSpeed: 50,
    targetTideHeight: 80,
    estimatedTimeOneWay: 25,
    notes: '蛏子密集，需带专用工具',
  },
  {
    id: 'zone-003',
    beachId: 'beach-001',
    name: '远滩牡蛎礁',
    distanceFromEntry: 2000,
    walkingSpeed: 40,
    targetTideHeight: 50,
    estimatedTimeOneWay: 45,
    notes: '野生牡蛎、海螺，大潮期才可到达',
  },
];

export const DEFAULT_DANGER_ZONES: DangerZone[] = [
  {
    id: 'danger-001',
    beachId: 'beach-001',
    type: 'riptide',
    name: '东侧回头潮区',
    description: '落潮后期此处形成强力回流，流速可达2m/s',
    warningLevel: 'high',
  },
  {
    id: 'danger-002',
    beachId: 'beach-001',
    type: 'dam_gap',
    name: '防波堤缺口',
    description: '堤坝缺口处涨潮速度为周边3倍，易阻断退路',
    warningLevel: 'extreme',
  },
  {
    id: 'danger-003',
    beachId: 'beach-001',
    type: 'mudflat',
    name: '西侧软泥区',
    description: '此处淤泥较深，易陷脚，行走速度骤降',
    warningLevel: 'medium',
  },
];

export const DEFAULT_TIDE_WINDOWS: TideWindow[] = [
  {
    id: 'guide-001',
    beachId: 'beach-001',
    name: '金沙滩经典路线',
    entryPoint: '1号入口',
    waypoints: ['近岸缓冲带', '中滩标志杆'],
    collectionZones: ['近岸花蛤区', '中滩蛏子区'],
    criticalTideHeight: 100,
    evacuationTime: '低潮后1.5小时',
    dangerNotes: '避开东侧回头潮区，留意防波堤缺口涨潮时间',
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  },
];

export const DEFAULT_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'journal-001',
    beachId: 'beach-001',
    date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
    weather: '晴',
    actualHighTide: 350,
    actualLowTide: 80,
    startTime: '08:30',
    endTime: '12:00',
    totalWeight: 3.5,
    harvestItems: [
      { id: 'h1', species: '花蛤', weight: 2.0, quantity: 80, notes: '个大饱满' },
      { id: 'h2', species: '蛏子', weight: 1.2, quantity: 25, notes: '集中在中滩' },
      { id: 'h3', species: '小螃蟹', weight: 0.3, quantity: 15, notes: '孩子抓的' },
    ],
    notes: '天气好，潮水退得干净，中滩蛏子很多',
    createdAt: dayjs().subtract(3, 'day').toISOString(),
  },
  {
    id: 'journal-002',
    beachId: 'beach-001',
    date: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    weather: '多云',
    actualHighTide: 320,
    actualLowTide: 100,
    startTime: '09:15',
    endTime: '11:30',
    totalWeight: 2.2,
    harvestItems: [
      { id: 'h1', species: '花蛤', weight: 1.5, quantity: 60, notes: '密度一般' },
      { id: 'h2', species: '海螺', weight: 0.7, quantity: 12, notes: '远滩找到' },
    ],
    notes: '小潮期，只去了近岸区',
    createdAt: dayjs().subtract(10, 'day').toISOString(),
  },
  {
    id: 'journal-003',
    beachId: 'beach-002',
    date: dayjs().subtract(18, 'day').format('YYYY-MM-DD'),
    weather: '晴',
    actualHighTide: 300,
    actualLowTide: 60,
    startTime: '07:45',
    endTime: '11:00',
    totalWeight: 5.8,
    harvestItems: [
      { id: 'h1', species: '花蛤', weight: 3.0, quantity: 120, notes: '超多' },
      { id: 'h2', species: '竹蛏', weight: 2.0, quantity: 35, notes: '很大' },
      { id: 'h3', species: '海胆', weight: 0.8, quantity: 8, notes: '礁石区' },
    ],
    notes: '厦门黄厝的大潮期，收获满满',
    createdAt: dayjs().subtract(18, 'day').toISOString(),
  },
];
