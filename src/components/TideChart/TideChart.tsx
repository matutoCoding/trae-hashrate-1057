import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import dayjs from 'dayjs';
import type { TideDayData } from '../../types';
import { TIDE_TYPE_COLORS } from '../../utils/constants';
import { formatTime } from '../../utils/timeUtils';

interface TideChartProps {
  tideData: TideDayData;
  height?: number;
}

export default function TideChart({ tideData, height = 220 }: TideChartProps) {
  const chartData = tideData.hourlyData.slice(0, 97).map((point) => ({
    ...point,
    timeLabel: dayjs(point.timestamp).format('HH:mm'),
  }));

  const minHeight = Math.min(...chartData.map((d) => d.height)) - 20;
  const maxHeight = Math.max(...chartData.map((d) => d.height)) + 20;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-600 rounded-lg px-3 py-2 backdrop-blur-sm">
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-[#3E92CC] text-lg font-bold">
            {payload[0].value.toFixed(0)} cm
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3E92CC" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3E92CC" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
          <XAxis
            dataKey="timeLabel"
            stroke="#ffffff40"
            tick={{ fill: '#ffffff80', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#ffffff20' }}
            interval={12}
          />
          <YAxis
            stroke="#ffffff40"
            tick={{ fill: '#ffffff80', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#ffffff20' }}
            domain={[minHeight, maxHeight]}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {tideData.extremes.map((extreme, idx) => (
            <ReferenceLine
              key={idx}
              x={formatTime(extreme.timestamp)}
              stroke={extreme.type === 'high' ? '#F46036' : '#2ECC71'}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          ))}
          <Area
            type="monotone"
            dataKey="height"
            stroke="#3E92CC"
            strokeWidth={2.5}
            fill="url(#tideGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: '#3E92CC',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
          {tideData.extremes.map((extreme, idx) => {
            const xPos = chartData.findIndex(
              (d) => d.timestamp >= extreme.timestamp
            );
            if (xPos === -1) return null;
            return (
              <circle
                key={`dot-${idx}`}
                cx={0}
                cy={0}
                r={0}
                fill="transparent"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
