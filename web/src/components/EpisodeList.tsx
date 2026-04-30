'use client';

import { useState } from 'react';
import { usePodcastStore } from '@/stores/podcastStore';
import EpisodeCard from './EpisodeCard';

const EPISODES_PER_PAGE = 20;

export default function EpisodeList() {
  const { episodes, isLoading } = usePodcastStore();
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
  const startIndex = (currentPage - 1) * EPISODES_PER_PAGE;
  const visibleEpisodes = episodes.slice(startIndex, startIndex + EPISODES_PER_PAGE);

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

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      <div className="space-y-3">
        {visibleEpisodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap justify-center items-center gap-1 pt-4 border-t">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
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
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          
          <button
            onClick={() => goToPage(totalPages)}
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