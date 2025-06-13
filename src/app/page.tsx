'use client'
import { useState } from "react";

function FilterChip({
  filter,
  onRemove,
}: {
  filter: { type: string; value: string; id: string; include: boolean };
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center px-3 py-1 rounded-full text-sm border mr-2 mb-2 ${
        filter.include
          ? "bg-green-700/60 border-green-400 text-white"
          : "bg-red-700/60 border-red-400 text-white"
      }`}
    >
      <span className="mr-2">
        {filter.value} ({filter.type}) [{filter.include ? "Include" : "Exclude"}]
      </span>
      <button
        onClick={onRemove}
        className="ml-1 hover:text-gray-300 font-bold"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  function openModal() { setShowModal(true); }
  function closeModal() { setShowModal(false); }

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
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateError, setCandidateError] = useState('');
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Filter chip/tag state
  const [selectedFilters, setSelectedFilters] = useState<
    { type: string; value: string; id: string; include: boolean }[]
  >([]);

  function addFilter(filter: { type: string; value: string; id: string; include: boolean }) {
    setSelectedFilters(prev =>
      prev.some(
        f => f.id === filter.id && f.type === filter.type && f.include === filter.include
      )
        ? prev
        : [...prev, filter]
    );
  }

  async function handleShowCandidates() {
  setCandidatesLoading(true);
  setCandidateError('');
  setCandidates([]);
  try {
    const res = await fetch('/api/search-candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: selectedFilters }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch candidates');
    setCandidates(data.candidates || []);
  } catch (err: any) {
    setCandidateError(err.message);
  } finally {
    setCandidatesLoading(false);
    }
  }
  const handleFindCandidates = async () => {
    setFindingCandidates(true);
    setFilterError('');
    setOptimizedFilters(null);
    try {
      const res = await fetch('/api/optimize-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, location, skills, experience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to optimize filters');
      setOptimizedFilters(data.filters || data);
    } catch (err: any) {
      setFilterError(err.message);
    } finally {
      setFindingCandidates(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedJD('');
    setShowJD(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, location, skills, experience }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setGeneratedJD(data.description);
    } catch (err) {
      setError('Failed to generate description.');
    } finally {
      setLoading(false);
    }
  };

  function renderSuggestions(type: "jobTitle" | "company" | "location") {
    const data =
      type === "jobTitle"
        ? optimizedFilters?.jobTitleData?.data
        : type === "company"
        ? optimizedFilters?.companyData?.data
        : optimizedFilters?.locationData?.data;

    if (!data || data.length === 0) return null;

    return (
      <div>
      <div className="mt-6">
        <h3 className="text-xl font-bold text-white mb-4 capitalize">
          {type} Suggestions
        </h3>
        <ul className="max-w-xl mx-auto bg-white/10 rounded-xl p-4 shadow-md divide-y divide-white/10">
          {data.map((item: any) => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-2"
            >
              <span className="text-lg text-white font-medium">
                {item.displayValue}
              </span>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  className="px-2 py-1 bg-green-600/70 rounded text-white cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200"
                  onClick={() =>
                    addFilter({
                      type,
                      value: item.displayValue,
                      id: item.id,
                      include: true,
                    })
                  }
                >
                  Include
                </button>
                <button
                  className="px-2 py-1 bg-red-600/70 rounded text-white cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200"
                  onClick={() =>
                    addFilter({
                      type,
                      value: item.displayValue,
                      id: item.id,
                      include: false,
                    })
                  }
                >
                  Exclude
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <button
            className="mt-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-encode px-6 py-3 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
            onClick={handleShowCandidates}
          >
            Show Candidates
        </button>
        {candidatesLoading && (
            <div className="mt-8 text-blue-400 text-center">Loading candidates...</div>
          )}
          {candidateError && (
            <div className="mt-8 text-red-400 text-center">{candidateError}</div>
          )}
          {candidates.length > 0 && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((profile: any) => (
                <div
                  key={profile.id}
                  className="bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg flex flex-col"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{profile.name}</h3>
                  <p className="text-blue-200">{profile.headline}</p>
                  <p className="text-gray-300 mt-2">{profile.company}</p>
                  <p className="text-gray-400 mt-1">{profile.location}</p>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={profile.linkedinUrl}
                      className="px-4 py-2 bg-blue-600/30 text-white rounded-lg hover:bg-blue-700/40 transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          {candidates.length === 0 && !candidatesLoading && !candidateError && (
            <div className="mt-8 text-gray-400 text-center">No candidates found. Adjust your filters and try again.</div>
          )}
          </div>
    );
  }

  function renderSelectedFilters() {
    if (selectedFilters.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-8">
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
  }

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
          onClick={openModal}
          className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-encode px-8 py-4 rounded-xl text-xl hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl cursor-pointer"
        >
          Find Talent
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="max-w-2xl w-full max-h-[90vh] h-auto bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-0 flex flex-col relative">
              <div className="p-8 pb-4 border-b border-white/10">
                <h2 className="text-3xl font-bold text-white font-encode text-center">Job Description Generator</h2>
              </div>
              <div className="flex-1 flex flex-col justify-center p-8">
                {!showJD ? (
                  <form className="space-y-4" onSubmit={handleGenerate}>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Job Title</label>
                      <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
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
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
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
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Skills</label>
                      <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                        value={skills}
                        onChange={e => setSkills(e.target.value)}
                        placeholder="e.g. React, TypeScript, Tailwind"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Experience</label>
                      <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                        value={experience}
                        onChange={e => setExperience(e.target.value)}
                        placeholder="e.g. 3+ years"
                      />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-encode px-6 py-3 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200" disabled={loading}>
                      {loading ? "Generating..." : "Generate Job Description"}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-white font-encode text-center">Generated Job Description</h3>
                    <div className="flex-1 overflow-y-auto bg-gray-900/70 rounded-xl p-6 text-white whitespace-pre-line font-nunito text-lg shadow-inner mb-6 max-h-[45vh]">
                      {generatedJD}
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-encode px-6 py-3 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer"
                      onClick={() => setShowJD(false)}
                      type="button"
                    >
                      Edit Job Details
                    </button>
                    <button
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-700 text-white font-encode px-6 py-3 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer"
                      onClick={handleFindCandidates}
                      type="button"
                    >
                      Find Candidates
                    </button>
                    {findingCandidates && (
                      <div className="mt-4 text-blue-400 text-center">Optimizing filters and searching candidates...</div>
                    )}
                    {filterError && (
                      <div className="mt-4 text-red-400 text-center">{filterError}</div>
                    )}

                    {/* Suggestions for each filter type */}
                    {renderSuggestions("jobTitle")}
                    {renderSuggestions("company")}
                    {renderSuggestions("location")}

                    {/* Selected filters as chips/tags */}
                    {renderSelectedFilters()}
                  </div>
                )}
                <p className="text-gray-300 mt-6 text-center text-base">
                  Here you can add your job requirements and generate a job description using AI.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-6 text-gray-400 hover:text-white text-3xl font-bold cursor-pointer"
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
