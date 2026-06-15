export interface HarmonicConstituent {
  name: string;
  amplitude: number;
  phase: number;
  speed: number;
}

export interface Beach {
  id: string;
  name: string;
  baseStation: string;
  latitude: number;
  longitude: number;
  terrainSlope: number;
  referenceLevel: number;
  harmonicParams: HarmonicConstituent[];
  createdAt: string;
  updatedAt: string;
}

export interface TidePoint {
  time: string;
  timestamp: number;
  height: number;
}

export interface TideExtreme {
  type: 'high' | 'low';
  time: string;
  timestamp: number;
  height: number;
}

export interface TideDayData {
  date: string;
  extremes: TideExtreme[];
  hourlyData: TidePoint[];
  tideType: 'spring' | 'neap' | 'astronomical';
  tidalRange: number;
  areaImpactPercent: number;
}

export interface CollectionZone {
  id: string;
  beachId: string;
  name: string;
  distanceFromEntry: number;
  walkingSpeed: number;
  targetTideHeight: number;
  estimatedTimeOneWay: number;
  notes: string;
}

export interface DangerZone {
  id: string;
  beachId: string;
  type: 'riptide' | 'dam_gap' | 'return_tide' | 'mudflat';
  name: string;
  description: string;
  warningLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export interface SafeRoute {
  id: string;
  beachId: string;
  name: string;
  entryPoint: string;
  waypoints: string[];
  collectionZoneId: string;
  criticalTideHeight: number;
  evacuationTime: string;
  notes: string;
}

export interface HarvestItem {
  id: string;
  species: string;
  weight: number;
  quantity: number;
  notes: string;
}

export interface JournalEntry {
  id: string;
  beachId: string;
  date: string;
  weather: string;
  actualHighTide: number;
  actualLowTide: number;
  startTime: string;
  endTime: string;
  harvestItems: HarvestItem[];
  totalWeight: number;
  notes: string;
  createdAt: string;
}

export interface WindowPlan {
  windowStart: string;
  windowEnd: string;
  bestEntryTime: string;
  mustReturnTime: string;
  durationMinutes: number;
  zones: {
    zoneId: string;
    zoneName: string;
    safe: boolean;
    roundTripTime: number;
    safetyMargin: number;
  }[];
}

export interface InundationRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  inundationSpeed: number;
  walkingSpeed: number;
  safeReturnTime: number;
  criticalWarning: string[];
}

export interface AlertItem {
  id: string;
  type: 'riptide' | 'dam_gap' | 'return_tide' | 'inundation' | 'general';
  title: string;
  description: string;
  level: 'info' | 'warning' | 'danger' | 'critical';
  time: string;
  action?: string;
}

export interface TideWindow {
  id: string;
  beachId: string;
  name: string;
  entryPoint: string;
  waypoints: string[];
  collectionZones: string[];
  criticalTideHeight: number;
  evacuationTime: string;
  dangerNotes: string;
  createdAt: string;
  updatedAt: string;
}
