import { STAGE_COLORS } from '@/lib/constants';

const variants = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  pink: 'bg-pink-100 text-pink-800',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-3 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        variants[variant] || variants.gray
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Stage-specific badge that auto-colors based on stage name.
 */
export function StageBadge({ stage, size = 'md', className = '' }) {
  const colorClass = STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {stage}
    </span>
  );
}
