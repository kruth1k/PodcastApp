'use client';

import { useState, useEffect } from 'react';
import { useStatsStore, TimePeriod, TimeGroup, WeeklyStats, MonthlyStats, YearlyStats } from '@/stores/statsStore';
import { usePodcastStore } from '@/stores/podcastStore';
import { useAuthStore } from '@/stores/authStore';
import StatsChart from '@/components/StatsChart';
import StatsCalendar from '@/components/StatsCalendar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
];

export default function StatsPage() {
  const [period, setPeriod] = useState<TimePeriod>('all');
  const [viewMode, setViewMode] = useState<'chart' | 'calendar'>('chart');
  const [timeGroup, setTimeGroup] = useState<TimeGroup>('week');
  
  const getTotalListeningTime = useStatsStore((state) => state.getTotalListeningTime);
  const getPodcastStats = useStatsStore((state) => state.getPodcastStats);
  const getEpisodeStats = useStatsStore((state) => state.getEpisodeStats);
  const getWeeklyStats = useStatsStore((state) => state.getWeeklyStats);
  const getMonthlyStats = useStatsStore((state) => state.getMonthlyStats);
  const getYearlyStats = useStatsStore((state) => state.getYearlyStats);
  const dailyStats = useStatsStore((state) => state.dailyStats);
  const aggregateDailyStats = useStatsStore((state) => state.aggregateDailyStats);
  const events = useStatsStore((state) => state.events);
  const podcasts = usePodcastStore((state) => state.podcasts);
  const fetchPodcasts = usePodcastStore((state) => state.fetchPodcasts);
  const [allEpisodes, setAllEpisodes] = useState<Record<string, { id: string; title: string }>>({});

  useEffect(() => {
    const loadData = async () => {
      await fetchPodcasts();
      aggregateDailyStats();
      
      // Fetch full podcast data with episodes
      const podcastList = usePodcastStore.getState().podcasts;
      const episodeMap: Record<string, { id: string; title: string }> = {};
      
      for (const podcast of podcastList) {
        try {
          const res = await fetch(`${API_URL}/api/podcasts/${podcast.id}`);
          if (res.status === 401 || res.status === 403) {
            const { logout } = useAuthStore.getState();
            logout();
            return;
          }
          const fullPodcast = await res.json();
          for (const ep of fullPodcast.episodes || []) {
            episodeMap[ep.id] = { id: ep.id, title: ep.title };
          }
        } catch (e) {
          console.error('Failed to fetch podcast', podcast.id);
        }
      }
      setAllEpisodes(episodeMap);
    };
    
    loadData();
  }, []);

  const totalTime = getTotalListeningTime(period);
  const podcastStats = getPodcastStats(period);
  const episodeStats = getEpisodeStats(period);
  const weeklyStats = getWeeklyStats(12);
  const monthlyStats = getMonthlyStats(12);
  const yearlyStats = getYearlyStats(5);

  const getPodcastTitle = (id: string) => {
    const podcast = podcasts.find((p) => p.id === id);
    return podcast?.title || id.slice(0, 8) + '...';
  };

const getEpisodeTitle = (episodeId: string) => {
  const ep = allEpisodes[episodeId];
  if (ep) return ep.title;
  return episodeId.slice(0, 8) + '...';
};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        
        <div className="flex gap-2">
          {TIME_PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('chart')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'chart'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Chart
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Calendar
        </button>
      </div>

      {/* Group by */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeGroup('week')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeGroup === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeGroup('month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeGroup === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setTimeGroup('year')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeGroup === 'year'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Year
        </button>
      </div>

      {/* Time-grouped view */}
      {viewMode === 'chart' ? (
        <StatsChart
          weeklyData={weeklyStats}
          monthlyData={monthlyStats}
          yearlyData={yearlyStats}
          dailyData={dailyStats}
          groupBy={timeGroup}
        />
      ) : (
        <StatsCalendar groupBy={timeGroup} />
      )}

      {totalTime === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No listening data yet.</p>
          <p className="text-gray-400 text-sm mt-2">Play some episodes to see your statistics!</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Listening Time</h2>
            <p className="text-4xl font-bold text-blue-600">{formatTime(totalTime)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Podcasts</h2>
            <div className="space-y-3">
              {podcastStats.slice(0, 10).map((stat, index) => (
                <div key={stat.podcast_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-300 w-8">{index + 1}</span>
                    <span className="font-medium text-gray-900">{getPodcastTitle(stat.podcast_id)}</span>
                  </div>
                  <span className="text-gray-600">{formatTime(stat.total_seconds)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Episodes</h2>
            <div className="space-y-3">
              {episodeStats.slice(0, 10).map((stat, index) => (
                <div key={stat.episode_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-300 w-8">{index + 1}</span>
                    <span className="font-medium text-gray-900">{getEpisodeTitle(stat.episode_id)}</span>
                  </div>
                  <span className="text-gray-600">{formatTime(stat.total_seconds)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}