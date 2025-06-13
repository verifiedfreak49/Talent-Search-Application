import FilterChip from "./FilterChip";

type FilterChipData = {
  id: string;
  label: string;
  category: string;
  mode: "include" | "exclude";
};

type Props = {
  chips: FilterChipData[];
  onRemove: (id: string) => void;
};

export default function FilterPanel({ chips, onRemove }: Props) {
  return (
    <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Add Candidates from LinkedIn</h2>
        <button className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg shadow hover:bg-white/20 transition">Reset</button>
      </div>
      <div className="mb-4">
        <input
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Type to search filters (e.g. Job Title, Company)..."
          // Add your search logic here
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {chips.map(chip => (
          <FilterChip key={chip.id} label={chip.label} mode={chip.mode} onRemove={() => onRemove(chip.id)} />
        ))}
      </div>
      <button className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200">
        Apply Filters
      </button>
    </div>
  );
}
