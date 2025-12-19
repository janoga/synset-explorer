interface TreeSkeletonProps {
  count?: number;
  level?: number;
}

export function TreeSkeleton({ count = 3, level = 0 }: TreeSkeletonProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 py-1 px-2 animate-pulse"
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          {/* Expand icon skeleton */}
          <div className="w-4 h-4 bg-muted rounded flex-shrink-0" />

          {/* Folder icon skeleton */}
          <div className="w-4 h-4 bg-muted rounded flex-shrink-0" />

          {/* Name skeleton */}
          <div
            className="h-4 bg-muted rounded flex-1"
            style={{ width: `${40 + Math.random() * 40}%` }}
          />

          {/* Badge skeleton */}
          <div className="h-5 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
