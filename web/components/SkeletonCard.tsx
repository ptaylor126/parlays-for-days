export function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        <div className="h-8 bg-gray-700 rounded w-16"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonMatchCard() {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          <div className="h-5 bg-gray-700 rounded w-24"></div>
        </div>
        <div className="text-gray-500 text-sm">vs</div>
        <div className="flex items-center gap-3">
          <div className="h-5 bg-gray-700 rounded w-24"></div>
          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
        </div>
      </div>
      <div className="h-3 bg-gray-700 rounded w-1/3 mx-auto mb-3"></div>
      <div className="h-8 bg-gray-700 rounded w-full"></div>
    </div>
  );
}

