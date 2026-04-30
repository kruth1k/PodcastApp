'use client';

import { useState, useMemo } from 'react';
import { useStatsStore, TimeGroup } from '@/stores/statsStore';

interface StatsCalendarProps {
  groupBy: TimeGroup;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function getIntensityLevel(seconds: number): number {
  if (seconds === 0) return 0;
  if (seconds < 1800) return 1;
  if (seconds < 3600) return 2;
  if (seconds < 7200) return 3;
  return 4;
}

const colorClasses = [
  'bg-gray-100',
  'bg-blue-200',
  'bg-blue-300',
  'bg-blue-400',
  'bg-blue-500',
];

function getMonthData(year: number, month: number) {
  const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ 
      day: daysInPrevMonth - i, 
      isCurrentMonth: false,
      dateStr: `${year}-${String(month - 1).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      day: i, 
      isCurrentMonth: true,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  while (days.length < 42) {
    const nextDay = days.length - firstDay - daysInMonth + 1;
    days.push({ 
      day: nextDay, 
      isCurrentMonth: false,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
    });
  }

  return days;
}

export default function StatsCalendar({ groupBy }: StatsCalendarProps) {
  const dailyStats = useStatsStore((state) => state.dailyStats);
  const [navDate, setNavDate] = useState(new Date());

  const goBack = () => {
    const newDate = new Date(navDate);
    if (groupBy === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (groupBy === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setFullYear(newDate.getFullYear() - 1);
    setNavDate(newDate);
  };

  const goForward = () => {
    const newDate = new Date(navDate);
    if (groupBy === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (groupBy === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setFullYear(newDate.getFullYear() + 1);
    setNavDate(newDate);
  };

  const getLabel = () => {
    if (groupBy === 'week') {
      const startOfWeek = new Date(navDate);
      startOfWeek.setDate(navDate.getDate() - navDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (groupBy === 'month') {
      return navDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return navDate.getFullYear().toString();
  };

  // Create a map of date -> seconds for quick lookup
  const dateStatsMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const stat of dailyStats) {
      map[stat.date] = (map[stat.date] || 0) + stat.total_seconds;
    }
    return map;
  }, [dailyStats]);

  // Yearly month stats - must be at top level
  const yearlyMonthStats = useMemo(() => {
    const currentYear = navDate.getFullYear();
    const stats: Record<number, number> = {};
    for (const stat of dailyStats) {
      if (stat.date.startsWith(currentYear.toString())) {
        const month = parseInt(stat.date.split('-')[1], 10);
        stats[month] = (stats[month] || 0) + stat.total_seconds;
      }
    }
    return stats;
  }, [dailyStats, navDate]);

  // Weekly view
  if (groupBy === 'week') {
    const startOfWeek = new Date(navDate);
    startOfWeek.setDate(navDate.getDate() - navDate.getDay());
    
    const dates: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push({ date, dateStr: date.toISOString().split('T')[0] });
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded">&lt;</button>
          <span className="font-medium">{getLabel()}</span>
          <button onClick={goForward} className="p-2 hover:bg-gray-100 rounded">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium p-2">
              {day}
            </div>
          ))}
          {dates.map(({ date, dateStr }, index) => {
            const seconds = dateStatsMap[dateStr] || 0;
            const level = getIntensityLevel(seconds);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className={`w-full aspect-square rounded-sm ${colorClasses[level]} hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all`}
                  title={`${formattedDate}: ${formatTime(seconds)}`}
                />
                <span className="text-xs text-gray-400">{date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Monthly view
  if (groupBy === 'month') {
    const currentYear = navDate.getFullYear();
    const currentMonth = navDate.getMonth() + 1;
    const monthData = getMonthData(currentYear, currentMonth);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded">&lt;</button>
          <span className="font-medium">{monthNames[currentMonth]} {currentYear}</span>
          <button onClick={goForward} className="p-2 hover:bg-gray-100 rounded">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium p-2">
              {day}
            </div>
          ))}
          {monthData.map(({ day, isCurrentMonth, dateStr }, index) => {
            const seconds = dateStatsMap[dateStr] || 0;
            const level = getIntensityLevel(seconds);
            
            return (
              <div
                key={index}
                className={`aspect-square rounded-sm ${isCurrentMonth ? colorClasses[level] : 'bg-gray-50'} hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all flex items-center justify-center text-xs ${isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}
                title={isCurrentMonth ? `${dateStr}: ${formatTime(seconds)}` : ''}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Yearly view
  const currentYear = navDate.getFullYear();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded">&lt;</button>
        <span className="font-medium">{currentYear}</span>
        <button onClick={goForward} className="p-2 hover:bg-gray-100 rounded">&gt;</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {monthNames.map((name, index) => {
          const monthNum = index + 1;
          const seconds = yearlyMonthStats[monthNum] || 0;
          const level = getIntensityLevel(seconds);
          
          return (
            <div
              key={index}
              className={`aspect-square rounded-sm ${colorClasses[level]} hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all flex items-center justify-center text-sm ${level > 0 ? 'text-white font-medium' : 'text-gray-500'}`}
              title={`${name}: ${formatTime(seconds)}`}
            >
              {name}
            </div>
          );
        })}
      </div>
    </div>
  );
}