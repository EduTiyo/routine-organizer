export type VirtualCard = {
  id: string;
  title: string;
  imageUrl: string;
  estimatedTime: number | null;
  timeInSeconds: number | null;
  dayPeriod: "MORNING" | "AFTERNOON" | "EVENING";
  order: number | null;
  creator: {
    id: string;
    name: string | null;
  };
};
