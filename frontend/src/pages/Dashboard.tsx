import React, { useState, useMemo } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { getCategory } from '../utils/emissions';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Edit2, ArrowRight, Sun, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth, 
  subYears, startOfYear, endOfYear, isWithinInterval, format, eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, parseISO 
} from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  Transport: '#C19F90',
  Electricity: '#675478',
  Food: '#AC7C88',
  Other: '#7C9B8E'
};

type Timeframe = 'This Week' | 'Last Month' | 'Last Year' | 'Custom';

export function Dashboard() {
  const { activities, settings, updateTarget, loading } = useCarbon();
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  
  const [timeframe, setTimeframe] = useState<Timeframe>('This Week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const target = settings?.weekly_target_kg || 50;

  // Filter activities and generate chart data buckets
  const { filteredActivities, chartData } = useMemo(() => {
    const today = new Date();
    let start: Date;
    let end: Date;
    let buckets: any[] = [];
    let getBucketKey: (d: Date) => string;

    if (timeframe === 'This Week') {
      start = startOfWeek(today, { weekStartsOn: 1 });
      end = endOfWeek(today, { weekStartsOn: 1 });
      buckets = eachDayOfInterval({ start, end }).map(d => ({
        name: format(d, 'EEE'),
        key: format(d, 'yyyy-MM-dd'),
        Transport: 0, Electricity: 0, Food: 0, Other: 0
      }));
      getBucketKey = (d) => format(d, 'yyyy-MM-dd');

    } else if (timeframe === 'Last Month') {
      const lastMonth = subMonths(today, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      buckets = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((d, i) => ({
        name: `Week ${i + 1}`,
        key: format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        Transport: 0, Electricity: 0, Food: 0, Other: 0
      }));
      getBucketKey = (d) => format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');

    } else if (timeframe === 'Last Year') {
      const lastYear = subYears(today, 1);
      start = startOfYear(lastYear);
      end = endOfYear(lastYear);
      buckets = eachMonthOfInterval({ start, end }).map(d => ({
        name: format(d, 'MMM'),
        key: format(d, 'yyyy-MM'),
        Transport: 0, Electricity: 0, Food: 0, Other: 0
      }));
      getBucketKey = (d) => format(d, 'yyyy-MM');

    } else { // Custom
      start = customStart ? parseISO(customStart) : startOfWeek(today, { weekStartsOn: 1 });
      end = customEnd ? parseISO(customEnd) : endOfWeek(today, { weekStartsOn: 1 });
      // To prevent massive arrays if they select 10 years, group by month if > 60 days
      const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      
      if (durationDays > 60) {
        buckets = eachMonthOfInterval({ start, end }).map(d => ({
          name: format(d, 'MMM yy'),
          key: format(d, 'yyyy-MM'),
          Transport: 0, Electricity: 0, Food: 0, Other: 0
        }));
        getBucketKey = (d) => format(d, 'yyyy-MM');
      } else {
        buckets = eachDayOfInterval({ start, end }).map(d => ({
          name: format(d, 'MMM d'),
          key: format(d, 'yyyy-MM-dd'),
          Transport: 0, Electricity: 0, Food: 0, Other: 0
        }));
        getBucketKey = (d) => format(d, 'yyyy-MM-dd');
      }
    }

    const filtered = activities.filter(act => {
      const actDate = new Date(act.date + 'T12:00:00');
      return isWithinInterval(actDate, { start, end });
    });

    filtered.forEach(act => {
      const actDate = new Date(act.date + 'T12:00:00');
      const key = getBucketKey(actDate);
      const bucket = buckets.find(b => b.key === key);
      if (bucket) {
        const cat = getCategory(act.type);
        if (cat in bucket) {
          bucket[cat as keyof typeof bucket] += act.co2_kg;
        } else {
          bucket.Other += act.co2_kg;
        }
      }
    });

    return { filteredActivities: filtered, chartData: buckets };
  }, [activities, timeframe, customStart, customEnd]);

  const totalCo2 = filteredActivities.reduce((sum, act) => sum + act.co2_kg, 0);

  // We only use target/progress logic explicitly for "This Week" because the target is weekly.
  // But for UI, let's keep showing the weekly target progress comparing the "current week" total.
  // The user prompt said: "Weekly target... The dashboard should show Current weekly footprint, Target, Remaining amount".
  // So the bottom card MUST always show the weekly progress, regardless of the chart filter above.
  const weekActivities = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    return activities.filter(act => isWithinInterval(new Date(act.date + 'T12:00:00'), { start, end }));
  }, [activities]);
  
  const weeklyCo2ForTarget = weekActivities.reduce((sum, act) => sum + act.co2_kg, 0);
  const progress = Math.min((weeklyCo2ForTarget / target) * 100, 100);
  const isExceeded = weeklyCo2ForTarget > target;

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

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading...</div>;

  const btnClass = (active: boolean) => `px-4 py-2 border transition text-xs uppercase tracking-wider ${active ? 'border-black bg-black/5 text-black' : 'border-[#DCD6CD] bg-transparent text-gray-500 hover:bg-[#E6E1D6]'}`;

  return (
    <div className="flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#DCD6CD] pb-6 gap-4">
        <h1 className="font-serif text-4xl text-[#1A1A1A]">Your footprint</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setTimeframe('Last Year')} className={btnClass(timeframe === 'Last Year')}>Last Year</button>
          <button onClick={() => setTimeframe('Last Month')} className={btnClass(timeframe === 'Last Month')}>Last Month</button>
          <button onClick={() => setTimeframe('This Week')} className={btnClass(timeframe === 'This Week')}>This Week</button>
          
          <div className="flex items-center gap-1 border-l border-[#DCD6CD] pl-2 ml-1">
            <button onClick={() => setTimeframe('Custom')} className={btnClass(timeframe === 'Custom')}>Custom</button>
            {timeframe === 'Custom' && (
              <div className="flex items-center gap-1 ml-2">
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="text-xs p-1.5 border border-[#DCD6CD] bg-transparent outline-none" />
                <span className="text-gray-400">-</span>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="text-xs p-1.5 border border-[#DCD6CD] bg-transparent outline-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Chart Section */}
      <div className="relative pt-6 pb-12 border-b border-[#DCD6CD]">
        
        <div className="absolute top-6 left-0 z-10 flex flex-col items-start border-l border-black pl-4">
          <span className="text-xs font-semibold uppercase tracking-wider mb-2">Summary</span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-6xl text-black">{totalCo2.toFixed(1)}</span>
            <span className="text-sm text-gray-500">kg CO₂ eq</span>
          </div>
          <span className="text-xs text-gray-400 mt-1">Total emissions for selected period</span>
        </div>

        <div className="absolute top-10 right-[5%] md:right-[15%] z-10 flex gap-6 md:gap-12 text-center text-xs">
          <div>
            <div className="font-serif font-bold text-lg text-black">{categoryTotals.Electricity.toFixed(0)}</div>
            <div className="text-gray-500">Electricity</div>
          </div>
          <div>
            <div className="font-serif font-bold text-lg text-black">{categoryTotals.Food.toFixed(0)}</div>
            <div className="text-gray-500">Food</div>
          </div>
          <div>
            <div className="font-serif font-bold text-lg text-black">{categoryTotals.Transport.toFixed(0)}</div>
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
        
        {/* Weekly Target Progress - ALWAYS THIS WEEK */}
        <div className="border-r border-[#DCD6CD] pr-10 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Sun className="w-6 h-6 text-black" />
            <h2 className="font-serif text-2xl">Current Weekly Target</h2>
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
                  <span className="text-3xl font-serif text-black">{weeklyCo2ForTarget.toFixed(1)}</span>
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
                  <p className="text-sm text-gray-500 font-medium">You are on track this week. Keep it up!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-black" />
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
