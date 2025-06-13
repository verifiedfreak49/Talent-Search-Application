'use client'
import { useState } from 'react';
// import FilterPanel from '../components/FilterPanel';

type FilterType = 'job-title' | 'company' | 'location';

export default function FiltersPage() {
  const [filterType, setFilterType] = useState<FilterType>('job-title');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{ include: any[]; exclude: any[] }>({
    include: [],
    exclude: [],
  });
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    setError('');
    setSuggestions([]);
    if (!query) return;
    try {
      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterType, query }),
      });
      const data = await res.json();
      console.log('API response:', data);
      if (data.error) {
        setError(data.error);
      } else {
        // The key may differ depending on the API response structure
        setSuggestions(data.data || []);
      }
    } catch (err) {
      setError('Failed to fetch suggestions.');
    }
  };

  const addFilter = (suggestion: any, mode: 'include' | 'exclude') => {
    setSelectedFilters((prev) => ({
      ...prev,
      [mode]: [...prev[mode], {suggestion, category: filterType},],
    }));
    setSuggestions([]);
    setQuery('');
  };

  const removeFilter = (id: string, mode: 'include' | 'exclude') => {
    setSelectedFilters((prev) => ({
      ...prev,
      [mode]: prev[mode].filter((f) => f.id !== id),
    }));
  };

  return (
    

    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8">
      <div className="flex justify-center items-start min-h-screen">
        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Add Candidates from LinkedIn</h1>
            <button className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg shadow hover:bg-white/20 transition cursor-pointer">
              Done
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as FilterType)}
                className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="job-title">Job Title</option>
                <option value="company">Company</option>
                <option value="location">Location</option>
              </select>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchSuggestions()}
                placeholder="Type to search filters..."
                className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1"
              />
              <button
                onClick={fetchSuggestions}
                className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                Search
              </button>
            </div>

            {error && <div className="text-red-400 mb-4 text-sm">{error}</div>}

            {suggestions.length > 0 && (
              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-4">
                <h3 className="text-white font-semibold mb-3">Suggestions:</h3>
                {suggestions.map((s, idx) => (
                  <div key={s.id || idx} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg">
                    <span className="text-white">{s.displayValue}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addFilter(s, 'include')}
                        className="bg-green-600/80 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        Include
                      </button>
                      <button
                        onClick={() => addFilter(s, 'exclude')}
                        className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        Exclude
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            {/* <pre className="text-xs text-gray-400">{JSON.stringify(selectedFilters, null, 2)}</pre> */}

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-3">Current Title</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFilters.include
                  .filter(f => f.category === 'job-title')
                  .map((f, idx) => (
                    <span
                      key={f.id || idx}
                      className="inline-flex items-center bg-green-700/30 border border-green-400/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow"
                    >
                      {f.suggestion?.displayValue || f.suggestion?.label || f.suggestion?.name || f.suggestion?.headline || f.suggestion?.headlineV2?.text || "Unnamed"}



                      <button
                        onClick={() => removeFilter(f.id, 'include')}
                        className="ml-2 text-green-200 hover:text-white font-bold cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                {selectedFilters.exclude
                  .filter(f => f.category === 'job-title')
                  .map((f, idx) => (
                    <span
                      key={f.id || idx}
                      className="inline-flex items-center bg-red-700/30 border border-red-400/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow"
                    >
                      {f.suggestion?.displayValue || f.suggestion?.label || f.suggestion?.name || f.suggestion?.headline || f.suggestion?.headlineV2?.text || "Unnamed"}



                      <button
                        onClick={() => removeFilter(f.id, 'exclude')}
                        className="ml-2 text-red-200 hover:text-white font-bold cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Company</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFilters.include
                  .filter(f => f.category === 'company')
                  .map((f, idx) => (
                    <span
                      key={f.id || idx}
                      className="inline-flex items-center bg-green-700/30 border border-green-400/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow"
                    >
                      {f.suggestion?.displayValue || f.suggestion?.label || f.suggestion?.name || f.suggestion?.headline || f.suggestion?.headlineV2?.text || "Unnamed"}



                      <button
                        onClick={() => removeFilter(f.id, 'include')}
                        className="ml-2 text-green-200 hover:text-white font-bold cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                {selectedFilters.exclude
                  .filter(f => f.category === 'company')
                  .map((f, idx) => (
                    <span
                      key={f.id || idx}
                      className="inline-flex items-center bg-red-700/30 border border-red-400/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow"
                    >
                      {f.suggestion?.displayValue || f.suggestion?.label || f.suggestion?.name || f.suggestion?.headline || f.suggestion?.headlineV2?.text || "Unnamed"}



                      <button
                        onClick={() => removeFilter(f.id, 'exclude')}
                        className="ml-2 text-red-200 hover:text-white font-bold cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Location</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFilters.include
                  .filter(f => f.category === 'location')
                  .map((f, idx) => (
                    <span
                      key={f.id || idx}
                      className="inline-flex items-center bg-green-700/30 border border-green-400/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow"
                    >
                      {f.suggestion?.displayValue || f.suggestion?.label || f.suggestion?.name || f.suggestion?.headline || f.suggestion?.headlineV2?.text || "Unnamed"}



                      <button
                        onClick={() => removeFilter(f.id, 'include')}
                        className="ml-2 text-green-200 hover:text-white font-bold cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                {selectedFilters.exclude
                  .filter(f => f.category === 'location')
                  .map((f, idx) => (
                    <span
                      key={f.id || idx}
                      className="inline-flex items-center bg-red-700/30 border border-red-400/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow"
                    >
                      {f.suggestion?.displayValue || f.suggestion?.label || f.suggestion?.name || f.suggestion?.headline || f.suggestion?.headlineV2?.text || "Unnamed"}



                      <button
                        onClick={() => removeFilter(f.id, 'exclude')}
                        className="ml-2 text-red-200 hover:text-white font-bold cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-lg shadow hover:bg-white/20 transition cursor-pointer">
              Reset
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold px-8 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
