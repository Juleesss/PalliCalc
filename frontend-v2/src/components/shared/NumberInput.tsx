import { useCallback, useState } from 'react';

interface NumberInputProps {
  readonly value: number | string;
  readonly onChange: (value: number) => void;
  readonly unit?: string;
  readonly placeholder?: string;
  readonly label?: string;
  readonly min?: number;
  readonly disabled?: boolean;
  readonly id?: string;
}

export default function NumberInput({
  value,
  onChange,
  unit,
  placeholder,
  label,
  min,
  disabled = false,
  id,
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(
    value === 0 || value === '' ? '' : String(value),
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value;

      // Convert Hungarian decimal comma to period
      raw = raw.replace(',', '.');

      // Allow only digits, single decimal point, and empty string
      if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) {
        return;
      }

      setDisplayValue(raw);

      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        if (min !== undefined && parsed < min) {
          onChange(min);
        } else {
          onChange(parsed);
        }
      } else if (raw === '' || raw === '.') {
        onChange(0);
      }
    },
    [onChange, min],
  );

  const handleBlur = useCallback(() => {
    // On blur, sync display value with the actual numeric value
    const parsed = parseFloat(displayValue);
    if (isNaN(parsed) || displayValue === '') {
      setDisplayValue('');
    } else {
      setDisplayValue(String(parsed));
    }
  }, [displayValue]);

  // Keep display in sync when value changes externally
  const displayStr =
    displayValue !== '' && parseFloat(displayValue) === value
      ? displayValue
      : value === 0
        ? ''
        : String(value);

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayStr}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full h-12 px-4 text-xl font-medium
            border border-gray-300 rounded-lg
            bg-white text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            ${unit ? 'pr-16' : 'pr-4'}
          `}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
