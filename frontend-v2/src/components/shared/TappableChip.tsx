interface TappableChipProps {
  readonly label: string;
  readonly selected: boolean;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly tabIndex?: number;
}

export default function TappableChip({
  label,
  selected,
  onClick,
  disabled = false,
  tabIndex,
}: TappableChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      tabIndex={tabIndex}
      className={`
        inline-flex items-center justify-center
        min-h-12 min-w-16 px-4 py-2
        rounded-full text-sm font-medium
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${
          selected
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {label}
    </button>
  );
}
