import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { getCurrentWeekActivities } from '../utils/week';
import { getCategory } from '../utils/emissions';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Edit2, TrendingDown, TrendingUp, AlertCircle, ArrowRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS: Record<string, string> = {
  Transport: '#1F4529',
  Electricity: '#D97706',
  Food: '#90A994',
  Other: '#9CA3AF'
};

export function Dashboard() {
  const { activities, settings, updateTarget, loading } = useCarbon();
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;

  const weekActivities = getCurrentWeekActivities(activities);
  const weeklyCo2 = weekActivities.reduce((sum, act) => sum + act.co2_kg, 0);
  const target = settings?.weekly_target_kg || 50;
  
  const progress = Math.min((weeklyCo2 / target) * 100, 100);
  const isExceeded = weeklyCo2 > target;
  const isAtTarget = weeklyCo2 === target;
  
  const remaining = Math.max(target - weeklyCo2, 0);

  // Category breakdown for chart (all time or week? "Show the footprint broken down by category... Make sure the chart uses REAL calculated data")
  // Let's do breakdown of ALL time or just week? The mockup says "YOUR FOOTPRINT 42.8 kg CO2 This week". Let's focus the dashboard on the current week for relevance, or give total?
  // "The dashboard must prominently show: Total footprint e.g. 42.8 kg... Also show useful contextual info such as 'Your footprint this week'".
  // So I'll show WEEK footprint prominently.
  
  const totalCo2AllTime = activities.reduce((sum, act) => sum + act.co2_kg, 0);

  // Group by category for the current week
  const categoryData = weekActivities.reduce((acc, act) => {
    const cat = getCategory(act.type);
    acc[cat] = (acc[cat] || 0) + act.co2_kg;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0) {
      await updateTarget(val);
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Top section: Footprint and Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Total Footprint Card */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Your Footprint</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{weeklyCo2.toFixed(1)}</span>
              <span className="text-lg text-gray-500 font-medium">kg CO₂</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">This week • Mon–Sun</p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
            <span>Total recorded all-time:</span>
            <span className="font-medium text-gray-900">{totalCo2AllTime.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Weekly Target Card */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Weekly Target</h3>
            {isEditingTarget ? (
              <button onClick={() => setIsEditingTarget(false)} className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
            ) : (
              <button onClick={() => { setTargetInput(target.toString()); setIsEditingTarget(true); }} className="text-gray-400 hover:text-gray-700 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditingTarget ? (
            <form onSubmit={handleTargetSubmit} className="flex gap-2">
              <input 
                type="number" 
                step="any"
                min="1"
                required
                value={targetInput}
                onChange={e => setTargetInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button type="submit" className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium">Save</button>
            </form>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-gray-900">{weeklyCo2.toFixed(1)}</span>
                <span className="text-gray-400 font-medium">/ {target} kg CO₂</span>
              </div>
              
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${isExceeded ? 'bg-danger' : 'bg-primary'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-start gap-2 mt-2">
                {isExceeded ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-danger block">Weekly target exceeded</span>
                      <span className="text-xs text-gray-500 block mt-0.5">Small choices can still make a difference. See which categories contributed most below.</span>
                    </div>
                  </>
                ) : isAtTarget ? (
                  <span className="text-sm text-gray-600 font-medium">You're at your weekly target.</span>
                ) : (
                  <span className="text-sm text-gray-600 font-medium">{remaining.toFixed(1)} kg remaining this week</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle section: Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">Breakdown (This Week)</h3>
          
          {chartData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="w-48 h-48 flex-shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)} kg`, 'CO₂']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other }} />
                      <span className="font-medium text-gray-700">{entry.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{entry.value.toFixed(1)} kg</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-gray-900 font-medium mb-1">Your footprint starts here.</h4>
              <p className="text-sm text-gray-500">Log an activity to see your carbon impact.</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Activity</h3>
            <Link to="/history" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {activities.slice(0, 4).map(act => (
              <div key={act.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{act.type}</div>
                  <div className="text-xs text-gray-500">{act.quantity} {act.unit}</div>
                </div>
                <div className="font-semibold text-primary text-sm">
                  {act.co2_kg.toFixed(1)} kg
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">
                No activities recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
