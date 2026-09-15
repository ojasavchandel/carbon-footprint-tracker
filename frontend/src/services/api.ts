import type { Activity, Settings } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://carbon-footprint-tracker-0fmy.onrender.com/api';

export const api = {
  getActivities: async (): Promise<Activity[]> => {
    const res = await fetch(`${API_BASE}/activities`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },

  createActivity: async (data: { type: string; quantity: number; date: string }): Promise<Activity> => {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create activity');
    return res.json();
  },

  deleteActivity: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete activity');
  },

  getSettings: async (): Promise<Settings> => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  updateWeeklyTarget: async (target: number): Promise<Settings> => {
    const res = await fetch(`${API_BASE}/settings/weekly-target`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekly_target_kg: target }),
    });
    if (!res.ok) throw new Error('Failed to update target');
    return res.json();
  }
};
