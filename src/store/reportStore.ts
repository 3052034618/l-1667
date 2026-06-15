import { create } from 'zustand';
import api from '../lib/axios';
import type { ExportHistoryItem, ExportFormat, ReportGenerateOptions, ExportFilters } from '../types';

const STORAGE_KEY = 'topoflow_report_history';

interface ReportState {
  exportHistory: ExportHistoryItem[];
  selectedTaskIds: string[];
  generating: boolean;
  setSelectedTaskIds: (ids: string[]) => void;
  generatePDF: (taskIds: string[], options: ReportGenerateOptions) => Promise<string | null>;
  exportData: (taskIds: string[], fields: string[], format: ExportFormat, filters?: ExportFilters) => Promise<string | null>;
  loadHistory: () => void;
  saveHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  exportHistory: [],
  selectedTaskIds: [],
  generating: false,

  setSelectedTaskIds: (ids) => set({ selectedTaskIds: ids }),

  generatePDF: async (taskIds, options) => {
    set({ generating: true });
    try {
      const response = await api.post('/reports/generate', { taskIds, options });
      const result = response.data;

      if (result.success && result.data) {
        const newItem: ExportHistoryItem = {
          id: result.data.id,
          type: 'pdf',
          taskIds,
          createdAt: new Date().toISOString(),
          downloadUrl: result.data.downloadUrl,
          filename: result.data.filename,
          size: result.data.size,
        };
        set((state) => ({
          exportHistory: [newItem, ...state.exportHistory],
        }));
        get().saveHistory();
        return result.data.downloadUrl;
      }
      return null;
    } catch (error) {
      console.error('Generate PDF failed:', error);
      return null;
    } finally {
      set({ generating: false });
    }
  },

  exportData: async (taskIds, fields, format, filters) => {
    set({ generating: true });
    try {
      const response = await api.post('/reports/export', { taskIds, fields, format, filters });
      const result = response.data;

      if (result.success && result.data) {
        const newItem: ExportHistoryItem = {
          id: result.data.id,
          type: format,
          taskIds,
          createdAt: new Date().toISOString(),
          downloadUrl: result.data.downloadUrl,
          filename: result.data.filename,
          size: result.data.size,
        };
        set((state) => ({
          exportHistory: [newItem, ...state.exportHistory],
        }));
        get().saveHistory();
        return result.data.downloadUrl;
      }
      return null;
    } catch (error) {
      console.error('Export data failed:', error);
      return null;
    } finally {
      set({ generating: false });
    }
  },

  loadHistory: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          set({ exportHistory: parsed });
        }
      }
    } catch (error) {
      console.error('Load history failed:', error);
    }
  },

  saveHistory: () => {
    try {
      const { exportHistory } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exportHistory));
    } catch (error) {
      console.error('Save history failed:', error);
    }
  },

  deleteHistoryItem: (id) => {
    set((state) => ({
      exportHistory: state.exportHistory.filter((item) => item.id !== id),
    }));
    get().saveHistory();
  },
}));

const state = useReportStore.getState();
state.loadHistory();
