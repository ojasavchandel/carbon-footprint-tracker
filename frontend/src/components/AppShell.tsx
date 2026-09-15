import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Leaf, Plus, Target } from 'lucide-react';
import { ActivityModal } from './ActivityModal';
import { useCarbon } from '../context/CarbonContext';
import { getCurrentWeekActivities } from '../utils/week';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const { activities, settings } = useCarbon();

  const weekActivities = getCurrentWeekActivities(activities);
  const weeklyCo2 = weekActivities.reduce((sum, act) => sum + act.co2_kg, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <Leaf className="w-6 h-6" />
              <span>CarbonTrack</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <NavLink 
                to="/dashboard"
                className={({ isActive }) => cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                Overview
              </NavLink>
              <NavLink 
                to="/history"
                className={({ isActive }) => cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                History
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <Target className="w-4 h-4 text-secondary" />
              <span>{weeklyCo2.toFixed(1)} / {settings?.weekly_target_kg || 50} kg CO₂</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Log activity</span>
              <span className="sm:hidden">Log</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Nav */}
        <div className="md:hidden flex px-4 pb-2 gap-2">
          <NavLink 
            to="/dashboard"
            className={({ isActive }) => cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            Overview
          </NavLink>
          <NavLink 
            to="/history"
            className={({ isActive }) => cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            History
          </NavLink>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>

      <ActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
