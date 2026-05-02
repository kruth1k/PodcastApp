'use client';

import { useState, useEffect } from 'react';
import { api, Episode } from '@/lib/api';
import EpisodeCard from './EpisodeCard';

const EPISODES_PER_PAGE = 20;

function getInitialSortOrder(): 'newest' | 'oldest' {
  if (typeof window === 'undefined') return 'newest';
  const saved = localStorage.getItem('episode_sort_order');
  return saved === 'oldest' ? 'oldest' : 'newest';
}

interface EpisodeListProps {
  podcastId: string;
}

export default function EpisodeList({ podcastId }: EpisodeListProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>(getInitialSortOrder);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const count = await api.getEpisodesCount(podcastId);
        setTotalEpisodes(count);
        const offset = (currentPage - 1) * EPISODES_PER_PAGE;
        const { episodes: data } = await api.getEpisodes(podcastId, offset, EPISODES_PER_PAGE);
        setEpisodes(data);
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [podcastId, currentPage]);

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('episode_sort_order', order);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading episodes...</div>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No episodes found</p>
      </div>
    );
  }

  const sortedEpisodes = [...episodes].sort((a, b) => {
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(totalEpisodes / EPISODES_PER_PAGE);

  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">{totalEpisodes} episodes</span>
        <div className="flex gap-1">
          <button
            onClick={() => handleSortChange('newest')}
            className={`px-3 py-1 text-xs rounded ${
              sortOrder === 'newest'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => handleSortChange('oldest')}
            className={`px-3 py-1 text-xs rounded ${
              sortOrder === 'oldest'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Oldest
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {sortedEpisodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap justify-center items-center gap-1 pt-4 border-t">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 py-1 text-xs rounded ${
                page === currentPage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}