import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { getCurrentWeekActivities } from '../utils/week';
import { getCategory } from '../utils/emissions';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Edit2, ArrowRight, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS: Record<string, string> = {
  Transport: '#C19F90',
  Electricity: '#675478',
  Food: '#AC7C88',
  Other: '#7C9B8E'
};

export function Dashboard() {
  const { activities, settings, updateTarget, loading } = useCarbon();
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading...</div>;

  const weekActivities = getCurrentWeekActivities(activities);
  const weeklyCo2 = weekActivities.reduce((sum, act) => sum + act.co2_kg, 0);
  const target = settings?.weekly_target_kg || 50;
  
  const progress = Math.min((weeklyCo2 / target) * 100, 100);
  const isExceeded = weeklyCo2 > target;

  // Let's create an area chart data grouped by Day of the week.
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Initialize data array
  const chartData = days.map(day => ({
    name: day,
    Transport: 0,
    Electricity: 0,
    Food: 0,
    Other: 0
  }));

  // Populate data
  weekActivities.forEach(act => {
    // get day index
    const date = new Date(act.date + 'T12:00:00');
    // getDay() is 0 (Sun) to 6 (Sat). We want Monday=0
    const dayIndex = (date.getDay() + 6) % 7; 
    const cat = getCategory(act.type);
    if (chartData[dayIndex]) {
      chartData[dayIndex][cat as keyof typeof chartData[0]] += act.co2_kg;
    }
  });

  // Calculate totals by category for the labels on top
  const categoryTotals = {
    Transport: chartData.reduce((sum, d) => sum + d.Transport, 0),
    Electricity: chartData.reduce((sum, d) => sum + d.Electricity, 0),
    Food: chartData.reduce((sum, d) => sum + d.Food, 0),
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0) {
      await updateTarget(val);
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DCD6CD] pb-6">
        <h1 className="font-serif text-4xl text-[#1A1A1A]">Your footprint</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-[#DCD6CD] bg-transparent text-xs uppercase tracking-wider text-gray-500 hover:bg-[#E6E1D6] transition">Last Year</button>
          <button className="px-4 py-2 border border-[#DCD6CD] bg-transparent text-xs uppercase tracking-wider text-gray-500 hover:bg-[#E6E1D6] transition">Custom</button>
          <button className="px-4 py-2 border border-black bg-transparent text-xs uppercase tracking-wider text-black hover:bg-black/5 transition">This Week</button>
        </div>
      </div>

      {/* Hero Chart Section */}
      <div className="relative pt-6 pb-12 border-b border-[#DCD6CD]">
        
        <div className="absolute top-6 left-0 z-10 flex flex-col items-start border-l border-black pl-4">
          <span className="text-xs font-semibold uppercase tracking-wider mb-2">Summary</span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-6xl text-black">{weeklyCo2.toFixed(1)}</span>
            <span className="text-sm text-gray-500">kg CO₂ eq</span>
          </div>
          <span className="text-xs text-gray-400 mt-1">Total amount of emissions this week</span>
        </div>

        {/* Labels positioned above the chart conceptually */}
        <div className="absolute top-10 right-[15%] z-10 flex gap-12 text-center text-xs">
          <div>
            <div className="font-serif font-bold text-lg">{categoryTotals.Electricity.toFixed(0)}</div>
            <div className="text-gray-500">Electricity</div>
          </div>
          <div>
            <div className="font-serif font-bold text-lg">{categoryTotals.Food.toFixed(0)}</div>
            <div className="text-gray-500">Food</div>
          </div>
          <div>
            <div className="font-serif font-bold text-lg">{categoryTotals.Transport.toFixed(0)}</div>
            <div className="text-gray-500">Transport</div>
          </div>
        </div>

        <div className="h-[300px] w-full mt-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 50, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CATEGORY_COLORS.Transport} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CATEGORY_COLORS.Transport} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorElectricity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CATEGORY_COLORS.Electricity} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CATEGORY_COLORS.Electricity} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CATEGORY_COLORS.Food} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CATEGORY_COLORS.Food} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              
              <Area type="monotone" dataKey="Electricity" stroke={CATEGORY_COLORS.Electricity} fillOpacity={1} fill="url(#colorElectricity)" />
              <Area type="monotone" dataKey="Food" stroke={CATEGORY_COLORS.Food} fillOpacity={1} fill="url(#colorFood)" />
              <Area type="monotone" dataKey="Transport" stroke={CATEGORY_COLORS.Transport} fillOpacity={1} fill="url(#colorTransport)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Weekly Target Progress */}
        <div className="border-r border-[#DCD6CD] pr-10 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Sun className="w-6 h-6 text-black" />
            <h2 className="font-serif text-2xl">Weekly Target</h2>
          </div>
          
          <div className="flex-1">
            {isEditingTarget ? (
              <form onSubmit={handleTargetSubmit} className="flex gap-2 mb-6">
                <input 
                  type="number" 
                  step="any"
                  min="1"
                  required
                  value={targetInput}
                  onChange={e => setTargetInput(e.target.value)}
                  className="w-32 border-b border-black bg-transparent p-2 text-xl font-serif outline-none"
                  autoFocus
                />
                <button type="submit" className="px-4 py-2 bg-black text-white rounded text-sm font-medium">Save</button>
              </form>
            ) : (
              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-serif text-black">{weeklyCo2.toFixed(1)}</span>
                  <span className="text-gray-500">of {target} kg CO₂</span>
                  <button onClick={() => { setTargetInput(target.toString()); setIsEditingTarget(true); }} className="ml-2 text-gray-400 hover:text-black transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="h-1 w-full bg-[#DCD6CD] rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${isExceeded ? 'bg-red-500' : 'bg-black'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {isExceeded ? (
                  <p className="text-sm text-red-600 font-medium">Weekly target exceeded. Reflect on your biggest categories.</p>
                ) : (
                  <p className="text-sm text-gray-500 font-medium">You are on track. Keep it up!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity List mimicking the "Lower your emissions" column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sun className="w-6 h-6 text-black" />
              <h2 className="font-serif text-2xl">Recent Activities</h2>
            </div>
            <Link to="/history" className="text-xs uppercase tracking-wider text-gray-500 hover:text-black">
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {activities.slice(0, 3).map((act, idx) => (
              <div key={act.id} className="border border-[#DCD6CD] p-5 flex items-center justify-between bg-[#F2EFE9] hover:bg-white transition-colors cursor-default">
                <div className="flex items-center gap-6">
                  <span className="font-serif text-4xl text-[#DCD6CD]">0{idx + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{act.type}</h3>
                    <p className="text-sm text-gray-500">{act.quantity} {act.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-xl">{act.co2_kg.toFixed(1)} <span className="text-xs text-gray-500">kg</span></span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-sm text-gray-500 py-4">No activities logged yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
