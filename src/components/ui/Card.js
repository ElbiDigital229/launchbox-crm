export default function Card({
  children,
  className = '',
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, message, submessage }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <p className="text-sm">{message}</p>
      {submessage && <p className="text-xs mt-1">{submessage}</p>}
    </div>
  );
}
