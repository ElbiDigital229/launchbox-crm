'use client';

import Link from 'next/link';

const variants = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  secondary:
    'bg-white text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
  ghost:
    'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  'ghost-danger':
    'text-gray-400 hover:text-red-500 hover:bg-red-50',
  outline:
    'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
};

const sizes = {
  xs: 'px-2 py-1 text-xs rounded-md gap-1',
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2',
  icon: 'p-1.5 rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  disabled,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
