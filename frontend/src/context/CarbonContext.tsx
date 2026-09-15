import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Activity, Settings } from '../types';
import { api } from '../services/api';

interface CarbonContextType {
  activities: Activity[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  addActivity: (data: { type: string; quantity: number; date: string }) => Promise<void>;
  removeActivity: (id: number) => Promise<void>;
  updateTarget: (target: number) => Promise<void>;
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined);

export function CarbonProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [act, set] = await Promise.all([
        api.getActivities(),
        api.getSettings(),
      ]);
      setActivities(act);
      setSettings(set);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refreshActivities = async () => {
    const act = await api.getActivities();
    setActivities(act);
  };

  const refreshSettings = async () => {
    const set = await api.getSettings();
    setSettings(set);
  };

  const addActivity = async (data: { type: string; quantity: number; date: string }) => {
    await api.createActivity(data);
    await refreshActivities();
  };

  const removeActivity = async (id: number) => {
    await api.deleteActivity(id);
    await refreshActivities();
  };

  const updateTarget = async (target: number) => {
    await api.updateWeeklyTarget(target);
    await refreshSettings();
  };

  return (
    <CarbonContext.Provider
      value={{
        activities,
        settings,
        loading,
        error,
        refreshActivities,
        refreshSettings,
        addActivity,
        removeActivity,
        updateTarget,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
}

export function useCarbon() {
  const context = useContext(CarbonContext);
  if (context === undefined) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
}
