import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import PageLayout from '../components/Layout/PageLayout';
import TideChart from '../components/TideChart/TideChart';
import Card, { CardHeader, CardContent } from '../components/Card/Card';
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  TrendingUp,
  Waves,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ruler,
} from 'lucide-react';
import {
  TIDE_TYPE_LABELS,
  TIDE_TYPE_COLORS,
} from '../utils/constants';
import dayjs from 'dayjs';

export default function TidePage() {
  const {
    tideData,
    currentBeachId,
    beaches,
    selectedDate,
    setSelectedDate,
    recalculateTideData,
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState(Date.now());
  const currentBeach = beaches.find((b) => b.id === currentBeachId);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    recalculateTideData();
  }, []);

  const changeDate = (days: number) => {
    const newDate = dayjs(selectedDate).add(days, 'day').format('YYYY-MM-DD');
    setSelectedDate(newDate);
  };

  const getCurrentHeight = () => {
    if (!tideData) return null;
    const point = tideData.hourlyData.find(
      (p) => p.timestamp <= currentTime && p.timestamp + 15 * 60 * 1000 > currentTime
    );
    return point?.height || null;
  };

  const currentHeight = getCurrentHeight();
  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');

  if (!tideData || !currentBeach) {
    return (
      <PageLayout title="潮汐预报">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-slate-400">加载中...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="潮汐预报">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#3E92CC]" />
                <span className="text-white font-semibold">
                  {dayjs(selectedDate).format('YYYY年MM月DD日')}
                  {isToday && (
                    <span className="ml-2 text-xs bg-[#3E92CC]/20 text-[#3E92CC] px-2 py-0.5 rounded-full">
                      今天
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
                  className="px-3 py-1 text-sm bg-[#3E92CC]/20 text-[#3E92CC] rounded-lg hover:bg-[#3E92CC]/30 transition-colors"
                >
                  今日
                </button>
                <button
                  onClick={() => changeDate(1)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TideChart tideData={tideData} height={240} />

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-[#F46036]"></div>
                <span className="text-slate-400">高潮</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-[#2ECC71]"></div>
                <span className="text-slate-400">低潮</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isToday && currentHeight !== null && (
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">当前潮位</div>
                <div className="text-5xl font-bold text-[#3E92CC] mb-2">
                  {currentHeight.toFixed(0)}
                  <span className="text-2xl ml-1">cm</span>
                </div>
                <div className="text-slate-400 text-sm">
                  {dayjs(currentTime).format('HH:mm')} 实时更新
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Waves size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">高低潮时刻</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {tideData.extremes.map((extreme, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {extreme.type === 'high' ? (
                      <ArrowUp size={18} className="text-[#F46036]" />
                    ) : (
                      <ArrowDown size={18} className="text-[#2ECC71]" />
                    )}
                    <span className="text-slate-400 text-sm">
                      {extreme.type === 'high' ? '高潮' : '低潮'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {extreme.time}
                  </div>
                  <div className="text-lg font-semibold text-[#3E92CC]">
                    {extreme.height.toFixed(0)} cm
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">潮汐类型</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${TIDE_TYPE_COLORS[tideData.tideType]}20` }}
              >
                <span
                  className="text-2xl font-bold"
                  style={{ color: TIDE_TYPE_COLORS[tideData.tideType] }}
                >
                  {tideData.tidalRange.toFixed(0)}
                </span>
              </div>
              <div>
                <div
                  className="text-xl font-bold"
                  style={{ color: TIDE_TYPE_COLORS[tideData.tideType] }}
                >
                  {TIDE_TYPE_LABELS[tideData.tideType]}
                </div>
                <div className="text-slate-400 text-sm">
                  潮差 {tideData.tidalRange.toFixed(0)} cm
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-slate-300 text-sm">可达滩涂面积影响</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${tideData.areaImpactPercent}%`,
                    backgroundColor: TIDE_TYPE_COLORS[tideData.tideType],
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">比平日增加</span>
                <span
                  className="font-bold"
                  style={{ color: TIDE_TYPE_COLORS[tideData.tideType] }}
                >
                  +{tideData.areaImpactPercent}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">海滩参数</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">基准站</div>
                <div className="text-white font-medium">
                  {currentBeach.baseStation}
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">地形坡度</div>
                <div className="text-white font-medium">
                  {currentBeach.terrainSlope} m/km
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">基准面</div>
                <div className="text-white font-medium">
                  {currentBeach.referenceLevel} cm
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">经纬度</div>
                <div className="text-white font-medium text-sm">
                  {currentBeach.latitude.toFixed(2)},{' '}
                  {currentBeach.longitude.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
