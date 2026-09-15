import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sun, Target, Bell } from 'lucide-react';
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
    <div className="min-h-screen flex text-sm">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#DCD6CD] flex flex-col justify-between fixed h-screen top-0 left-0 bg-[#F2EFE9] z-40">
        <div>
          <div className="p-8">
            <Sun className="w-8 h-8 text-black stroke-[1.5]" />
          </div>
          
          <nav className="flex flex-col mt-4">
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => cn(
                "px-8 py-3 transition-colors",
                isActive ? "bg-[#E6E1D6] font-medium" : "text-gray-600 hover:bg-[#EAE5DA]"
              )}
            >
              Your Footprint
            </NavLink>
            <NavLink 
              to="/history"
              className={({ isActive }) => cn(
                "px-8 py-3 transition-colors",
                isActive ? "bg-[#E6E1D6] font-medium" : "text-gray-600 hover:bg-[#EAE5DA]"
              )}
            >
              Activity History
            </NavLink>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 mx-8 px-4 py-2 bg-black text-white rounded font-medium text-center hover:bg-black/90 transition-colors"
            >
              + Log Activity
            </button>
          </nav>
        </div>

        <div className="p-8 flex items-center gap-3 border-t border-[#DCD6CD]/50">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-serif font-bold">
            O
          </div>
          <span className="font-medium text-gray-900">Ojasav Chandel</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Top subtle header just for mobile/extra info if needed, but the design shows a clean top */}
        <div className="max-w-[1200px] p-10 xl:p-16">
          {children}
        </div>
      </main>

      <ActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
