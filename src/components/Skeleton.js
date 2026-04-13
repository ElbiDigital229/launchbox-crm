export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 animate-pulse">
      <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="h-5 bg-gray-200 rounded-full w-20" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  );
}

export function SkeletonKanban() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="min-w-[280px] bg-gray-50 rounded-lg border-t-4 border-t-gray-200 p-3 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-2">
            <div className="h-24 bg-gray-200 rounded-lg" />
            <div className="h-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-7 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
