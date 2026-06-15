import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import PageLayout from '../components/Layout/PageLayout';
import Card, { CardHeader, CardContent } from '../components/Card/Card';
import {
  Clock,
  MapPin,
  Footprints,
  Timer,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  Navigation,
  Calendar,
  X,
  ChevronRight,
  Map,
  Route,
  Save,
} from 'lucide-react';
import { formatDuration, generateActionTimeline, type TimelineEvent } from '../utils/timeUtils';
import { SAFETY_MARGIN_MINUTES, TIDE_TYPE_LABELS, TIDE_TYPE_COLORS } from '../utils/constants';
import type { CollectionZone } from '../types';
import { getSafeZones } from '../utils/riskAssessment';
import dayjs from 'dayjs';

const EVENT_COLORS: Record<TimelineEvent['type'], { dot: string; line: string; badge: string }> = {
  entry: { dot: 'bg-green-500', line: 'bg-green-500/50', badge: 'text-green-400 bg-green-500/10' },
  arrive: { dot: 'bg-[#3E92CC]', line: 'bg-[#3E92CC]/50', badge: 'text-[#3E92CC] bg-[#3E92CC]/10' },
  activity: { dot: 'bg-blue-400', line: 'bg-blue-400/50', badge: 'text-blue-400 bg-blue-500/10' },
  start_return: { dot: 'bg-yellow-500', line: 'bg-yellow-500/50', badge: 'text-yellow-400 bg-yellow-500/10' },
  return: { dot: 'bg-orange-500', line: 'bg-orange-500/50', badge: 'text-orange-400 bg-orange-500/10' },
  critical: { dot: 'bg-red-500', line: 'bg-red-500/50', badge: 'text-red-400 bg-red-500/10' },
};

