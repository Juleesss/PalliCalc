import { useRef, useCallback } from 'react';
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
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || options.length === 0) return;

      const currentIdx = options.findIndex((o) => o.value === value);
      let nextIdx = -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIdx = currentIdx < options.length - 1 ? currentIdx + 1 : 0;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIdx = currentIdx > 0 ? currentIdx - 1 : options.length - 1;
          break;
        default:
          return;
      }

      if (nextIdx >= 0) {
        onChange(options[nextIdx].value);
        // Focus the newly selected chip
        const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[role="radio"]',
        );
        buttons?.[nextIdx]?.focus();
      }
    },
    [options, value, onChange, disabled],
  );

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {label}
        </label>
      )}
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-2"
        onKeyDown={handleKeyDown}
      >
        {options.map((option) => (
          <TappableChip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            tabIndex={value === option.value ? 0 : -1}
          />
        ))}
      </div>
    </div>
  );
}
