import React, { useState, useMemo } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ACTIVITY_TYPES } from '../utils/emissions';
import { Trash2 } from 'lucide-react';

export function History() {
  const { activities, removeActivity, loading } = useCarbon();
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // Type filter
      if (typeFilter !== 'All' && act.type !== typeFilter) return false;

      // Date filter
      if (dateFilter !== 'All') {
        const today = new Date();
        const actDate = new Date(act.date + 'T12:00:00'); // Ensure local date matching
        
        if (dateFilter === 'Today') {
          if (!isWithinInterval(actDate, { start: startOfDay(today), end: endOfDay(today) })) return false;
        } else if (dateFilter === 'This week') {
          const monday = startOfWeek(today, { weekStartsOn: 1 });
          const sunday = endOfWeek(today, { weekStartsOn: 1 });
          if (!isWithinInterval(actDate, { start: monday, end: sunday })) return false;
        }
      }
      return true;
    });
  }, [activities, typeFilter, dateFilter]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading history...</div>;

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Activity History</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
          >
            <option value="All">All Activities</option>
            {ACTIVITY_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          
          <select 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="This week">This Week</option>
          </select>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {filteredActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Activity</th>
                  <th className="py-3 px-4 font-medium">Quantity</th>
                  <th className="py-3 px-4 font-medium text-right">CO₂ (kg)</th>
                  <th className="py-3 px-4 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActivities.map(act => (
                  <tr key={act.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                      {format(new Date(act.date + 'T12:00:00'), 'd MMM yyyy')}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {act.type}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {act.quantity} {act.unit}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-primary">
                      {act.co2_kg.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => removeActivity(act.id)}
                        className="text-gray-400 hover:text-danger transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Delete activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h4 className="text-gray-900 font-medium mb-1">No activities found.</h4>
            <p className="text-sm text-gray-500">
              {activities.length === 0 
                ? "Your logged activities will appear here." 
                : "No activities match your current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
