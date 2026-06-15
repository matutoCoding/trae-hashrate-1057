import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import PageLayout from '../components/Layout/PageLayout';
import Card, { CardHeader, CardContent } from '../components/Card/Card';
import {
  Plus,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Scale,
  Fish,
  Trash2,
  Edit3,
  BarChart3,
  X,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { JournalEntry, HarvestItem } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const weatherIcons: Record<string, React.ElementType> = {
  晴: Sun,
  多云: Cloud,
  阴: Cloud,
  小雨: CloudRain,
  大风: Wind,
};

const COLORS = ['#3E92CC', '#F46036', '#2ECC71', '#F1C40F', '#9B59B6', '#E67E22'];

export default function JournalPage() {
  const { journalEntries, beaches, addJournalEntry, deleteJournalEntry, addHarvestItem, updateHarvestItem, deleteHarvestItem } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [entryForm, setEntryForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    beachId: '',
    weather: '晴',
    actualHighTide: 300,
    actualLowTide: 100,
    startTime: '08:00',
    endTime: '11:30',
    notes: '',
  });
  const [harvestForm, setHarvestForm] = useState({
    species: '',
    weight: 0.5,
    quantity: 10,
    notes: '',
  });

  const getBeachName = (beachId: string) => {
    return beaches.find(b => b.id === beachId)?.name || '未知海滩';
  };

  useEffect(() => {
    if (selectedEntry) {
      const updated = journalEntries.find(j => j.id === selectedEntry.id);
      if (updated) {
        setSelectedEntry(updated);
      }
    }
  }, [journalEntries]);

  const handleAddEntry = () => {
    const beachId = entryForm.beachId || beaches[0]?.id || '';

    addJournalEntry({
      ...entryForm,
      beachId,
      harvestItems: [],
      totalWeight: 0,
    });

    setShowAddForm(false);
    setEntryForm({
      date: dayjs().format('YYYY-MM-DD'),
      beachId: '',
      weather: '晴',
      actualHighTide: 300,
      actualLowTide: 100,
      startTime: '08:00',
      endTime: '11:30',
      notes: '',
    });
  };

  const handleAddHarvest = () => {
    if (!selectedEntry || !harvestForm.species) return;

    addHarvestItem(selectedEntry.id, {
      ...harvestForm,
    });

    setHarvestForm({
      species: '',
      weight: 0.5,
      quantity: 10,
      notes: '',
    });
  };

  const statsData = journalEntries.reduce((acc, entry) => {
    const month = dayjs(entry.date).format('YYYY-MM');
    if (!acc[month]) {
      acc[month] = { count: 0, totalWeight: 0 };
    }
    acc[month].count += 1;
    acc[month].totalWeight += entry.totalWeight;
    return acc;
  }, {} as Record<string, { count: number; totalWeight: number }>);

  const monthlyStats = Object.entries(statsData).map(([month, data]) => ({
    month: month.slice(5) + '月',
    次数: data.count,
    收获: Number(data.totalWeight.toFixed(1)),
  })).slice(-6);

  const speciesStats = journalEntries.reduce((acc, entry) => {
    entry.harvestItems.forEach(item => {
      if (!acc[item.species]) {
        acc[item.species] = 0;
      }
      acc[item.species] += item.weight;
    });
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(speciesStats).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(1)),
  }));

  const totalTrips = journalEntries.length;
  const totalWeight = journalEntries.reduce((sum, e) => sum + e.totalWeight, 0);
  const avgWeight = totalTrips > 0 ? totalWeight / totalTrips : 0;

  return (
    <PageLayout title="赶海日志">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-[#3E92CC]">{totalTrips}</div>
              <div className="text-xs text-slate-400 mt-1">总赶海次数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{totalWeight.toFixed(1)}</div>
              <div className="text-xs text-slate-400 mt-1">总收获 (kg)</div>
            </CardContent>
          </Card>
          <Card onClick={() => setShowStats(!showStats)} className="cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{avgWeight.toFixed(1)}</div>
              <div className="text-xs text-slate-400 mt-1">平均每次 (kg)</div>
            </CardContent>
          </Card>
        </div>

        {showStats && monthlyStats.length > 0 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#3E92CC]" />
                  <h3 className="text-white font-semibold">月度统计</h3>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis dataKey="month" stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 10 }} />
                    <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Bar dataKey="次数" fill="#3E92CC" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="收获" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {pieData.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Fish size={18} className="text-[#3E92CC]" />
                    <h3 className="text-white font-semibold">收获种类分布</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1">
                      {pieData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></div>
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-slate-400 ml-auto">{item.value}kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-[#3E92CC]" />
            历史记录
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#3E92CC] text-white rounded-xl text-sm font-medium hover:bg-[#3E92CC]/90 transition-all flex items-center gap-1"
          >
            <Plus size={16} />
            记录
          </button>
        </div>

        {journalEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Fish size={48} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">还没有赶海记录</p>
              <p className="text-sm text-slate-500 mt-1">点击上方按钮记录第一次赶海</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {journalEntries.map((entry) => {
              const WeatherIcon = weatherIcons[entry.weather] || Sun;
              return (
                <Card key={entry.id} onClick={() => setSelectedEntry(entry)} className="cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{getBeachName(entry.beachId)}</span>
                          <span className="text-xs text-slate-400">{entry.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <WeatherIcon size={14} />
                            {entry.weather}
                          </span>
                          <span>{entry.startTime} - {entry.endTime}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{entry.totalWeight}kg</div>
                        <div className="text-xs text-slate-400">总收获</div>
                      </div>
                    </div>
                    {entry.harvestItems.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.harvestItems.slice(0, 4).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300"
                          >
                            {item.species} {item.weight}kg
                          </span>
                        ))}
                        {entry.harvestItems.length > 4 && (
                          <span className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-400">
                            +{entry.harvestItems.length - 4}种
                          </span>
                        )}
                      </div>
                    )}
                    {entry.notes && (
                      <p className="mt-2 text-sm text-slate-400 line-clamp-1">
                        💡 {entry.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
            <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slideUp">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">记录赶海</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">日期</label>
                    <input
                      type="date"
                      value={entryForm.date}
                      onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">海滩</label>
                    <select
                      value={entryForm.beachId}
                      onChange={(e) => setEntryForm({ ...entryForm, beachId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    >
                      {beaches.map((beach) => (
                        <option key={beach.id} value={beach.id}>{beach.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">天气</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(weatherIcons).map((w) => {
                      const Icon = weatherIcons[w];
                      return (
                        <button
                          key={w}
                          onClick={() => setEntryForm({ ...entryForm, weather: w })}
                          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                            entryForm.weather === w
                              ? 'bg-[#3E92CC] text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-xs">{w}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">实际高潮 (cm)</label>
                    <input
                      type="number"
                      value={entryForm.actualHighTide}
                      onChange={(e) => setEntryForm({ ...entryForm, actualHighTide: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">实际低潮 (cm)</label>
                    <input
                      type="number"
                      value={entryForm.actualLowTide}
                      onChange={(e) => setEntryForm({ ...entryForm, actualLowTide: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">开始时间</label>
                    <input
                      type="time"
                      value={entryForm.startTime}
                      onChange={(e) => setEntryForm({ ...entryForm, startTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">结束时间</label>
                    <input
                      type="time"
                      value={entryForm.endTime}
                      onChange={(e) => setEntryForm({ ...entryForm, endTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">备注</label>
                  <textarea
                    value={entryForm.notes}
                    onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-[#3E92CC] focus:outline-none resize-none"
                    rows={3}
                    placeholder="今天的收获、经验、注意事项..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="flex-1 py-3 rounded-xl bg-[#3E92CC] text-white font-medium hover:bg-[#3E92CC]/90 transition-all"
                  >
                    保存记录
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
            <div className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slideUp">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">赶海详情</h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      deleteJournalEntry(selectedEntry.id);
                      setSelectedEntry(null);
                    }}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-semibold text-lg">{getBeachName(selectedEntry.beachId)}</div>
                      <div className="text-slate-400 text-sm">{selectedEntry.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">{selectedEntry.totalWeight}kg</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-slate-400">潮差</div>
                      <div className="text-white font-bold">{selectedEntry.actualHighTide - selectedEntry.actualLowTide}cm</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-slate-400">时长</div>
                      <div className="text-white font-bold">
                        {dayjs(selectedEntry.endTime, 'HH:mm').diff(dayjs(selectedEntry.startTime, 'HH:mm'), 'hour', true).toFixed(1)}h
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2">
                      <div className="text-slate-400">种类</div>
                      <div className="text-white font-bold">{selectedEntry.harvestItems.length}种</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Scale size={16} className="text-[#3E92CC]" />
                    收获清单
                  </h3>
                  <div className="space-y-2">
                    {selectedEntry.harvestItems.map((item) => (
                      <div key={item.id} className="bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{item.species}</div>
                          <div className="text-xs text-slate-400">{item.quantity}个 · {item.notes}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">{item.weight}kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Plus size={16} className="text-[#3E92CC]" />
                    添加收获
                  </h3>
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <input
                      type="text"
                      value={harvestForm.species}
                      onChange={(e) => setHarvestForm({ ...harvestForm, species: e.target.value })}
                      placeholder="种类，如：花蛤、蛏子"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-[#3E92CC] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400">重量 (kg)</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setHarvestForm({ ...harvestForm, weight: Math.max(0.1, harvestForm.weight - 0.1) })}
                            className="p-1.5 bg-slate-700 rounded text-white"
                          >
                            <MinusCircle size={16} />
                          </button>
                          <input
                            type="number"
                            step="0.1"
                            value={harvestForm.weight}
                            onChange={(e) => setHarvestForm({ ...harvestForm, weight: Number(e.target.value) })}
                            className="flex-1 px-2 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm text-center focus:border-[#3E92CC] focus:outline-none"
                          />
                          <button
                            onClick={() => setHarvestForm({ ...harvestForm, weight: harvestForm.weight + 0.1 })}
                            className="p-1.5 bg-slate-700 rounded text-white"
                          >
                            <PlusCircle size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">数量</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setHarvestForm({ ...harvestForm, quantity: Math.max(1, harvestForm.quantity - 1) })}
                            className="p-1.5 bg-slate-700 rounded text-white"
                          >
                            <MinusCircle size={16} />
                          </button>
                          <input
                            type="number"
                            value={harvestForm.quantity}
                            onChange={(e) => setHarvestForm({ ...harvestForm, quantity: Number(e.target.value) })}
                            className="flex-1 px-2 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm text-center focus:border-[#3E92CC] focus:outline-none"
                          />
                          <button
                            onClick={() => setHarvestForm({ ...harvestForm, quantity: harvestForm.quantity + 1 })}
                            className="p-1.5 bg-slate-700 rounded text-white"
                          >
                            <PlusCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleAddHarvest}
                      className="w-full py-2 bg-[#3E92CC] text-white rounded-lg text-sm font-medium hover:bg-[#3E92CC]/90 transition-all"
                    >
                      添加
                    </button>
                  </div>
                </div>

                {selectedEntry.notes && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">备注</div>
                    <p className="text-white">{selectedEntry.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
