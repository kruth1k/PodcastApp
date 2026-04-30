'use client';

interface SearchResult {
  id: string;
  title: string;
  podcastTitle: string;
  episodeId: string;
  podcastId: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (podcastId: string, episodeId: string) => void;
  isOpen: boolean;
}

export default function SearchResults({ results, onSelect, isOpen }: SearchResultsProps) {
  if (!isOpen || results.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onSelect(result.podcastId, result.episodeId)}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
        >
          <div className="font-medium text-gray-900">{result.title}</div>
          <div className="text-sm text-gray-500">{result.podcastTitle}</div>
        </button>
      ))}
    </div>
  );
}