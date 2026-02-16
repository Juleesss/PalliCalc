import type { ReactNode } from 'react';

type WarningVariant = 'danger' | 'caution' | 'preferred' | 'info';

interface InlineWarningProps {
  readonly variant: WarningVariant;
  readonly children?: ReactNode;
  readonly message?: string;
}

const VARIANT_STYLES: Record<
  WarningVariant,
  { container: string; icon: string }
> = {
  danger: {
    container: 'bg-red-50 border-red-400 text-red-800',
    icon: '\u26A0\uFE0F', // warning sign
  },
  caution: {
    container: 'bg-amber-50 border-amber-400 text-amber-800',
    icon: '\u26A0\uFE0F', // warning sign
  },
  preferred: {
    container: 'bg-green-50 border-green-400 text-green-800',
    icon: '\u2713', // checkmark
  },
  info: {
    container: 'bg-blue-50 border-blue-400 text-blue-800',
    icon: '\u2139\uFE0F', // info
  },
};

export default function InlineWarning({
  variant,
  children,
  message,
}: InlineWarningProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      role="alert"
      className={`flex gap-2 p-3 rounded-lg border-l-4 text-sm leading-relaxed ${styles.container}`}
    >
      <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
        {styles.icon}
      </span>
      <div>{children ?? message}</div>
    </div>
  );
}
