'use client';

import { useState } from 'react';
import { Episode } from '@/lib/api';

interface EpisodeCardProps {
  episode: Episode;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return '';
  }
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{episode.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {episode.published_at && (
              <span>{formatDate(episode.published_at)}</span>
            )}
            {episode.duration && (
              <span>{formatDuration(episode.duration)}</span>
            )}
          </div>
        </div>
      </div>
      
      {episode.description && (
        <div className="mt-2">
          <p className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
            {episode.description.replace(/<[^>]*>/g, '')}
          </p>
          {episode.description.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-500 hover:text-blue-600 mt-1"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}