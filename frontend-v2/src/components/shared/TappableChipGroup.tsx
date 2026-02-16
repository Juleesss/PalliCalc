import TappableChip from './TappableChip.tsx';

interface ChipOption {
  readonly value: string;
  readonly label: string;
}

interface TappableChipGroupProps {
  readonly options: readonly ChipOption[];
  readonly value: string | null;
  readonly onChange: (value: string) => void;
  readonly label?: string;
  readonly disabled?: boolean;
}

export default function TappableChipGroup({
  options,
  value,
  onChange,
  label,
  disabled = false,
}: TappableChipGroupProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {label}
        </label>
      )}
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <TappableChip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
