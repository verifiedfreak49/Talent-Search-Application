'use client'
import { useState, useEffect } from "react";

interface Candidate {
  Name: string;
  Email: string;
  'Current Role': string;
  'Experience (Years)': number;
  Skills: string;
  Education: string;
  'Last Company': string;
  'Current Location': string;
  'Preferred Location': string;
  'Open to Relocation': string;
  Industry: string;
  'Job Type': string;
  'Salary Expectations': string;
  'Notice Period': string;
  'Language Skills': string;
  Certifications: string;
  Availability: string;
}

function FilterChip({
  filter,
  onRemove,
}: {
  filter: { type: string; value: string; id: string; include: boolean };
  onRemove: () => void;
}) {
  return (
    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border mr-2 mb-2 transition-all duration-200 hover:scale-105 ${
      filter.include
        ? "bg-gradient-to-r from-green-700/80 to-green-600/80 border-green-400 text-white shadow-lg"
        : "bg-gradient-to-r from-red-700/80 to-red-600/80 border-red-400 text-white shadow-lg"
    }`}>
      <span className="mr-2">
        {filter.value} ({filter.type}) [{filter.include ? "Include" : "Exclude"}]
      </span>
      <button onClick={onRemove} className="ml-1 hover:text-gray-300 font-bold text-lg">×</button>
    </div>
  );
}

export default function Home() {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [generatedJD, setGeneratedJD] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showJD, setShowJD] = useState(false);
  const [findingCandidates, setFindingCandidates] = useState(false);
  const [optimizedFilters, setOptimizedFilters] = useState<any>(null);
  const [filterError, setFilterError] = useState('');
  const [optimizationMessage, setOptimizationMessage] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'jobTitle' | 'company' | 'location'>('jobTitle');
  const [selectedFilters, setSelectedFilters] = useState<
    { type: string; value: string; id: string; include: boolean }[]
  >([]);
  const [page, setPage] = useState(1);
  const [showCandidates, setShowCandidates] = useState(false);
  const perPage = 9;

  // Stable filter management
  const addFilter = (filter: { type: string; value: string; id: string; include: boolean }) => {
    setSelectedFilters(prev => [
      ...prev.filter(f => !(f.type === filter.type && f.value === filter.value)),
      filter
    ]);
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedJD('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, location, skills, experience }),
      });
      
      if (!res.ok) throw new Error('Failed to generate description');
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setShowJD(false);
      } else {
        setGeneratedJD(data.description);
        setShowJD(true); // Only show JD after successful generation
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate description');
      setShowJD(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFindCandidates = async () => {
    setFindingCandidates(true);
    setFilterError('');
    try {

      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await fetch('/api/optimize-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, location, skills, experience }),
      });
      if(!res.ok) throw new Error('API error');
      const data = await res.json();
      setOptimizedFilters(data.filters || data);
    } catch (err) {
      setFilterError('API rate limit reached. Showing sample candidates only.');
    } finally {
      setFindingCandidates(false);
      setShowCandidates(true);
    }
  };

  const FILTER_PRIORITY = { jobTitle: 1, company: 2, location: 3 };
  
  const optimizeFilters = () => {
    const MIN_CANDIDATES = 10;
    const filtered = filterCandidates();

    if (filtered.length >= MIN_CANDIDATES || selectedFilters.length === 0) return;

    const sortedFilters = [...selectedFilters].sort((a, b) =>
      FILTER_PRIORITY[b.type as keyof typeof FILTER_PRIORITY] -
      FILTER_PRIORITY[a.type as keyof typeof FILTER_PRIORITY]
    );

    const locationFilter = sortedFilters.find(f => f.type === 'location');
    if (locationFilter) {
      const fallbacks: Record<string, string[]> = {
        'Bangalore': ['Bengaluru', 'Karnataka'],
        'Mumbai': ['Mumbai Metropolitan Region'],
        'Delhi': ['New Delhi', 'NCR']
      };

      if (fallbacks[locationFilter.value]) {
        const newValue = fallbacks[locationFilter.value][0];
        const newFilters = selectedFilters.map(f => 
          f.id === locationFilter.id ? { ...f, value: newValue } : f
        );
        if (JSON.stringify(newFilters) !== JSON.stringify(selectedFilters)) {
          setSelectedFilters(newFilters);
          setOptimizationMessage(`AI: Changed location to ${newValue}`);
          return;
        }
      }
    }

    const filterToRemove = sortedFilters[0];
    const newFilters = selectedFilters.filter(f => f.id !== filterToRemove.id);
    if (JSON.stringify(newFilters) !== JSON.stringify(selectedFilters)) {
      setSelectedFilters(newFilters);
      setOptimizationMessage(`AI: Removed ${filterToRemove.type}`);
    }
  };

  const filterCandidates = () => {
    if (selectedFilters.length === 0) return candidates as Candidate[];
    return (candidates as Candidate[]).filter(candidate => 
      selectedFilters.every(filter => {
        const value = filter.value.toLowerCase();
        const candidateValue = {
          jobTitle: candidate['Current Role']?.toLowerCase(),
          company: candidate['Last Company']?.toLowerCase(),
          location: candidate['Current Location']?.toLowerCase(),
        }[filter.type];
        
        return candidateValue 
          ? filter.include 
            ? candidateValue.includes(value)
            : !candidateValue.includes(value)
          : true;
      })
    );
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) optimizeFilters();
    return () => { isMounted = false; };
  }, [selectedFilters]);

  useEffect(() => {
    fetch('/data/candidates.json')
    .then(res => res.json())
    .then(setCandidates)
    .catch(console.error);
  }, []);

  const renderTabbedSuggestions = () => {
    const tabs = [
      { key: 'jobTitle', label: 'Job Titles', data: optimizedFilters?.jobTitleData?.data },
      { key: 'company', label: 'Companies', data: optimizedFilters?.companyData?.data },
      { key: 'location', label: 'Locations', data: optimizedFilters?.locationData?.data }
    ];

    const activeTab = tabs.find(tab => tab.key === activeFilterTab);
    const activeData = activeTab?.data || [];

    return (
      <div className="mt-6">
        <div className="flex border-b border-gray-600 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilterTab(tab.key as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeFilterTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} {tab.data?.length ? `(${tab.data.length})` : ''}
            </button>
          ))}
        </div>

        {activeData.length > 0 && (
          <div className="bg-gray-800/60 rounded-lg p-4 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {activeData.slice(0, 8).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-700/40 rounded border border-gray-600/30 hover:bg-gray-600/40 transition-colors"
                >
                  <span className="text-white text-sm">{item.displayValue}</span>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                      onClick={() =>
                        addFilter({
                          type: activeFilterTab,
                          value: item.displayValue,
                          id: item.id,
                          include: true,
                        })
                      }
                    >
                      Include
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                      onClick={() =>
                        addFilter({
                          type: activeFilterTab,
                          value: item.displayValue,
                          id: item.id,
                          include: false,
                        })
                      }
                    >
                      Exclude
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSelectedFilters = () => {
    if (selectedFilters.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {selectedFilters.map((filter, idx) => (
          <FilterChip
            key={filter.type + filter.id + filter.include}
            filter={filter}
            onRemove={() =>
              setSelectedFilters(f => f.filter((_, i) => i !== idx))
            }
          />
        ))}
      </div>
    );
  };

  const filteredCandidates = filterCandidates();
  const paginatedCandidates = filteredCandidates.slice((page - 1) * perPage, page * perPage);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <h1 className="font-encode text-4xl text-white mb-6">
          Find Your Next Great Hire
        </h1>
        <p className="font-nunito text-white/80 mb-8 text-lg">
          Instantly generate professional job descriptions and discover top candidates using AI.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-encode px-8 py-4 rounded-xl text-xl hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl cursor-pointer"
        >
          Find Talent
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="max-w-5xl w-full max-h-[95vh] bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col relative">
              <div className="p-6 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white font-encode text-center">Job Description Generator</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {!showJD ? (
                  <form className="space-y-4" onSubmit={handleGenerate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Job Title</label>
                        <input
                          type="text"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                          value={jobTitle}
                          onChange={e => setJobTitle(e.target.value)}
                          placeholder="e.g. Frontend Developer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Company</label>
                        <input
                          type="text"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                          value={company}
                          onChange={e => setCompany(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Location</label>
                        <input
                          type="text"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="e.g. Bengaluru"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Experience</label>
                        <input
                          type="text"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                          value={experience}
                          onChange={e => setExperience(e.target.value)}
                          placeholder="e.g. 3+ years"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Skills</label>
                      <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                        value={skills}
                        onChange={e => setSkills(e.target.value)}
                        placeholder="e.g. React, TypeScript, Tailwind"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-encode px-6 py-3 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200" 
                      disabled={loading}
                    >
                      {loading ? "Generating..." : "Generate Job Description"}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white font-encode text-center">Generated Job Description</h3>
                      <div className="bg-gray-900/70 rounded-lg p-4 text-white whitespace-pre-line font-nunito text-sm shadow-inner max-h-40 overflow-y-auto border border-gray-700">
                        {generatedJD || "Job description will appear here..."}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-encode px-4 py-2 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                        onClick={() => setShowJD(false)}
                      >
                        Edit Job Details
                      </button>
                      <button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-700 text-white font-encode px-4 py-2 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                        onClick={handleFindCandidates}
                      >
                        Find Candidates
                      </button>
                    </div>

                    {findingCandidates && (
                      <div className="text-blue-400 text-center text-sm">Optimizing filters and searching candidates...</div>
                    )}
                    {filterError && (
                      <div className="text-red-400 text-center text-sm">{filterError}</div>
                    )}

                    {optimizedFilters && renderTabbedSuggestions()}

                    {renderSelectedFilters()}

                    {optimizationMessage && (
                      <div className="text-blue-400 text-center bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 text-sm">
                        ⚡ {optimizationMessage}
                      </div>
                    )}

                    {selectedFilters.length > 0 && (
                      <div className="text-center">
                        <button
                          className="bg-gradient-to-r from-purple-600 to-blue-700 text-white font-encode px-6 py-3 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                          onClick={() => {
                            setShowCandidates(true);
                            setPage(1);
                          }}
                        >
                          Show Candidates ({filteredCandidates.length})
                        </button>
                      </div>
                    )}

                    {showCandidates && (
                      <div className="mt-6">
                        <div className="text-gray-300 text-center mb-4 italic text-sm">
                          This is our sample data
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {paginatedCandidates.map((candidate: Candidate, idx) => (
                            <div
                              key={candidate.Email + idx}
                              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg p-4 border border-white/20 shadow-lg hover:scale-105 transition-transform duration-200"
                            >
                              <h3 className="text-lg font-bold text-white mb-1">{candidate.Name}</h3>
                              <p className="text-blue-200 text-sm mb-1">{candidate['Current Role']}</p>
                              <p className="text-gray-300 text-xs mb-1">{candidate['Last Company']}</p>
                              <p className="text-gray-400 text-xs mb-1">{candidate['Current Location']}</p>
                              <p className="text-gray-400 text-xs mb-1">{candidate['Experience (Years)']} years exp</p>
                              <p className="text-gray-400 text-xs">{candidate.Availability}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center gap-4 mt-6">
                          <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition text-sm"
                          >
                            Previous
                          </button>
                          <span className="text-white self-center bg-gray-800 px-3 py-2 rounded-lg text-sm">Page {page}</span>
                          <button
                            disabled={page * perPage >= filteredCandidates.length}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition text-sm"
                          >
                            Next
                          </button>
                        </div>

                        {filteredCandidates.length === 0 && (
                          <div className="mt-6 text-gray-400 text-center flex flex-col items-center">
                            <span className="text-2xl mb-2">😕</span>
                            <span className="text-sm">No candidates found. Adjust your filters and try again.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-6 text-gray-400 hover:text-white text-2xl font-bold cursor-pointer transition"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
