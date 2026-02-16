import type { ReactNode } from 'react';

interface CardProps {
  readonly title?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly id?: string;
}

export default function Card({ title, children, className = '', id }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}
