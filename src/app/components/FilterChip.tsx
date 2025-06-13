type Props = {
  label: string;
  mode: "include" | "exclude";
  onRemove: () => void;
};

export default function FilterChip({ label, mode, onRemove }: Props) {
  return (
    <span
      className={`inline-flex items-center ${
        mode === "include" ? "bg-green-700/30 border-green-400" : "bg-red-700/30 border-red-400"
      } backdrop-blur-md border text-white px-3 py-1 rounded-full text-sm shadow mr-2 mb-2`}
    >
      {label}
      <button
        className="ml-2 font-bold focus:outline-none"
        title="Remove"
        style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  );
}
