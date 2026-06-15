import { X, Plus, MapPin, Trash2, Edit3, Save, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useState } from 'react';
import type { Beach, HarmonicConstituent } from '../../types';
import { HARMONIC_SPEEDS } from '../../utils/constants';

interface BeachSelectorModalProps {
  onClose: () => void;
}

const emptyConstituents = (): HarmonicConstituent[] => [
  { name: 'M2', amplitude: 120, phase: 45, speed: HARMONIC_SPEEDS.M2 },
  { name: 'S2', amplitude: 40, phase: 30, speed: HARMONIC_SPEEDS.S2 },
  { name: 'K1', amplitude: 35, phase: 60, speed: HARMONIC_SPEEDS.K1 },
  { name: 'O1', amplitude: 30, phase: 50, speed: HARMONIC_SPEEDS.O1 },
  { name: 'P1', amplitude: 10, phase: 55, speed: HARMONIC_SPEEDS.P1 },
  { name: 'N2', amplitude: 25, phase: 40, speed: HARMONIC_SPEEDS.N2 },
];

type ViewMode = 'list' | 'add' | 'edit';

export default function BeachSelectorModal({ onClose }: BeachSelectorModalProps) {
  const { beaches, currentBeachId, setCurrentBeach, addBeach, updateBeach } = useAppStore();
  const [view, setView] = useState<ViewMode>('list');
  const [editingBeach, setEditingBeach] = useState<Beach | null>(null);
  const [form, setForm] = useState({
    name: '',
    baseStation: '',
    latitude: 36.0,
    longitude: 120.0,
    terrainSlope: 50,
    referenceLevel: 200,
    harmonicParams: emptyConstituents(),
  });

  const resetForm = () => {
    setForm({
      name: '',
      baseStation: '',
      latitude: 36.0,
      longitude: 120.0,
      terrainSlope: 50,
      referenceLevel: 200,
      harmonicParams: emptyConstituents(),
    });
  };

  const startAdd = () => {
    resetForm();
    setEditingBeach(null);
    setView('add');
  };

  const startEdit = (beach: Beach) => {
    setEditingBeach(beach);
    setForm({
      name: beach.name,
      baseStation: beach.baseStation,
      latitude: beach.latitude,
      longitude: beach.longitude,
      terrainSlope: beach.terrainSlope,
      referenceLevel: beach.referenceLevel,
      harmonicParams: beach.harmonicParams.map(p => ({ ...p })),
    });
    setView('edit');
  };

  const handleSave = () => {
    if (!form.name) return;

    if (editingBeach) {
      updateBeach(editingBeach.id, {
        ...form,
      });
    } else {
      addBeach({
        ...form,
      });
    }
    setView('list');
    setEditingBeach(null);
    resetForm();
  };

  const updateConstituent = (idx: number, field: 'amplitude' | 'phase', value: number) => {
    setForm(prev => ({
      ...prev,
      harmonicParams: prev.harmonicParams.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      ),
    }));
  };

  const BackButton = () => (
    <button
      onClick={() => { setView('list'); setEditingBeach(null); }}
      className="p-2 text-slate-400 hover:text-white transition-colors"
    >
      <ArrowLeft size={20} />
    </button>
  );

  const HarmonicEditor = () => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">调和分潮参数</label>
      <div className="space-y-2">
        {form.harmonicParams.map((p, idx) => (
          <div key={p.name} className="bg-slate-900/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#3E92CC] font-semibold">{p.name} 分潮</span>
              <span className="text-xs text-slate-500">角速度 {p.speed.toFixed(2)}°/h</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">振幅 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={p.amplitude}
                  onChange={(e) => updateConstituent(idx, 'amplitude', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-[#3E92CC] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">相位 (°)</label>
                <input
                  type="number"
                  step="1"
                  value={p.phase}
                  onChange={(e) => updateConstituent(idx, 'phase', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-[#3E92CC] focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        提示：调和分潮参数可从当地海洋预报机构查询，M2/S2 为主太阴/太阳半日分潮，K1/O1 为主太阴/太阳全日分潮。
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden animate-slideUp">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {view !== 'list' && <BackButton />}
            <h2 className="text-lg font-bold text-white">
              {view === 'list' ? '选择海滩' : view === 'add' ? '添加新海滩' : `编辑：${editingBeach?.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {view === 'list' && (
            <>
              <div className="space-y-2">
                {beaches.map((beach) => (
                  <div
                    key={beach.id}
                    className={`p-4 rounded-xl transition-all ${
                      beach.id === currentBeachId
                        ? 'bg-[#3E92CC]/20 border-2 border-[#3E92CC]'
                        : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => {
                          setCurrentBeach(beach.id);
                          onClose();
                        }}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          beach.id === currentBeachId ? 'bg-[#3E92CC]' : 'bg-slate-700'
                        }`}>
                          <MapPin size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{beach.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            基准站: {beach.baseStation} | 坡度: {beach.terrainSlope}m/km
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            基准面: {beach.referenceLevel}cm | 坐标: {beach.latitude.toFixed(2)}, {beach.longitude.toFixed(2)}
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        {beach.id === currentBeachId && (
                          <span className="text-xs bg-[#3E92CC]/30 text-[#3E92CC] px-2 py-0.5 rounded-full mr-1 self-center">
                            当前
                          </span>
                        )}
                        <button
                          onClick={() => startEdit(beach)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={startAdd}
                className="w-full mt-4 p-4 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 hover:border-[#3E92CC] hover:text-[#3E92CC] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>添加新海滩</span>
              </button>
            </>
          )}

          {(view === 'add' || view === 'edit') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">海滩名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  placeholder="如：青岛金沙滩"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">基准潮汐站</label>
                <input
                  type="text"
                  value={form.baseStation}
                  onChange={(e) => setForm({ ...form, baseStation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  placeholder="如：青岛港"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">纬度</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">经度</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">地形坡度 (m/km)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.terrainSlope}
                    onChange={(e) => setForm({ ...form, terrainSlope: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">数值越小滩涂越平缓，漫滩风险越高</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">基准面 (cm)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.referenceLevel}
                    onChange={(e) => setForm({ ...form, referenceLevel: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">潮位基准站零点高度</p>
                </div>
              </div>
              <HarmonicEditor />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setView('list'); setEditingBeach(null); }}
                  className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-[#3E92CC] text-white font-medium hover:bg-[#3E92CC]/90 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {view === 'edit' ? '保存修改' : '添加海滩'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
