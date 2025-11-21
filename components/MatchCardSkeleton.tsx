export function MatchCardSkeleton() {
  return (
    <div
      className="rounded-[16px] px-6 py-4 border animate-pulse"
      style={{
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        borderWidth: "1px",
        minHeight: 120,
      }}
    >
      {/* Top row skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-700" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="rounded-[8px] px-3 py-1 bg-gray-700 w-24 h-6" />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-700" />
      </div>

      {/* Team rows skeleton */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700" />
            <div className="h-5 bg-gray-700 rounded w-32" />
          </div>
          <div className="rounded-[8px] px-2 py-1 bg-gray-700 w-12 h-6" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700" />
            <div className="h-5 bg-gray-700 rounded w-32" />
          </div>
          <div className="rounded-[8px] px-2 py-1 bg-gray-700 w-12 h-6" />
        </div>
      </div>

      {/* Separator */}
      <div className="my-2.5 h-px w-full bg-gray-700" />

      {/* Draw row skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-700 rounded w-12" />
        <div className="rounded-[8px] px-2 py-1 bg-gray-700 w-12 h-6" />
      </div>
    </div>
  );
}

