export const HARMONIC_SPEEDS: Record<string, number> = {
  M2: 28.984104,
  S2: 30.0,
  K1: 15.041069,
  O1: 13.943035,
  P1: 14.958931,
  N2: 28.43973,
  K2: 30.082138,
  Q1: 13.398661,
};

export const TIDE_TYPE_LABELS: Record<string, string> = {
  spring: '大潮',
  neap: '小潮',
  astronomical: '天文大潮',
};

export const TIDE_TYPE_COLORS: Record<string, string> = {
  spring: '#F46036',
  neap: '#3E92CC',
  astronomical: '#D7263D',
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  low: '#2ECC71',
  medium: '#F1C40F',
  high: '#F46036',
  extreme: '#D7263D',
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  low: '低风险',
  medium: '中等风险',
  high: '高风险',
  extreme: '极高风险',
};

export const ALERT_LEVEL_COLORS: Record<string, string> = {
  info: '#3E92CC',
  warning: '#F1C40F',
  danger: '#F46036',
  critical: '#D7263D',
};

export const DANGER_ZONE_TYPES: Record<string, string> = {
  riptide: '回头潮',
  dam_gap: '堤坝缺口',
  return_tide: '反流区',
  mudflat: '松软泥滩',
};

export const WALKING_SPEED_TIDELAND = 60;
export const WALKING_SPEED_MUDFLAT = 30;
export const SAFETY_MARGIN_MINUTES = 30;
export const MINIMUM_COLLECTION_HEIGHT = 50;
