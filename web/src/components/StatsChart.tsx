'use client';

import { useState } from 'react';
import { WeeklyStats, MonthlyStats, YearlyStats, TimeGroup } from '@/stores/statsStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

interface StatsChartProps {
  weeklyData?: WeeklyStats[];
  monthlyData?: MonthlyStats[];
  yearlyData?: YearlyStats[];
  dailyData?: { date: string; total_seconds: number }[];
  groupBy: TimeGroup;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function getLabel(period: string, groupBy: TimeGroup): string {
  if (groupBy === 'week') {
    const date = new Date(period);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  if (groupBy === 'month') {
    const [, month] = period.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNum = parseInt(month, 10);
    return monthNames[monthNum - 1] || month;
  }
  return period;
}

function getMonthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function generatePeriods(groupBy: TimeGroup, baseDate: Date): string[] {
  const periods: string[] = [];
  
  if (groupBy === 'week') {
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      periods.push(d.toISOString().split('T')[0]);
    }
  } else if (groupBy === 'month') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      periods.push(getMonthStr(d));
    }
  } else {
    for (let i = 4; i >= 0; i--) {
      periods.push(String(baseDate.getFullYear() - i));
    }
  }
  return periods;
}

export default function StatsChart({ weeklyData, monthlyData, yearlyData, dailyData, groupBy }: StatsChartProps) {
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

  const getLabelText = () => {
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

  let rawData: { period: string; total_seconds: number }[] = [];

  if (groupBy === 'week' && dailyData) {
    rawData = dailyData.map((d: { date: string; total_seconds: number }) => ({ period: d.date, total_seconds: d.total_seconds }));
  } else if (groupBy === 'month' && monthlyData) {
    rawData = monthlyData.map((m) => ({ period: m.month, total_seconds: m.total_seconds }));
  } else if (groupBy === 'year' && yearlyData) {
    rawData = yearlyData.map((y) => ({ period: y.year, total_seconds: y.total_seconds }));
  }

  const dataMap = new Map(rawData.map(d => [d.period, d]));
  const allPeriods = generatePeriods(groupBy, navDate);
  const data = allPeriods.map(period => {
    const existing = dataMap.get(period);
    return existing || { period, total_seconds: 0 };
  });

  const chartData = data.map(item => ({
    name: getLabel(item.period, groupBy),
    minutes: Math.round(item.total_seconds / 60)
  }));

  if (data.every(d => d.total_seconds === 0)) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={goBack} className="p-2 hover:bg-gray-100 rounded">&lt;</button>
          <span className="font-medium">{getLabelText()}</span>
          <button type="button" onClick={goForward} className="p-2 hover:bg-gray-100 rounded">&gt;</button>
        </div>
        <p className="text-gray-500 text-center py-8">No data for this period</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded">&lt;</button>
        <span className="font-medium">{getLabelText()}</span>
        <button onClick={goForward} className="p-2 hover:bg-gray-100 rounded">&gt;</button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip 
              formatter={(value) => [formatTime(Number(value) || 0), 'Time']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Line 
              type="monotone" 
              dataKey="minutes" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Minutes"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}