import { useState, useMemo } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { format, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { ACTIVITY_TYPES } from '../utils/emissions';
import { Trash2 } from 'lucide-react';

export function History() {
  const { activities, removeActivity, loading } = useCarbon();
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      if (typeFilter !== 'All' && act.type !== typeFilter) return false;
      if (dateFilter !== 'All') {
        const today = new Date();
        const actDate = new Date(act.date + 'T12:00:00');
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
    <div className="flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DCD6CD] pb-6">
        <h1 className="font-serif text-4xl text-[#1A1A1A]">Activity History</h1>
        <div className="flex gap-4">
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border-b border-black bg-transparent text-sm uppercase tracking-wider text-black outline-none pb-1"
          >
            <option value="All">All Activities</option>
            {ACTIVITY_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          
          <select 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border-b border-black bg-transparent text-sm uppercase tracking-wider text-black outline-none pb-1"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="This week">This Week</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredActivities.length > 0 ? (
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-[#DCD6CD] text-xs uppercase tracking-wider text-gray-500">
                <th className="py-4 px-4 font-semibold">Date</th>
                <th className="py-4 px-4 font-semibold">Activity</th>
                <th className="py-4 px-4 font-semibold">Quantity</th>
                <th className="py-4 px-4 font-semibold text-right">CO₂ (kg)</th>
                <th className="py-4 px-4 font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD6CD]/50">
              {filteredActivities.map(act => (
                <tr key={act.id} className="text-sm hover:bg-[#EAE5DA] transition-colors">
                  <td className="py-5 px-4 text-gray-600 whitespace-nowrap">
                    {format(new Date(act.date + 'T12:00:00'), 'd MMM yyyy')}
                  </td>
                  <td className="py-5 px-4 font-medium text-gray-900">
                    {act.type}
                  </td>
                  <td className="py-5 px-4 text-gray-600">
                    {act.quantity} {act.unit}
                  </td>
                  <td className="py-5 px-4 text-right font-serif text-lg text-black">
                    {act.co2_kg.toFixed(2)}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button 
                      onClick={() => removeActivity(act.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h4 className="text-gray-900 font-serif text-2xl mb-2">No activities found</h4>
            <p className="text-sm text-gray-500">
              {activities.length === 0 
                ? "Your logged activities will appear here once recorded." 
                : "No activities match your current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
