export const VOICE_PAUSE_THRESHOLD_MS = 800;
export const VOICE_LONG_PAUSE_THRESHOLD_MS = 2000;

export type CapturedVoiceMetrics = {
  speechDurationMs: number;
  avgPauseDurationMs: number;
  longPauseCount: number;
};

export function recordVoicePause(
  pauseDurations: number[],
  previousResultAt: number | null,
  observedAt: number,
) {
  if (previousResultAt === null) return;

  const pauseDuration = observedAt - previousResultAt;
  if (pauseDuration >= VOICE_PAUSE_THRESHOLD_MS) {
    pauseDurations.push(pauseDuration);
  }
}

export function finishVoiceCapture({
  startedAt,
  lastResultAt,
  pauseDurations,
  finishedAt,
}: {
  startedAt: number | null;
  lastResultAt: number | null;
  pauseDurations: number[];
  finishedAt: number;
}): CapturedVoiceMetrics | null {
  if (startedAt === null) return null;

  recordVoicePause(pauseDurations, lastResultAt, finishedAt);

  const speechDurationMs = Math.max(0, finishedAt - startedAt);
  if (speechDurationMs === 0) return null;

  const avgPauseDurationMs =
    pauseDurations.length > 0
      ? Math.round(
          pauseDurations.reduce((sum, pause) => sum + pause, 0) /
            pauseDurations.length,
        )
      : 0;

  return {
    speechDurationMs,
    avgPauseDurationMs,
    longPauseCount: pauseDurations.filter(
      (pause) => pause >= VOICE_LONG_PAUSE_THRESHOLD_MS,
    ).length,
  };
}

export function calculateSpeechRate(
  text: string,
  speechDurationMs: number,
): number | null {
  if (speechDurationMs <= 0) return null;

  const spokenUnits = text.replace(/\s+/g, "").length;
  if (spokenUnits === 0) return null;

  return spokenUnits / (speechDurationMs / 1000);
}
