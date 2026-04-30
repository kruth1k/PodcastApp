'use client';

interface SearchResult {
  id: string;
  title: string;
  podcastTitle: string;
  episodeId?: string;
  podcastId: string;
  type: 'podcast' | 'episode' | 'discovery';
  feedUrl?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (podcastId: string, episodeId?: string, feedUrl?: string) => void;
  isOpen: boolean;
}

export default function SearchResults({ results, onSelect, isOpen }: SearchResultsProps) {
  if (!isOpen || results.length === 0) return null;

  const getTypeLabel = (type: string) => {
    if (type === 'podcast') return { label: 'Library', class: 'bg-blue-100 text-blue-700' };
    if (type === 'episode') return { label: 'Episode', class: 'bg-green-100 text-green-700' };
    return { label: 'Discover', class: 'bg-purple-100 text-purple-700' };
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
      {results.map((result) => {
        const typeInfo = getTypeLabel(result.type);
        return (
          <button
            key={`${result.type}-${result.id}`}
            onClick={() => onSelect(result.podcastId, result.episodeId, result.feedUrl)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${typeInfo.class}`}>
                {typeInfo.label}
              </span>
              <span className="font-medium text-gray-900">{result.title}</span>
            </div>
            <div className="text-sm text-gray-500">{result.podcastTitle}</div>
          </button>
        );
      })}
    </div>
  );
}