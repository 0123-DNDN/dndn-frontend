import { api } from '@/services/api';

import type {
  ActivityResultResponse,
  ActivityResultSaveRequest,
  ActivityType,
  TodayActivityResponse,
} from '@/types/activity';

export async function getTodayActivities(): Promise<
  TodayActivityResponse[]
> {
  const response =
    await api.get<TodayActivityResponse[]>(
      '/api/activities/today',
    );

  return response.data;
}

export async function getTodayActivityByType(
  activityType: ActivityType,
): Promise<TodayActivityResponse | null> {
  const activities =
    await getTodayActivities();

  return (
    activities.find(
      (activity) =>
        activity.activityType ===
        activityType,
    ) ?? null
  );
}

export async function saveActivityResult(
  activityId: number,
  request: ActivityResultSaveRequest,
): Promise<ActivityResultResponse> {
  const response =
    await api.post<ActivityResultResponse>(
      `/api/activities/${activityId}/results`,
      request,
    );

  return response.data;
}