import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const VirtualCardCardSkeleton = () => {
  return (
    <Card className="p-5 space-y-3">
      <div className="flex justify-between items-start gap-3">
        <div className="w-full space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
    </Card>
  );
};

export default VirtualCardCardSkeleton;
