export type ActivityType =
  | 'COGNITIVE_GAME'
  | 'VOICE_TALK'
  | 'WALKING';

export type ActivityStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type TodayActivityResponse = {
  activityId: number;
  activityType: ActivityType;
  title: string;
  description: string | null;
  targetValue: number | null;
  displayOrder: number;
  status: ActivityStatus | null;
  score: number | null;
  stepCount: number | null;
  completed: boolean;
};

export type ActivityResultSaveRequest = {
  score?: number;
  stepCount?: number;
  sessionId?: number;
  status?: ActivityStatus;
};

export type ActivityResultResponse = {
  activityResultId: number;
  activityId: number;
  activityType: ActivityType;
  sessionId: number | null;
  activityDate: string;
  status: ActivityStatus;
  score: number | null;
  stepCount: number | null;
  startedAt: string | null;
  completedAt: string | null;
};