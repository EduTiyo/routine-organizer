import { Skeleton } from "@/components/ui/skeleton";

interface StudentCardSkeletonProps {
  index?: number;
}

export default function StudentCardSkeleton({
  index = 0,
}: StudentCardSkeletonProps) {
  const opacity = Math.max(0.2, 1 - index * 0.05);

  return (
    <div
      className="p-6 mb-4 w-80 h-48 rounded-xl shadow-sm flex flex-col justify-between transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* Top: avatar + name */}
      <div className="flex items-center">
        <Skeleton className="h-10 w-10 rounded-full mr-4" />
        <div className="flex-1">
          <Skeleton className="h-5 w-40 mb-2 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      </div>

      {/* Middle: email / info */}
      <Skeleton className="h-3 w-full mt-2 rounded" />

      {/* Bottom: toggle/button area */}
      <div className="flex w-full justify-end">
        <Skeleton className="h-8 rounded-md mt-2 w-full" />
      </div>
    </div>
  );
}