export default function WindowPage() {
  const navigate = useNavigate();
  const {
    tideData,
    windowPlan,
    currentBeachId,
    collectionZones,
    addCollectionZone,
    updateCollectionZone,
    deleteCollectionZone,
    selectedDate,
    setSelectedDate,
    setGuideDraft,
    beaches,
  } = useAppStore();

  const [showAddZone, setShowAddZone] = useState(false);
  const [editingZone, setEditingZone] = useState<CollectionZone | null>(null);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    distanceFromEntry: 500,
    walkingSpeed: 60,
    targetTideHeight: 100,
    notes: '',
  });

  const currentBeach = beaches.find(b => b.id === currentBeachId);
  const beachZones = collectionZones.filter((z) => z.beachId === currentBeachId);
  const safeZones = tideData ? getSafeZones(beachZones, tideData) : [];

  const toggleZone = (zoneId: string) => {
    setSelectedZoneIds(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const timeline: TimelineEvent[] = useMemo(() => {
    if (!tideData || beachZones.length === 0) return [];
    return generateActionTimeline(tideData, beachZones, selectedZoneIds);
  }, [tideData, beachZones, selectedZoneIds]);

  const handleSaveZone = () => {
    if (!zoneForm.name) return;

    const estimatedTimeOneWay = Math.round(
      (zoneForm.distanceFromEntry / zoneForm.walkingSpeed) * 10
    ) / 10;

    if (editingZone) {
      updateCollectionZone(editingZone.id, {
        ...zoneForm,
        estimatedTimeOneWay,
      });
    } else {
      addCollectionZone({
        ...zoneForm,
        beachId: currentBeachId,
        estimatedTimeOneWay,
      });
    }

    setShowAddZone(false);
    setEditingZone(null);
    setZoneForm({
      name: '',
      distanceFromEntry: 500,
      walkingSpeed: 60,
      targetTideHeight: 100,
      notes: '',
    });
  };

  const handleEditZone = (zone: CollectionZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      distanceFromEntry: zone.distanceFromEntry,
      walkingSpeed: zone.walkingSpeed,
      targetTideHeight: zone.targetTideHeight,
      notes: zone.notes,
    });
    setShowAddZone(true);
  };

  const handleGenerateGuide = () => {
    if (!tideData || selectedZoneIds.length === 0) return;

    const selectedZones = beachZones.filter(z => selectedZoneIds.includes(z.id));
    const sortedByDistance = [...selectedZones].sort((a, b) => a.distanceFromEntry - b.distanceFromEntry);
    const farthestZone = sortedByDistance[sortedByDistance.length - 1];

    const zoneNames = sortedByDistance.map(z => z.name).join('+');
    const criticalHeight = Math.max(...selectedZones.map(z => z.targetTideHeight));
    const dangerNotes = selectedZones
      .filter(z => z.notes)
      .map(z => `【${z.name}】${z.notes}`)
      .join('；');

    setGuideDraft({
      name: `${dayjs(selectedDate).format('MM-DD')} ${zoneNames}路线`,
      collectionZones: selectedZoneIds,
      criticalTideHeight: criticalHeight,
      evacuationTime: windowPlan?.mustReturnTime || '低潮后2小时',
      dangerNotes,
      entryPoint: currentBeach?.baseStation ? `${currentBeach.baseStation}附近下海点` : '主入口下海点',
    });

    navigate('/guide');
  };

  if (!tideData || !windowPlan) {
    return (
      <PageLayout title="窗口规划">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-slate-400">加载中...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="窗口规划">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#3E92CC]" />
                <h3 className="text-white font-semibold">赶海日期</h3>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-[#3E92CC] focus:outline-none"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{currentBeach?.name || '未知海滩'}</div>
                <div className="text-sm text-slate-400">
                  <span
                    className="font-medium"
                    style={{ color: TIDE_TYPE_COLORS[tideData.tideType] }}
                  >
                    {TIDE_TYPE_LABELS[tideData.tideType]}
                  </span>
                  · 潮差 {tideData.highTide.height - tideData.lowTide.height}cm · 可及滩涂 {tideData.areaImpactPercent}%
                </div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>低潮 {tideData.lowTide.time} · {tideData.lowTide.height}cm</div>
                <div>高潮 {tideData.highTide.time} · {tideData.highTide.height}cm</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">最佳赶海窗口</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                <span>窗口开始</span>
                <span>最佳下海</span>
                <span>必须撤回</span>
                <span>窗口结束</span>
              </div>
              <div className="relative h-16 bg-slate-700/50 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-3 bg-slate-700 mx-4 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-[#3E92CC] to-yellow-500 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                <div className="absolute inset-0 flex justify-around items-center">
                  <div className="text-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mx-auto mb-1"></div>
                    <div className="text-white font-bold text-sm">
                      {windowPlan.windowStart}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-5 h-5 rounded-full bg-[#3E92CC] mx-auto mb-1 ring-4 ring-[#3E92CC]/30"></div>
                    <div className="text-white font-bold">
                      {windowPlan.bestEntryTime}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-5 h-5 rounded-full bg-yellow-500 mx-auto mb-1 ring-4 ring-yellow-500/30 animate-pulse"></div>
                    <div className="text-white font-bold">
                      {windowPlan.mustReturnTime}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 rounded-full bg-orange-500 mx-auto mb-1"></div>
                    <div className="text-white font-bold text-sm">
                      {windowPlan.windowEnd}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-400">
                  {formatDuration(windowPlan.durationMinutes)}
                </div>
                <div className="text-xs text-slate-400 mt-1">总可赶海时长</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-[#3E92CC]">
                  {windowPlan.bestEntryTime}
                </div>
                <div className="text-xs text-slate-400 mt-1">最佳下海时间</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-yellow-400">
                  {windowPlan.mustReturnTime}
                </div>
                <div className="text-xs text-slate-400 mt-1">必须撤回时间</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  安全余量：已预留 <span className="font-bold">{SAFETY_MARGIN_MINUTES}分钟</span> 撤离缓冲时间。请务必在 {windowPlan.mustReturnTime} 前开始返回。
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {timeline.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route size={18} className="text-[#3E92CC]" />
                  <h3 className="text-white font-semibold">行动时间线</h3>
                </div>
                <button
                  onClick={handleGenerateGuide}
                  disabled={selectedZoneIds.length === 0}
                  className="px-3 py-1.5 bg-[#3E92CC]/20 text-[#3E92CC] text-sm rounded-lg border border-[#3E92CC]/30 hover:bg-[#3E92CC]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Save size={14} />
                  生成路书
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedZoneIds.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <Map size={32} className="mx-auto mb-2 opacity-50" />
                  点击下方采集区选择要前往的区域，自动生成完整行动时间线
                </div>
              ) : (
                <div className="relative pl-1">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-700" />
                  <div className="space-y-3">
                    {timeline.map((event, idx) => {
                      const color = EVENT_COLORS[event.type];
                      return (
                        <div key={idx} className="relative flex gap-3">
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full ${color.dot} flex items-center justify-center ring-4 ring-slate-900`}>
                              <ChevronRight size={14} className="text-white" />
                            </div>
                          </div>
                          <div className={`flex-1 ${color.badge} rounded-xl px-3 py-2 border border-slate-700/50`}>
                            <div className="flex items-center justify-between">
                              <div className="text-white font-semibold text-sm">{event.title}</div>
                              <div className="text-xs font-mono font-bold opacity-80">{event.time}</div>
                            </div>
                            {event.subtitle && (
                              <div className="text-xs text-slate-300 mt-0.5 opacity-90">{event.subtitle}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#3E92CC]" />
                <h3 className="text-white font-semibold">采集区列表</h3>
                <span className="text-xs text-slate-400">（点击选择）</span>
              </div>
              <button
                onClick={() => setShowAddZone(true)}
                className="p-2 rounded-lg bg-[#3E92CC]/20 text-[#3E92CC] hover:bg-[#3E92CC]/30 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeZones.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MapPin size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无采集区配置</p>
                  <p className="text-sm">点击右上角添加采集区</p>
                </div>
              ) : (
                safeZones.map(({ zone, safe, reason }) => {
                  const isSelected = selectedZoneIds.includes(zone.id);
                  return (
                    <div
                      key={zone.id}
                      onClick={() => safe && toggleZone(zone.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3E92CC]/20 border-2 border-[#3E92CC] ring-2 ring-[#3E92CC]/30'
                          : safe
                          ? 'bg-green-900/20 border-green-700/50 hover:bg-green-900/30'
                          : 'bg-red-900/20 border-red-700/50 opacity-80 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckCircle size={20} className="text-[#3E92CC]" />
                          ) : safe ? (
                            <CheckCircle size={20} className="text-green-400" />
                          ) : (
                            <AlertTriangle size={20} className="text-red-400" />
                          )}
                          <span className="text-white font-semibold">{zone.name}</span>
                          {isSelected ? (
                            <span className="text-xs bg-[#3E92CC]/30 text-[#3E92CC] px-2 py-0.5 rounded-full">
                              已选中
                            </span>
                          ) : safe ? (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              可前往
                            </span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                              不可前往
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditZone(zone)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteCollectionZone(zone.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {!safe && reason && (
                        <div className="text-sm text-red-300 mb-2">原因：{reason}</div>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <div className="flex items-center justify-center gap-1 text-[#3E92CC]">
                            <Navigation size={12} />
                            <span className="font-bold">{zone.distanceFromEntry}m</span>
                          </div>
                          <div className="text-xs text-slate-400">距离</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <div className="flex items-center justify-center gap-1 text-green-400">
                            <Footprints size={12} />
                            <span className="font-bold">{zone.estimatedTimeOneWay.toFixed(1)}min</span>
                          </div>
                          <div className="text-xs text-slate-400">单程</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <div className="flex items-center justify-center gap-1 text-yellow-400">
                            <Timer size={12} />
                            <span className="font-bold">{(zone.estimatedTimeOneWay * 2 + SAFETY_MARGIN_MINUTES).toFixed(1)}min</span>
                          </div>
                          <div className="text-xs text-slate-400">含余量往返</div>
                        </div>
                      </div>
                      {zone.notes && (
                        <div className="mt-2 text-xs text-slate-400">
                          💡 {zone.notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {showAddZone && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
            <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slideUp">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {editingZone ? '编辑采集区' : '添加采集区'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddZone(false);
                    setEditingZone(null);
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">采集区名称</label>
                  <input
                    type="text"
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    placeholder="如：近岸花蛤区"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">距离入口 (m)</label>
                    <input
                      type="number"
                      value={zoneForm.distanceFromEntry}
                      onChange={(e) => setZoneForm({ ...zoneForm, distanceFromEntry: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">步行速度 (m/min)</label>
                    <input
                      type="number"
                      value={zoneForm.walkingSpeed}
                      onChange={(e) => setZoneForm({ ...zoneForm, walkingSpeed: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">目标潮高 (cm)</label>
                  <input
                    type="number"
                    value={zoneForm.targetTideHeight}
                    onChange={(e) => setZoneForm({ ...zoneForm, targetTideHeight: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">潮位低于此值才可进入</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">备注</label>
                  <textarea
                    value={zoneForm.notes}
                    onChange={(e) => setZoneForm({ ...zoneForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none resize-none"
                    rows={3}
                    placeholder="采集区特点、注意事项等..."
                  />
                </div>
                <div className="p-3 bg-[#3E92CC]/10 rounded-xl">
                  <div className="text-sm text-[#3E92CC]">
                    预计单程时间：<span className="font-bold">{(zoneForm.distanceFromEntry / zoneForm.walkingSpeed).toFixed(1)}分钟</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    往返含安全余量：<span className="font-bold">{(Math.round((zoneForm.distanceFromEntry / zoneForm.walkingSpeed) * 10) / 10 * 2 + SAFETY_MARGIN_MINUTES).toFixed(1)}分钟</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddZone(false);
                      setEditingZone(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveZone}
                    className="flex-1 py-3 rounded-xl bg-[#3E92CC] text-white font-medium hover:bg-[#3E92CC]/90 transition-all"
                  >
                    {editingZone ? '保存修改' : '添加'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
