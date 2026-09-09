import { api } from '@/services/api';

import type {
  ActivityResultResponse,
  ActivityResultSaveRequest,
  ActivityType,
  TodayActivityResponse,
} from '@/types/activity';

export type VoiceTalkStartResponse = {
  sessionId: number;
  question: string;
  totalQuestions: number;
};

export type VoiceTalkAnswerResponse = {
  sessionId: number;
  nextQuestion: string | null;
  summary: string | null;
  answeredCount: number;
  completed: boolean;
};

export async function startVoiceTalkSession(): Promise<VoiceTalkStartResponse> {
  const response = await api.post<VoiceTalkStartResponse>(
    '/api/activities/voice-talk/sessions',
  );
  return response.data;
}

export async function submitVoiceTalkAnswer(
  sessionId: number,
  text: string,
): Promise<VoiceTalkAnswerResponse> {
  const response = await api.post<VoiceTalkAnswerResponse>(
    `/api/activities/voice-talk/sessions/${sessionId}/answers`,
    { text },
  );
  return response.data;
}

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
