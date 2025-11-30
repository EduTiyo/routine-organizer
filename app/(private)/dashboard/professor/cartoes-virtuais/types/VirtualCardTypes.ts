import { FeedbackSoundType } from "@prisma/client";

export type VirtualCard = {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  estimatedTime: number | null;
  feedbackSoundType: FeedbackSoundType | null;
  rotina: {
    id: string;
    title: string;
    student: {
      id: string;
      name: string | null;
    };
  };
};
