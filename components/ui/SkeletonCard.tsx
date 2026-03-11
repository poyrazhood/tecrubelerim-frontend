export function SkeletonReviewCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-1 p-4 mb-3">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full skeleton-line flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-line h-3 w-28" />
          <div className="skeleton-line h-2.5 w-20" />
        </div>
        <div className="skeleton-line h-2.5 w-12" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="skeleton-line h-3 w-full" />
        <div className="skeleton-line h-3 w-5/6" />
        <div className="skeleton-line h-3 w-4/6" />
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="skeleton-line h-5 w-16 rounded-full" />
        <div className="skeleton-line h-5 w-20 rounded-full" />
        <div className="skeleton-line h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-1 pt-2 border-t border-white/[0.05]">
        <div className="skeleton-line h-7 w-16 rounded-xl" />
        <div className="skeleton-line h-7 w-20 rounded-xl" />
        <div className="skeleton-line h-7 w-16 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonBusinessCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-1 mb-3 overflow-hidden">
      <div className="skeleton-line h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2 flex-1">
            <div className="skeleton-line h-4 w-40" />
            <div className="skeleton-line h-3 w-28" />
          </div>
          <div className="skeleton-line w-12 h-12 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <div className="skeleton-line h-5 w-20 rounded-full" />
          <div className="skeleton-line h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton-line h-3 w-24" />
      </div>
    </div>
  )
}

export function SkeletonMuhtarRow() {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
      <div className="skeleton-line w-8 h-8 rounded-full" />
      <div className="skeleton-line w-9 h-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton-line h-3 w-24" />
        <div className="skeleton-line h-2.5 w-16" />
      </div>
      <div className="skeleton-line h-4 w-12" />
    </div>
  )
}
