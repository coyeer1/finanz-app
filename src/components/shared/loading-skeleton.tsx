export function StatCardSkeleton() {
  return (
    <div className="bg-bg-tertiary border border-border-primary rounded-[var(--radius-lg)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-8 rounded-[var(--radius-md)]" />
      </div>
      <div className="skeleton h-7 w-32 rounded mb-2" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="transaction-row flex items-center gap-4 px-4">
      <div className="skeleton h-3 w-3 rounded-full" />
      <div className="flex-1 flex items-center gap-3">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-4 w-20 rounded" />
      <div className="skeleton h-3 w-14 rounded" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-bg-tertiary border border-border-primary rounded-[var(--radius-lg)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="skeleton flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-7 w-40 rounded" />
        <div className="skeleton h-9 w-28 rounded-[var(--radius-md)]" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Chart */}
      <ChartSkeleton />

      {/* Table */}
      <div className="bg-bg-tertiary border border-border-primary rounded-[var(--radius-lg)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <div className="skeleton h-5 w-36 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        <div className="divide-y divide-border-primary">
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
