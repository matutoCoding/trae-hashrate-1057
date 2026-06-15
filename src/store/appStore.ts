import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type {
  Beach,
  CollectionZone,
  DangerZone,
  TideWindow,
  JournalEntry,
  TideDayData,
  InundationRisk,
  AlertItem,
  HarvestItem,
} from '../types';
import {
  DEFAULT_BEACHES,
  DEFAULT_COLLECTION_ZONES,
  DEFAULT_DANGER_ZONES,
  DEFAULT_TIDE_WINDOWS,
  DEFAULT_JOURNAL_ENTRIES,
} from '../data/defaultBeaches';
import { calculateDailyTideData } from '../utils/tideHarmonics';
import { calculateInundationRisk, generateAlerts, getSafeZones } from '../utils/riskAssessment';
import { calculateGatheringWindow } from '../utils/timeUtils';
import type { WindowPlan } from '../types';

interface AppState {
  currentBeachId: string;
  beaches: Beach[];
  collectionZones: CollectionZone[];
  dangerZones: DangerZone[];
  tideWindows: TideWindow[];
  journalEntries: JournalEntry[];
  selectedDate: string;
  tideData: TideDayData | null;
  windowPlan: WindowPlan | null;
  inundationRisk: InundationRisk | null;
  alerts: AlertItem[];
  currentTime: number;
  setCurrentBeach: (beachId: string) => void;
  setSelectedDate: (date: string) => void;
  addBeach: (beach: Omit<Beach, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBeach: (id: string, updates: Partial<Beach>) => void;
  addCollectionZone: (zone: Omit<CollectionZone, 'id'>) => void;
  updateCollectionZone: (id: string, updates: Partial<CollectionZone>) => void;
  deleteCollectionZone: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  addTideWindow: (window: Omit<TideWindow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTideWindow: (id: string, updates: Partial<TideWindow>) => void;
  deleteTideWindow: (id: string) => void;
  recalculateTideData: () => void;
  recalculateRisk: (distance: number) => void;
  addHarvestItem: (journalId: string, item: Omit<HarvestItem, 'id'>) => void;
  updateHarvestItem: (journalId: string, itemId: string, updates: Partial<HarvestItem>) => void;
  deleteHarvestItem: (journalId: string, itemId: string) => void;
}

const getInitialBeachId = () => DEFAULT_BEACHES[0]?.id || '';

const initialState: Partial<AppState> = {
  currentBeachId: getInitialBeachId(),
  beaches: DEFAULT_BEACHES,
  collectionZones: DEFAULT_COLLECTION_ZONES,
  dangerZones: DEFAULT_DANGER_ZONES,
  tideWindows: DEFAULT_TIDE_WINDOWS,
  journalEntries: DEFAULT_JOURNAL_ENTRIES,
  selectedDate: dayjs().format('YYYY-MM-DD'),
  currentTime: Date.now(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...(initialState as AppState),
      tideData: null,
      windowPlan: null,
      inundationRisk: null,
      alerts: [],

      setCurrentBeach: (beachId) => {
        set({ currentBeachId: beachId });
        get().recalculateTideData();
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
        get().recalculateTideData();
      },

      addBeach: (beach) => {
        const now = dayjs().toISOString();
        const newBeach: Beach = {
          ...beach,
          id: `beach-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          beaches: [...state.beaches, newBeach],
          currentBeachId: newBeach.id,
        }));
        get().recalculateTideData();
      },

      updateBeach: (id, updates) => {
        set((state) => ({
          beaches: state.beaches.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: dayjs().toISOString() } : b
          ),
        }));
        if (get().currentBeachId === id) {
          get().recalculateTideData();
        }
      },

      addCollectionZone: (zone) => {
        const newZone: CollectionZone = {
          ...zone,
          id: `zone-${Date.now()}`,
        };
        set((state) => ({
          collectionZones: [...state.collectionZones, newZone],
        }));
        get().recalculateTideData();
      },

      updateCollectionZone: (id, updates) => {
        set((state) => ({
          collectionZones: state.collectionZones.map((z) =>
            z.id === id ? { ...z, ...updates } : z
          ),
        }));
        get().recalculateTideData();
      },

      deleteCollectionZone: (id) => {
        set((state) => ({
          collectionZones: state.collectionZones.filter((z) => z.id !== id),
        }));
      },

      addJournalEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: `journal-${Date.now()}`,
          createdAt: dayjs().toISOString(),
        };
        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
      },

      updateJournalEntry: (id, updates) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        }));
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter((j) => j.id !== id),
        }));
      },

      addTideWindow: (window) => {
        const now = dayjs().toISOString();
        const newWindow: TideWindow = {
          ...window,
          id: `guide-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          tideWindows: [...state.tideWindows, newWindow],
        }));
      },

      updateTideWindow: (id, updates) => {
        set((state) => ({
          tideWindows: state.tideWindows.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: dayjs().toISOString() } : w
          ),
        }));
      },

      deleteTideWindow: (id) => {
        set((state) => ({
          tideWindows: state.tideWindows.filter((w) => w.id !== id),
        }));
      },

      recalculateTideData: () => {
        const { currentBeachId, beaches, selectedDate, collectionZones } = get();
        const beach = beaches.find((b) => b.id === currentBeachId);
        if (!beach) return;

        const date = dayjs(selectedDate).toDate();
        const tideData = calculateDailyTideData(
          beach.harmonicParams,
          date,
          beach.referenceLevel
        );

        const beachZones = collectionZones.filter((z) => z.beachId === currentBeachId);
        const windowPlan = calculateGatheringWindow(tideData, beachZones);

        set({ tideData, windowPlan });
        get().recalculateRisk(1000);
      },

      recalculateRisk: (distance) => {
        const { tideData, currentBeachId, beaches, collectionZones } = get();
        const beach = beaches.find((b) => b.id === currentBeachId);
        if (!beach || !tideData) return;

        const beachZones = collectionZones.filter((z) => z.beachId === currentBeachId);
        const risk = calculateInundationRisk(
          tideData,
          beach.terrainSlope,
          distance,
          beachZones[0]?.walkingSpeed || 60
        );
        const alerts = generateAlerts(tideData, beachZones, risk);

        set({ inundationRisk: risk, alerts });
      },

      addHarvestItem: (journalId, item) => {
        const newItem: HarvestItem = {
          ...item,
          id: `harvest-${Date.now()}`,
        };
        set((state) => ({
          journalEntries: state.journalEntries.map((j) => {
            if (j.id === journalId) {
              const newItems = [...j.harvestItems, newItem];
              const totalWeight = newItems.reduce((sum, i) => sum + i.weight, 0);
              return { ...j, harvestItems: newItems, totalWeight: Math.round(totalWeight * 10) / 10 };
            }
            return j;
          }),
        }));
      },

      updateHarvestItem: (journalId, itemId, updates) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((j) => {
            if (j.id === journalId) {
              const newItems = j.harvestItems.map((i) =>
                i.id === itemId ? { ...i, ...updates } : i
              );
              const totalWeight = newItems.reduce((sum, i) => sum + i.weight, 0);
              return { ...j, harvestItems: newItems, totalWeight: Math.round(totalWeight * 10) / 10 };
            }
            return j;
          }),
        }));
      },

      deleteHarvestItem: (journalId, itemId) => {
        set((state) => ({
          journalEntries: state.journalEntries.map((j) => {
            if (j.id === journalId) {
              const newItems = j.harvestItems.filter((i) => i.id !== itemId);
              const totalWeight = newItems.reduce((sum, i) => sum + i.weight, 0);
              return { ...j, harvestItems: newItems, totalWeight: Math.round(totalWeight * 10) / 10 };
            }
            return j;
          }),
        }));
      },
    }),
    {
      name: 'tide-gather-app-storage',
      partialize: (state) => ({
        currentBeachId: state.currentBeachId,
        beaches: state.beaches,
        collectionZones: state.collectionZones,
        dangerZones: state.dangerZones,
        tideWindows: state.tideWindows,
        journalEntries: state.journalEntries,
        selectedDate: state.selectedDate,
      }),
    }
  )
);
