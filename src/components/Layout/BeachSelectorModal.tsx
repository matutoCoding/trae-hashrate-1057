import { X, Plus, MapPin, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useState } from 'react';

interface BeachSelectorModalProps {
  onClose: () => void;
}

export default function BeachSelectorModal({ onClose }: BeachSelectorModalProps) {
  const { beaches, currentBeachId, setCurrentBeach, addBeach } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBeach, setNewBeach] = useState({
    name: '',
    baseStation: '',
    terrainSlope: 50,
    referenceLevel: 200,
  });

  const handleAdd = () => {
    if (!newBeach.name) return;
    addBeach({
      ...newBeach,
      latitude: 36.0,
      longitude: 120.0,
      harmonicParams: [
        { name: 'M2', amplitude: 120, phase: 45, speed: 28.984104 },
        { name: 'S2', amplitude: 40, phase: 30, speed: 30.0 },
        { name: 'K1', amplitude: 35, phase: 60, speed: 15.041069 },
        { name: 'O1', amplitude: 30, phase: 50, speed: 13.943035 },
      ],
    });
    setShowAddForm(false);
    setNewBeach({ name: '', baseStation: '', terrainSlope: 50, referenceLevel: 200 });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-hidden animate-slideUp">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">选择海滩</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {!showAddForm ? (
            <>
              <div className="space-y-2">
                {beaches.map((beach) => (
                  <button
                    key={beach.id}
                    onClick={() => {
                      setCurrentBeach(beach.id);
                      onClose();
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      beach.id === currentBeachId
                        ? 'bg-[#3E92CC]/20 border-2 border-[#3E92CC]'
                        : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        beach.id === currentBeachId ? 'bg-[#3E92CC]' : 'bg-slate-700'
                      }`}>
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{beach.name}</div>
                        <div className="text-sm text-slate-400">
                          基准站: {beach.baseStation} | 坡度: {beach.terrainSlope}m/km
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full mt-4 p-4 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 hover:border-[#3E92CC] hover:text-[#3E92CC] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>添加新海滩</span>
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">海滩名称</label>
                <input
                  type="text"
                  value={newBeach.name}
                  onChange={(e) => setNewBeach({ ...newBeach, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  placeholder="如：青岛金沙滩"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">基准潮汐站</label>
                <input
                  type="text"
                  value={newBeach.baseStation}
                  onChange={(e) => setNewBeach({ ...newBeach, baseStation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  placeholder="如：青岛港"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">地形坡度 (m/km)</label>
                  <input
                    type="number"
                    value={newBeach.terrainSlope}
                    onChange={(e) => setNewBeach({ ...newBeach, terrainSlope: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">基准面 (cm)</label>
                  <input
                    type="number"
                    value={newBeach.referenceLevel}
                    onChange={(e) => setNewBeach({ ...newBeach, referenceLevel: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 rounded-xl bg-[#3E92CC] text-white font-medium hover:bg-[#3E92CC]/90 transition-all"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
