import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "마이크와 음성 인식 권한이 필요해요.",
  "no-speech": "말씀을 듣지 못했어요. 다시 말씀해 주세요.",
  network: "네트워크 연결을 확인해 주세요.",
  "audio-capture": "마이크를 사용할 수 없어요.",
  "service-not-allowed": "기기의 음성 인식 기능을 사용할 수 없어요.",
};

export function useSpeechRecognition() {
  const isStartingOrListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent("start", () => {
    isStartingOrListeningRef.current = true;
    setIsListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent("end", () => {
    isStartingOrListeningRef.current = false;
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript?.trim() ?? "";
    if (!text) return;

    setTranscript(text);
    if (event.isFinal) setFinalTranscript(text);
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "aborted") return;
    isStartingOrListeningRef.current = false;
    setError(
      ERROR_MESSAGES[event.error] ??
        "음성을 인식하지 못했어요. 다시 시도해 주세요.",
    );
    setIsListening(false);
  });

  const startListening = useCallback(async () => {
    if (isStartingOrListeningRef.current) return true;
    isStartingOrListeningRef.current = true;
    setTranscript("");
    setFinalTranscript("");
    setError(null);

    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      isStartingOrListeningRef.current = false;
      setError("마이크와 음성 인식 권한을 허용해 주세요.");
      return false;
    }

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      isStartingOrListeningRef.current = false;
      setError("이 기기에서는 음성 인식을 사용할 수 없어요.");
      return false;
    }

    ExpoSpeechRecognitionModule.start({
      lang: "ko-KR",
      interimResults: true,
      continuous: true,
      maxAlternatives: 1,
      addsPunctuation: true,
      contextualStrings: [
        "잔액 조회",
        "거래 내역",
        "송금",
        "이체",
        "보내 줘",
        "취소",
      ],
      androidIntentOptions: {
        EXTRA_ENABLE_FORMATTING: "latency",
        EXTRA_HIDE_PARTIAL_TRAILING_PUNCTUATION: true,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 700,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1100,
      },
    });
    return true;
  }, []);

  const stopListening = useCallback(() => {
    isStartingOrListeningRef.current = false;
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const cancelListening = useCallback(() => {
    isStartingOrListeningRef.current = false;
    ExpoSpeechRecognitionModule.abort();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setFinalTranscript("");
    setError(null);
  }, []);

  useEffect(() => () => ExpoSpeechRecognitionModule.abort(), []);

  return {
    transcript,
    finalTranscript,
    isListening,
    error,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
  };
}
