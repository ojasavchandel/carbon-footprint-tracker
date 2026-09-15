import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import type { Activity } from '../types';

export function getCurrentWeekActivities(activities: Activity[]): Activity[] {
  const today = new Date();
  
  // Week starts on Monday (1)
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const sunday = endOfWeek(today, { weekStartsOn: 1 });

  return activities.filter((activity) => {
    // Activity date is YYYY-MM-DD
    // parseISO handles it, but just in case, we append time to parse correctly in local timezone
    const activityDate = new Date(activity.date + 'T12:00:00');
    return isWithinInterval(activityDate, { start: monday, end: sunday });
  });
}
