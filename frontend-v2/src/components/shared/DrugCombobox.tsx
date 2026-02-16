import { useState, useMemo, Fragment } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { DRUG_DATABASE, findDrugById } from '../../lib/drug-database.ts';
import { useLanguage } from '../../i18n/LanguageContext.tsx';
import type { DrugDefinition, BrandEntry } from '../../lib/types.ts';

interface DrugComboboxProps {
  readonly value: string | null;
  readonly onChange: (drugId: string, route?: string) => void;
  readonly placeholder?: string;
  readonly label?: string;
  readonly excludeDrugs?: readonly string[];
}

// Accent-insensitive normalization for Hungarian characters
function normalizeAccents(str: string): string {
  return str
    .toLowerCase()
    .replace(/[áà]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óòöő]/g, 'o')
    .replace(/[úùüű]/g, 'u');
}

interface SelectableItem {
  type: 'drug' | 'brand';
  drug: DrugDefinition;
  brand?: BrandEntry;
  displayLabel: string;
  searchText: string;
  key: string;
}

export default function DrugCombobox({
  value,
  onChange,
  placeholder,
  label,
  excludeDrugs = [],
}: DrugComboboxProps) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');

  // Build flat list of selectable items (drug headers + brands)
  const allItems = useMemo(() => {
    const items: SelectableItem[] = [];
    for (const drug of DRUG_DATABASE) {
      if (excludeDrugs.includes(drug.id)) continue;

      const displayName =
        typeof drug.displayName === 'object'
          ? drug.displayName[lang]
          : drug.displayName;

      // Drug header as selectable item
      items.push({
        type: 'drug',
        drug,
        displayLabel: displayName,
        searchText: normalizeAccents(displayName),
        key: `drug-${drug.id}`,
      });

      // Brands as selectable items
      for (const brand of drug.brands) {
        const brandLabel = brand.form
          ? `${brand.name} (${brand.form})`
          : brand.name;
        items.push({
          type: 'brand',
          drug,
          brand,
          displayLabel: brandLabel,
          searchText: normalizeAccents(brandLabel),
          key: `brand-${drug.id}-${brand.name}`,
        });
      }
    }
    return items;
  }, [lang, excludeDrugs]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (query === '') return allItems;

    const normalizedQuery = normalizeAccents(query);

    // Find which drugs match (either drug name or any brand)
    const matchingDrugIds = new Set<string>();
    for (const item of allItems) {
      if (item.searchText.includes(normalizedQuery)) {
        matchingDrugIds.add(item.drug.id);
      }
    }

    // Return all items (header + brands) for matching drugs
    return allItems.filter((item) => matchingDrugIds.has(item.drug.id));
  }, [allItems, query]);

  // Group filtered items by drug for display
  const groupedItems = useMemo(() => {
    const groups: { drug: DrugDefinition; items: SelectableItem[] }[] = [];
    let currentDrugId = '';
    let currentGroup: SelectableItem[] = [];

    for (const item of filteredItems) {
      if (item.drug.id !== currentDrugId) {
        if (currentGroup.length > 0) {
          const prevDrug = currentGroup[0].drug;
          groups.push({ drug: prevDrug, items: currentGroup });
        }
        currentDrugId = item.drug.id;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    }
    if (currentGroup.length > 0) {
      groups.push({ drug: currentGroup[0].drug, items: currentGroup });
    }

    return groups;
  }, [filteredItems]);

  // Current display value
  const selectedDisplayValue = useMemo(() => {
    if (!value) return '';
    // Check if value is a drug ID
    const drug = findDrugById(value);
    if (drug) {
      return typeof drug.displayName === 'object'
        ? drug.displayName[lang]
        : drug.displayName;
    }
    return value;
  }, [value, lang]);

  const handleSelect = (item: SelectableItem | null) => {
    if (!item) return;

    if (item.type === 'brand' && item.brand?.routeHint) {
      onChange(item.drug.id, item.brand.routeHint);
    } else {
      onChange(item.drug.id);
    }
    setQuery('');
  };

  // Find the currently selected item (for Combobox value)
  const selectedItem = useMemo(() => {
    if (!value) return null;
    return allItems.find(
      (item) => item.type === 'drug' && item.drug.id === value,
    ) ?? null;
  }, [value, allItems]);

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </label>
      )}
      <Combobox
        value={selectedItem}
        onChange={handleSelect}
        onClose={() => setQuery('')}
      >
        <div className="relative">
          <ComboboxInput
            aria-label={label ?? t('drug.select')}
            className="w-full h-12 pl-4 pr-10 text-base border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            displayValue={(item: SelectableItem | null) =>
              item ? selectedDisplayValue : ''
            }
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder ?? t('drug.searchPlaceholder')}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom"
          className="z-50 w-[var(--input-width)] max-h-60 overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 empty:hidden mt-1"
        >
          {groupedItems.map((group) => (
            <Fragment key={group.drug.id}>
              {group.items.map((item) => (
                <ComboboxOption
                  key={item.key}
                  value={item}
                  className="group cursor-pointer select-none relative py-2.5 px-4 data-[focus]:bg-blue-50 data-[selected]:bg-blue-100"
                >
                  {item.type === 'drug' ? (
                    <span className="block font-semibold text-gray-900 text-sm">
                      {item.displayLabel}
                    </span>
                  ) : (
                    <span className="block pl-4 text-gray-600 text-sm">
                      {item.displayLabel}
                      {item.brand?.routeHint && (
                        <span className="ml-2 text-xs text-gray-400">
                          [{item.brand.routeHint}]
                        </span>
                      )}
                    </span>
                  )}
                </ComboboxOption>
              ))}
            </Fragment>
          ))}
          {groupedItems.length === 0 && query !== '' && (
            <div className="py-4 px-4 text-sm text-gray-500 text-center">
              {t('drug.noResults')}
            </div>
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
