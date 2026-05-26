interface TaskFiltersProps {
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}

const filters = [
  { value: 'all' as const, label: 'All' },
  { value: 'active' as const, label: 'Active' },
  { value: 'completed' as const, label: 'Completed' },
];

export const TaskFilters = ({ filter, onFilterChange }: TaskFiltersProps) => {
  return (
    <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl w-fit" role="tablist" aria-label="Task filters">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          role="tab"
          aria-selected={filter === f.value}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === f.value
              ? 'bg-primary-600 text-white shadow-lg'
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50'
          }`}
          id={`filter-${f.value}`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};
