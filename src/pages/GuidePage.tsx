import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import PageLayout from '../components/Layout/PageLayout';
import Card, { CardHeader, CardContent } from '../components/Card/Card';
import {
  Map,
  MapPin,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Navigation,
  Flag,
  Route,
  Ruler,
  Droplets,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { TideWindow } from '../types';

export default function GuidePage() {
  const {
    tideWindows,
    currentBeachId,
    beaches,
    collectionZones,
    addTideWindow,
    updateTideWindow,
    deleteTideWindow,
  } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<TideWindow | null>(null);
  const [editingGuide, setEditingGuide] = useState<TideWindow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [guideForm, setGuideForm] = useState({
    name: '',
    entryPoint: '',
    waypoints: '' as string | string[],
    collectionZones: [] as string[],
    criticalTideHeight: 100,
    evacuationTime: '',
    dangerNotes: '',
  });

  const getBeachName = (beachId: string) => {
    return beaches.find(b => b.id === beachId)?.name || '未知海滩';
  };

  const getZoneName = (zoneId: string) => {
    return collectionZones.find(z => z.id === zoneId)?.name || zoneId;
  };

  const beachZones = collectionZones.filter(z => z.beachId === currentBeachId);
  const beachGuides = tideWindows.filter(g => g.beachId === currentBeachId);

  const handleSaveGuide = () => {
    if (!guideForm.name) return;

    const waypointsArray = typeof guideForm.waypoints === 'string'
      ? guideForm.waypoints.split(/[,，、\n]/).filter(s => s.trim())
      : guideForm.waypoints;

    if (editingGuide) {
      updateTideWindow(editingGuide.id, {
        ...guideForm,
        waypoints: waypointsArray,
      });
    } else {
      addTideWindow({
        ...guideForm,
        beachId: currentBeachId,
        waypoints: waypointsArray,
      });
    }

    setShowAddForm(false);
    setEditingGuide(null);
    setGuideForm({
      name: '',
      entryPoint: '',
      waypoints: '',
      collectionZones: [],
      criticalTideHeight: 100,
      evacuationTime: '',
      dangerNotes: '',
    });
  };

  const handleEditGuide = (guide: TideWindow) => {
    setEditingGuide(guide);
    setGuideForm({
      name: guide.name,
      entryPoint: guide.entryPoint,
      waypoints: guide.waypoints.join(', '),
      collectionZones: guide.collectionZones,
      criticalTideHeight: guide.criticalTideHeight,
      evacuationTime: guide.evacuationTime,
      dangerNotes: guide.dangerNotes,
    });
    setShowAddForm(true);
  };

  const handleCopyGuide = (guide: TideWindow) => {
    const text = `
【赶海路书】${guide.name}
━━━━━━━━━━━━━━━━━━━━━━
📍 海滩：${getBeachName(guide.beachId)}
🚩 下海点：${guide.entryPoint}
🧭 途经点：${guide.waypoints.join(' → ')}
🎯 采集区：${guide.collectionZones.map(id => getZoneName(id)).join('、')}
🌊 临界潮高：${guide.criticalTideHeight}cm
⏰ 撤离时点：${guide.evacuationTime}
⚠️ 危险提示：${guide.dangerNotes}
━━━━━━━━━━━━━━━━━━━━━━
⚠️ 赶海有风险，下海需谨慎！
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(guide.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleZone = (zoneId: string) => {
    setGuideForm(prev => ({
      ...prev,
      collectionZones: prev.collectionZones.includes(zoneId)
        ? prev.collectionZones.filter(id => id !== zoneId)
        : [...prev.collectionZones, zoneId],
    }));
  };

  return (
    <PageLayout title="路书">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#3E92CC]/20 flex items-center justify-center">
                <Map size={24} className="text-[#3E92CC]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">我的路书</h3>
                <p className="text-sm text-slate-400">沉淀安全路线与撤离时点</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-[#3E92CC]">{beachGuides.length}</div>
                <div className="text-xs text-slate-400 mt-1">路线数</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-400">{beachZones.length}</div>
                <div className="text-xs text-slate-400 mt-1">采集区</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <div className="text-2xl font-bold text-yellow-400">{beaches.length}</div>
                <div className="text-xs text-slate-400 mt-1">海滩档案</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Route size={18} className="text-[#3E92CC]" />
            路线列表
          </h2>
          <button
            onClick={() => {
              setEditingGuide(null);
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-[#3E92CC] text-white rounded-xl text-sm font-medium hover:bg-[#3E92CC]/90 transition-all flex items-center gap-1"
          >
            <Plus size={16} />
            新建路书
          </button>
        </div>

        {beachGuides.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Map size={48} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">还没有保存的路线</p>
              <p className="text-sm text-slate-500 mt-1">点击上方按钮创建第一条路书</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {beachGuides.map((guide) => (
              <Card key={guide.id} onClick={() => setSelectedGuide(guide)} className="cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#3E92CC]/20 flex items-center justify-center">
                        <Flag size={18} className="text-[#3E92CC]" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{guide.name}</h4>
                        <p className="text-xs text-slate-400">
                          更新于 {dayjs(guide.updatedAt).format('MM-DD HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyGuide(guide);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#3E92CC] hover:bg-[#3E92CC]/20 transition-colors"
                      >
                        {copiedId === guide.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Navigation size={14} className="text-[#3ECC71]" />
                      <span className="text-slate-400">下海点：</span>
                      <span>{guide.entryPoint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Route size={14} className="text-[#F46036]" />
                      <span className="text-slate-400">途经：</span>
                      <span className="truncate">{guide.waypoints.join(' → ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={14} className="text-yellow-400" />
                      <span className="text-slate-400">采集：</span>
                      <span>{guide.collectionZones.map(id => getZoneName(id)).join('、')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Droplets size={14} className="text-[#3E92CC]" />
                      <span className="text-slate-400">临界潮高：</span>
                      <span className="text-[#3E92CC] font-semibold">{guide.criticalTideHeight}cm</span>
                      <span className="text-slate-400 ml-2">撤离：</span>
                      <span className="text-yellow-400 font-semibold">{guide.evacuationTime}</span>
                    </div>
                  </div>

                  {guide.dangerNotes && (
                    <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-xl flex items-start gap-2">
                      <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-200 line-clamp-2">{guide.dangerNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-[#3E92CC]" />
              <h3 className="text-white font-semibold">海滩档案</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {beaches.map((beach) => (
                <div
                  key={beach.id}
                  className={`p-4 rounded-xl border transition-all ${
                    beach.id === currentBeachId
                      ? 'bg-[#3E92CC]/20 border-[#3E92CC]'
                      : 'bg-slate-800/30 border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{beach.name}</h4>
                    {beach.id === currentBeachId && (
                      <span className="text-xs bg-[#3E92CC]/30 text-[#3E92CC] px-2 py-0.5 rounded-full">
                        当前
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>基准站：{beach.baseStation}</div>
                    <div>坡度：{beach.terrainSlope}m/km</div>
                    <div>基准面：{beach.referenceLevel}cm</div>
                    <div>坐标：{beach.latitude.toFixed(2)}, {beach.longitude.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
            <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slideUp">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {editingGuide ? '编辑路书' : '新建路书'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGuide(null);
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">路线名称</label>
                  <input
                    type="text"
                    value={guideForm.name}
                    onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    placeholder="如：金沙滩经典路线"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">下海点</label>
                  <input
                    type="text"
                    value={guideForm.entryPoint}
                    onChange={(e) => setGuideForm({ ...guideForm, entryPoint: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    placeholder="如：1号入口灯塔处"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">途经点（用逗号分隔）</label>
                  <textarea
                    value={typeof guideForm.waypoints === 'string' ? guideForm.waypoints : guideForm.waypoints.join(', ')}
                    onChange={(e) => setGuideForm({ ...guideForm, waypoints: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none resize-none"
                    rows={2}
                    placeholder="近岸缓冲带, 中滩标志杆, ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">选择采集区</label>
                  <div className="space-y-2">
                    {beachZones.map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => toggleZone(zone.id)}
                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                          guideForm.collectionZones.includes(zone.id)
                            ? 'bg-[#3E92CC]/20 border-2 border-[#3E92CC]'
                            : 'bg-slate-800 border border-slate-600 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className={guideForm.collectionZones.includes(zone.id) ? 'text-[#3E92CC]' : 'text-slate-400'} />
                          <span className={guideForm.collectionZones.includes(zone.id) ? 'text-white font-medium' : 'text-slate-300'}>
                            {zone.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{zone.distanceFromEntry}m</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">临界潮高 (cm)</label>
                    <input
                      type="number"
                      value={guideForm.criticalTideHeight}
                      onChange={(e) => setGuideForm({ ...guideForm, criticalTideHeight: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">超过此高度必须撤离</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">撤离时点</label>
                    <input
                      type="text"
                      value={guideForm.evacuationTime}
                      onChange={(e) => setGuideForm({ ...guideForm, evacuationTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                      placeholder="如：低潮后1.5小时"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">危险提示</label>
                  <textarea
                    value={guideForm.dangerNotes}
                    onChange={(e) => setGuideForm({ ...guideForm, dangerNotes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none resize-none"
                    rows={3}
                    placeholder="记录危险区域、注意事项、应对措施..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingGuide(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveGuide}
                    className="flex-1 py-3 rounded-xl bg-[#3E92CC] text-white font-medium hover:bg-[#3E92CC]/90 transition-all"
                  >
                    {editingGuide ? '保存修改' : '创建路书'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedGuide && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
            <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slideUp">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{selectedGuide.name}</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      handleCopyGuide(selectedGuide);
                    }}
                    className="p-2 text-slate-400 hover:text-[#3E92CC] transition-colors"
                  >
                    {copiedId === selectedGuide.id ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      handleEditGuide(selectedGuide);
                      setSelectedGuide(null);
                    }}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => {
                      deleteTideWindow(selectedGuide.id);
                      setSelectedGuide(null);
                    }}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedGuide(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Navigation size={16} className="text-[#3E92CC]" />
                    路线详情
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Flag size={12} className="text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">下海点</div>
                        <div className="text-white">{selectedGuide.entryPoint}</div>
                      </div>
                    </div>
                    {selectedGuide.waypoints.map((wp, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#3E92CC]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-[#3E92CC]"></div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">途经点 {idx + 1}</div>
                          <div className="text-white">{wp}</div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={12} className="text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">采集区</div>
                        <div className="text-white">
                          {selectedGuide.collectionZones.map(id => getZoneName(id)).join('、')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <Droplets size={20} className="text-[#3E92CC] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#3E92CC]">
                      {selectedGuide.criticalTideHeight}cm
                    </div>
                    <div className="text-xs text-slate-400">临界潮高</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <Clock size={20} className="text-yellow-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-yellow-400">
                      {selectedGuide.evacuationTime}
                    </div>
                    <div className="text-xs text-slate-400">撤离时点</div>
                  </div>
                </div>

                {selectedGuide.dangerNotes && (
                  <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      危险提示
                    </h4>
                    <p className="text-yellow-200 text-sm">{selectedGuide.dangerNotes}</p>
                  </div>
                )}

                <div className="text-center text-xs text-slate-500 pt-2">
                  创建于 {dayjs(selectedGuide.createdAt).format('YYYY-MM-DD HH:mm')}
                  <br />
                  更新于 {dayjs(selectedGuide.updatedAt).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
