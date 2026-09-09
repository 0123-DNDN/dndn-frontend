import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { fonts, seniorTypography } from "@/constants/typography";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  getAccountBalance,
  getMainAccount,
  type MainAccountResponse,
} from "@/services/account";
import {
  analyzeContext,
  analyzeIntent,
  createAiSession,
  endAiSession,
  saveAiAssistantMessage,
  saveAiUserMessage,
  type ContextAnalyzeResponse,
  type FdsAnalyzeResponse,
  type FollowUpAnswer,
  type IntentAnalyzeResponse,
  type IntentHint,
} from "@/services/ai";
import { searchRecipients, type Recipient } from "@/services/recipient";
import { getTransactions } from "@/services/transaction";
import {
  cancelTransfer,
  checkTransferFds,
  completeTransfer,
  confirmTransferAmount,
  confirmTransferRecipient,
  createTransfer,
  finalConfirmTransfer,
  getTransfer,
} from "@/services/transfer";
import type { TransactionResponse } from "@/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type InputMode = "voice" | "chat";
type ConversationStep =
  "intent" | "transfer-confirm" | "purpose" | "follow-up" | "result";
type TransferPreview = {
  recipient: Recipient;
  senderAccount: MainAccountResponse;
};
type BalancePreview = {
  account: MainAccountResponse;
  balance: number;
};
type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  intentResult?: IntentAnalyzeResponse;
  contextResult?: ContextAnalyzeResponse;
  fdsResult?: FdsAnalyzeResponse;
  transferPreview?: TransferPreview;
  balancePreview?: BalancePreview;
  transactionHistory?: TransactionResponse[];
  guardianApproved?: boolean;
};

const TTS_OPTIONS = {
  language: "ko-KR",
  rate: 0.78,
  pitch: 0.82,
} as const;

const TRANSFER_PURPOSE_QUESTION = "어떤 이유로 보내시는 돈인가요?";
const PAUSE_THRESHOLD_MS = 800;
const LONG_PAUSE_THRESHOLD_MS = 2000;
const AUTO_SUBMIT_SILENCE_MS = 1200;

const formatAccountNumber = (accountNumber: string) =>
  accountNumber.replace(/(.{4})(?=.)/g, "$1-");

const formatTransactionDate = (createdAt: string) => {
  const date = new Date(createdAt);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const getTransactionStatusText = (status: TransactionResponse["status"]) => {
  if (status === "COMPLETED") return "송금 완료";
  if (status === "CANCELLED") return "송금 취소";
  if (status === "WAITING_GUARDIAN") return "보호자 확인 중";
  if (status === "HIGH_RISK") return "위험 거래 확인 중";
  return "송금 진행 중";
};

const requiresGuardianReview = (fds: FdsAnalyzeResponse) =>
  fds.recommendedAction === "HOLD" ||
  fds.recommendedAction === "WARN" ||
  fds.riskLevel === "HIGH" ||
  fds.riskLevel === "CRITICAL";

const getFdsBadgeText = (fds: FdsAnalyzeResponse, approved = false) => {
  if (approved) return "보호자 승인 완료";
  if (requiresGuardianReview(fds)) return "고위험 거래";
  if (fds.recommendedAction === "RECONFIRM" || fds.riskLevel === "CAUTION")
    return "주의 거래";
  return "최종 확인";
};

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { intentHint: rawIntentHint } = useLocalSearchParams<{
    intentHint?: IntentHint;
  }>();
  const intentHint =
    typeof rawIntentHint === "string" ? rawIntentHint : undefined;

  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [contextResult, setContextResult] =
    useState<ContextAnalyzeResponse | null>(null);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [handledCardIds, setHandledCardIds] = useState<number[]>([]);
  const [handledFdsCardIds, setHandledFdsCardIds] = useState<number[]>([]);
  const [waitingGuardianTransactionId, setWaitingGuardianTransactionId] =
    useState<number | null>(null);
  const nextMessageId = useRef(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputModeRef = useRef<InputMode | null>(null);
  const isScreenFocusedRef = useRef(false);
  const isListeningRef = useRef(false);
  const requestVersion = useRef(0);
  const speechRunIdRef = useRef(0);
  const allowSpeechInterruptionRef = useRef(true);
  const voicePausedRef = useRef(false);
  const activeSpeechRef = useRef<{
    message: string;
    listenAfter: boolean;
  } | null>(null);
  const pendingSpeechRef = useRef<{
    message: string;
    listenAfter: boolean;
  } | null>(null);
  const voiceIdentifier = useRef<string | undefined>(undefined);
  const conversationStepRef = useRef<ConversationStep>("intent");
  const followUpAnswersRef = useRef<FollowUpAnswer[]>([]);
  const transferIntentRef = useRef<IntentAnalyzeResponse | null>(null);
  const transferRecipientRef = useRef<Recipient | null>(null);
  const transferSenderAccountRef = useRef<MainAccountResponse | null>(null);
  const transactionIdRef = useRef<number | null>(null);
  const waitingFdsMessageIdRef = useRef<number | null>(null);
  const purposeTextRef = useRef("");
  const shouldSubmitVoiceRef = useRef(false);
  const sessionPromiseRef = useRef<Promise<number> | null>(null);
  const voiceStartedAtRef = useRef<number | null>(null);
  const lastVoiceDurationRef = useRef<number | null>(null);
  const lastVoiceResultAtRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voicePauseDurationsRef = useRef<number[]>([]);
  const lastAvgPauseDurationRef = useRef<number | null>(null);
  const lastLongPauseCountRef = useRef(0);
  const typingStartedAtRef = useRef<number | null>(null);
  const lastTypingAtRef = useRef<number | null>(null);
  const editCountRef = useRef(0);
  const fullDeleteCountRef = useRef(0);
  const typingPauseCountRef = useRef(0);
  const lastAssistantAtRef = useRef<number | null>(null);
  const waveformProgress = useRef(new Animated.Value(0)).current;
  const previousVoiceStatusRef = useRef<string | null>(null);
  const {
    transcript: liveTranscript,
    finalTranscript,
    isListening,
    error: speechRecognitionError,
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    cancelListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const isActivelyListening =
    isListening && !isSpeaking && !isProcessing && !isVoicePaused;

  useEffect(() => {
    if (!isActivelyListening) {
      waveformProgress.stopAnimation();
      waveformProgress.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveformProgress, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveformProgress, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [isActivelyListening, waveformProgress]);

  const startSession = () => {
    const promise = createAiSession().then((session) => {
      console.log("[AI session created]", session);
      return session.sessionId;
    });
    sessionPromiseRef.current = promise;
    return promise;
  };

  const ensureSession = () => sessionPromiseRef.current ?? startSession();

  useFocusEffect(
    useCallback(() => {
      isScreenFocusedRef.current = true;
      void ensureSession().catch((error) =>
        console.warn("[AI session create failed]", error),
      );
      return () => {
        isScreenFocusedRef.current = false;
        requestVersion.current += 1;
        speechRunIdRef.current += 1;
        shouldSubmitVoiceRef.current = false;
        voiceStartedAtRef.current = null;
        voicePausedRef.current = false;
        activeSpeechRef.current = null;
        pendingSpeechRef.current = null;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        Speech.stop();
        cancelListening();
        resetTranscript();
        setIsSpeaking(false);
        setIsVoicePaused(false);
        setIsProcessing(false);
        inputModeRef.current = null;
        setInputMode(null);

        const activeSession = sessionPromiseRef.current;
        sessionPromiseRef.current = null;
        if (!activeSession) return;
        void activeSession
          .then((sessionId) => endAiSession(sessionId))
          .then((session) => console.log("[AI session ended]", session))
          .catch((error) => console.warn("[AI session end failed]", error));
      };
    }, []),
  );

  const changeConversationStep = (step: ConversationStep) => {
    conversationStepRef.current = step;
  };

  const startListening = async () => {
    voicePausedRef.current = false;
    setIsVoicePaused(false);
    speechRunIdRef.current += 1;
    Speech.stop();
    setIsSpeaking(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    shouldSubmitVoiceRef.current = false;
    lastVoiceResultAtRef.current = null;
    voicePauseDurationsRef.current = [];
    lastAvgPauseDurationRef.current = null;
    lastLongPauseCountRef.current = 0;
    const started = await startSpeechRecognition();
    if (!isScreenFocusedRef.current) {
      if (started) cancelListening();
      return;
    }
    if (started) voiceStartedAtRef.current = Date.now();
  };

  const speak = (
    message: string,
    listenAfter = false,
    allowInterruption = true,
  ) => {
    allowSpeechInterruptionRef.current = allowInterruption;
    activeSpeechRef.current = { message, listenAfter };
    if (voicePausedRef.current && inputModeRef.current === "voice") {
      pendingSpeechRef.current = { message, listenAfter };
      setIsSpeaking(false);
      return;
    }

    pendingSpeechRef.current = null;
    const speechRunId = ++speechRunIdRef.current;
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(message, {
      ...TTS_OPTIONS,
      voice: voiceIdentifier.current,
      onDone: () => {
        if (speechRunId !== speechRunIdRef.current) return;
        if (!allowInterruption) {
          cancelListening();
          resetTranscript();
        }
        allowSpeechInterruptionRef.current = true;
        activeSpeechRef.current = null;
        setIsSpeaking(false);
        if (
          listenAfter &&
          inputModeRef.current === "voice" &&
          !voicePausedRef.current
        ) {
          if (!allowInterruption || !isListeningRef.current) {
            setTimeout(
              () => void startListening(),
              allowInterruption ? 0 : 400,
            );
          }
        }
      },
      onError: () => {
        if (speechRunId !== speechRunIdRef.current) return;
        if (!allowInterruption) {
          cancelListening();
          resetTranscript();
        }
        allowSpeechInterruptionRef.current = true;
        activeSpeechRef.current = null;
        setIsSpeaking(false);
        if (
          listenAfter &&
          inputModeRef.current === "voice" &&
          !voicePausedRef.current
        ) {
          if (!allowInterruption || !isListeningRef.current) {
            setTimeout(
              () => void startListening(),
              allowInterruption ? 0 : 400,
            );
          }
        }
      },
      onStopped: () => {
        if (speechRunId === speechRunIdRef.current) setIsSpeaking(false);
      },
    });
  };

  const pauseVoiceConversation = () => {
    voicePausedRef.current = true;
    setIsVoicePaused(true);
    shouldSubmitVoiceRef.current = false;
    voiceStartedAtRef.current = null;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (isSpeaking && activeSpeechRef.current) {
      pendingSpeechRef.current = activeSpeechRef.current;
    }
    speechRunIdRef.current += 1;
    Speech.stop();
    cancelListening();
    setIsSpeaking(false);
  };

  const resumeVoiceConversation = () => {
    voicePausedRef.current = false;
    setIsVoicePaused(false);
    resetTranscript();
    const pendingSpeech = pendingSpeechRef.current;
    if (pendingSpeech) {
      pendingSpeechRef.current = null;
      speak(pendingSpeech.message, pendingSpeech.listenAfter);
      return;
    }
    void startListening();
  };

  useEffect(() => {
    let isMounted = true;

    const prepareVoice = async () => {
      const voices = await Speech.getAvailableVoicesAsync();
      if (!isMounted) return;

      const koreanVoices = voices.filter((voice) =>
        voice.language.toLowerCase().startsWith("ko"),
      );
      const adultMaleVoice = koreanVoices.find((voice) =>
        /male|남성/i.test(`${voice.name} ${voice.identifier}`),
      );
      const enhancedVoice = koreanVoices.find(
        (voice) => voice.quality === Speech.VoiceQuality.Enhanced,
      );

      voiceIdentifier.current = (
        adultMaleVoice ??
        enhancedVoice ??
        koreanVoices[0]
      )?.identifier;
    };

    prepareVoice();

    return () => {
      isMounted = false;
      requestVersion.current += 1;
      speechRunIdRef.current += 1;
      Speech.stop();
    };
  }, []);

  const appendMessage = (
    role: Message["role"],
    text: string,
    intentResult?: IntentAnalyzeResponse,
    messageContextResult?: ContextAnalyzeResponse,
    fdsResult?: FdsAnalyzeResponse,
    transferPreview?: TransferPreview,
    balancePreview?: BalancePreview,
    transactionHistory?: TransactionResponse[],
  ) => {
    const id = nextMessageId.current++;
    setMessages((current) => [
      ...current,
      {
        id,
        role,
        text,
        intentResult,
        contextResult: messageContextResult,
        fdsResult,
        transferPreview,
        balancePreview,
        transactionHistory,
      },
    ]);
    if (role === "assistant") {
      lastAssistantAtRef.current = Date.now();
      void ensureSession()
        .then((sessionId) => saveAiAssistantMessage(sessionId, text))
        .catch((error) =>
          console.warn("[AI assistant message save failed]", error),
        );
    }
    return id;
  };

  const persistUserMessage = async (
    content: string,
    mode: InputMode,
    voiceDurationMs: number | null = null,
  ) => {
    const now = Date.now();
    const responseDelayMs =
      lastAssistantAtRef.current === null
        ? null
        : Math.max(0, now - lastAssistantAtRef.current);
    const isVoice = mode === "voice";
    const durationSeconds =
      voiceDurationMs && voiceDurationMs > 0 ? voiceDurationMs / 1000 : null;
    const spokenUnits = content.replace(/\s+/g, "").length;

    try {
      const sessionId = await ensureSession();
      const saved = await saveAiUserMessage(sessionId, {
        inputType: isVoice ? "VOICE" : "CHAT",
        content,
        behavior: {
          responseDelayMs,
          typingDurationMs:
            isVoice || typingStartedAtRef.current === null
              ? null
              : Math.max(0, now - typingStartedAtRef.current),
          editCount: isVoice ? 0 : editCountRef.current,
          fullDeleteCount: isVoice ? 0 : fullDeleteCountRef.current,
          typingPauseCount: isVoice ? 0 : typingPauseCountRef.current,
          answerReversalCount: 0,
          confusionCount: 0,
          reexplanationCount: 0,
        },
        voiceCondition: isVoice
          ? {
              speechDurationMs: voiceDurationMs,
              speechRate: durationSeconds
                ? spokenUnits / durationSeconds
                : null,
              avgPauseDurationMs: lastAvgPauseDurationRef.current,
              longPauseCount: lastLongPauseCountRef.current,
            }
          : null,
      });
      console.log("[AI user message saved]", saved);
    } catch (error) {
      console.warn("[AI user message save failed]", error);
    }

    typingStartedAtRef.current = null;
    lastTypingAtRef.current = null;
    editCountRef.current = 0;
    fullDeleteCountRef.current = 0;
    typingPauseCountRef.current = 0;
    lastVoiceDurationRef.current = null;
    lastAvgPauseDurationRef.current = null;
    lastLongPauseCountRef.current = 0;
  };

  const handleDraftChange = (text: string) => {
    const now = Date.now();
    if (typingStartedAtRef.current === null && text.length > 0) {
      typingStartedAtRef.current = now;
    }
    if (
      lastTypingAtRef.current !== null &&
      now - lastTypingAtRef.current >= 2000
    ) {
      typingPauseCountRef.current += 1;
    }
    if (text.length < draft.length) editCountRef.current += 1;
    if (draft.length > 0 && text.length === 0) fullDeleteCountRef.current += 1;
    lastTypingAtRef.current = now;
    setDraft(text);
  };

  const formatAiReply = (result: IntentAnalyzeResponse) => {
    if (result.intent === "TRANSFER") {
      if (result.recipientKeyword && result.amount !== null) {
        return "송금 내용을 확인해 주세요.";
      }
      if (result.recipientKeyword) {
        return `${result.recipientKeyword}에게 얼마를 보내실까요?`;
      }
      if (result.amount !== null) {
        return `${result.amount.toLocaleString("ko-KR")}원을 누구에게 보내실까요?`;
      }
      return "누구에게 얼마를 보내실까요?";
    }
    if (result.intent === "BALANCE_CHECK") {
      return "연결된 계좌의 잔액을 확인할게요.";
    }
    if (result.intent === "TRANSACTION_HISTORY") {
      return "최근 거래내역을 확인할게요.";
    }
    return "말씀하신 내용을 정확히 이해하지 못했어요. 다시 말씀해 주세요.";
  };

  const loadAccountInquiry = async (
    intent: "BALANCE_CHECK" | "TRANSACTION_HISTORY",
    intentResult?: IntentAnalyzeResponse,
  ) => {
    if (intent === "BALANCE_CHECK") {
      const account = await getMainAccount();
      const balanceResult = await getAccountBalance(account.accountId);
      const reply = `현재 잔액은 ${balanceResult.balance.toLocaleString("ko-KR")}원이에요.`;
      appendMessage(
        "assistant",
        reply,
        intentResult,
        undefined,
        undefined,
        undefined,
        { account, balance: balanceResult.balance },
      );
      speak(reply, true);
      return;
    }

    const transactions = (await getTransactions())
      .slice()
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      )
      .slice(0, 5);
    const reply = transactions.length
      ? `최근 거래내역 ${transactions.length}건을 보여드릴게요.`
      : "최근 거래내역이 없어요.";
    appendMessage(
      "assistant",
      reply,
      intentResult,
      undefined,
      undefined,
      undefined,
      undefined,
      transactions,
    );
    speak(reply, true);
  };

  const parseYesNoAnswer = (text: string) => {
    const answer = text
      .trim()
      .toLowerCase()
      .replace(/[.,!?~…]/g, " ")
      .replace(/\s+/g, " ");

    if (
      /(^| )(아니|아니야|아니요|아뇨|아녀|싫어|싫어요|안 돼|안돼|취소|틀려|틀렸어|그만)( |$)/.test(
        answer,
      ) ||
      /없어요|없어|않았|안 했|안했/.test(answer)
    )
      return false;
    if (
      /(^| )(네|넵|예|응|엉|어|맞아|맞아요|그래|그래요|좋아|좋아요|해 줘|해주세요|진행해)( |$)/.test(
        answer,
      ) ||
      /그게 맞|맞습니다|응 맞|어 맞/.test(answer)
    )
      return true;
    return null;
  };

  const findSingleRecipient = (recipients: Recipient[], keyword: string) => {
    const exact = recipients.filter(
      (recipient) =>
        recipient.aliasName === keyword || recipient.recipientName === keyword,
    );
    return exact.length === 1
      ? exact[0]
      : recipients.length === 1
        ? recipients[0]
        : null;
  };

  const requestFdsAnalysis = async (
    result: ContextAnalyzeResponse,
    _answers: FollowUpAnswer[],
  ) => {
    const transfer = transferIntentRef.current;
    const recipient = transferRecipientRef.current;
    if (!transfer?.amount || !recipient) {
      throw new Error("송금 정보가 준비되지 않았습니다.");
    }

    const senderAccount = transferSenderAccountRef.current;
    if (!senderAccount) throw new Error("출금계좌가 준비되지 않았습니다.");
    const created = await createTransfer({
      senderAccountId: senderAccount.accountId,
      receiverAccountId: null,
      receiverBankCode: recipient.bankCode,
      receiverAccountNumber: recipient.accountNumber,
      receiverName: recipient.recipientName,
      amount: transfer.amount,
      purpose: purposeTextRef.current,
    });
    console.log("[AI transfer created]", created);
    transactionIdRef.current = created.transactionId;
    console.log(
      "[AI transfer recipient confirmed]",
      await confirmTransferRecipient(created.transactionId),
    );
    console.log(
      "[AI transfer amount confirmed]",
      await confirmTransferAmount(created.transactionId),
    );
    const checked = await checkTransferFds(created.transactionId);
    console.log("[AI transfer FDS checked]", checked);
    const fdsResult: FdsAnalyzeResponse = {
      ...checked.fds,
      hardRuleTriggered: false,
      combinationRuleTriggered: false,
      triggeredRules: [],
      contextAnalysisSucceeded: true,
    };
    console.log("[AI FDS response]", fdsResult);
    const requiresGuardian = requiresGuardianReview(fdsResult);
    const reply = requiresGuardian
      ? "위험한 거래로 판단되어 송금을 멈췄어요. 보호자 확인이 필요합니다."
      : fdsResult.recommendedAction === "RECONFIRM" ||
          fdsResult.riskLevel === "CAUTION"
        ? "주의가 필요한 송금이에요. 내용을 다시 확인하고 송금할까요?"
        : "마지막으로 확인할게요. 이대로 송금할까요?";
    const fdsMessageId = appendMessage(
      "assistant",
      reply,
      undefined,
      result,
      fdsResult,
    );
    changeConversationStep("result");
    if (requiresGuardian) {
      waitingFdsMessageIdRef.current = fdsMessageId;
      setWaitingGuardianTransactionId(created.transactionId);
    }
    speak(reply, !requiresGuardian);
  };

  useEffect(() => {
    if (waitingGuardianTransactionId === null) return;

    let requestInFlight = false;
    const checkGuardianStatus = async () => {
      if (requestInFlight || !isScreenFocusedRef.current) return;
      requestInFlight = true;
      try {
        const transfer = await getTransfer(waitingGuardianTransactionId);
        if (transfer.status === "GUARDIAN_APPROVED") {
          const waitingMessageId = waitingFdsMessageIdRef.current;
          setWaitingGuardianTransactionId(null);
          setMessages((current) =>
            current.map((message) =>
              message.id === waitingMessageId
                ? {
                    ...message,
                    text: "보호자가 승인했어요. 마지막으로 이대로 송금할까요?",
                    guardianApproved: true,
                  }
                : message,
            ),
          );
          changeConversationStep("result");
          speak("보호자가 승인했어요. 마지막으로 이대로 송금할까요?", true);
        } else if (
          transfer.status === "GUARDIAN_REJECTED" ||
          transfer.status === "CANCELLED"
        ) {
          setWaitingGuardianTransactionId(null);
          waitingFdsMessageIdRef.current = null;
          transactionIdRef.current = null;
          changeConversationStep("intent");
          const reply = "보호자가 거래를 거절해 송금이 취소됐어요.";
          appendMessage("assistant", reply);
          speak(reply, true);
        }
      } catch (error) {
        console.warn("[AI guardian status check failed]", error);
      } finally {
        requestInFlight = false;
      }
    };

    void checkGuardianStatus();
    const intervalId = setInterval(checkGuardianStatus, 5000);
    return () => clearInterval(intervalId);
  }, [waitingGuardianTransactionId]);

  const submitMessage = async (
    text: string,
    requestedIntentHint?: IntentHint,
  ) => {
    const normalizedText = text.trim();
    if (!normalizedText || isProcessing) return;

    Speech.stop();
    appendMessage("user", normalizedText);
    const messageSavePromise = persistUserMessage(
      normalizedText,
      inputMode ?? "chat",
      inputMode === "voice" ? lastVoiceDurationRef.current : null,
    );
    setDraft("");
    resetTranscript();
    setIsProcessing(true);
    const currentRequestVersion = ++requestVersion.current;

    try {
      await messageSavePromise;
      if (currentRequestVersion !== requestVersion.current) return;
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((message) => message.role === "assistant");
      const currentStep =
        lastAssistantMessage?.text === TRANSFER_PURPOSE_QUESTION
          ? "purpose"
          : conversationStepRef.current;
      console.log("[AI submit route]", {
        step: currentStep,
        text: normalizedText,
      });

      if (currentStep === "transfer-confirm") {
        const answer = parseYesNoAnswer(normalizedText);
        if (answer === null) {
          const reply = "맞으면 네, 아니면 아니요라고 말씀해 주세요.";
          appendMessage("assistant", reply);
          speak(reply, true);
          return;
        }

        const transferCard = [...messages]
          .reverse()
          .find((message) => message.transferPreview);
        if (transferCard) {
          setHandledCardIds((current) =>
            current.includes(transferCard.id)
              ? current
              : [...current, transferCard.id],
          );
        }

        if (answer) {
          changeConversationStep("purpose");
          appendMessage("assistant", TRANSFER_PURPOSE_QUESTION);
          speak(TRANSFER_PURPOSE_QUESTION, true);
        } else {
          transferIntentRef.current = null;
          transferRecipientRef.current = null;
          transferSenderAccountRef.current = null;
          changeConversationStep("intent");
          const reply = "알겠어요. 받는 분과 금액을 다시 말씀해 주세요.";
          appendMessage("assistant", reply);
          speak(reply, true);
        }
      } else if (currentStep === "purpose") {
        purposeTextRef.current = normalizedText;
        const result = await analyzeContext(normalizedText);
        if (currentRequestVersion !== requestVersion.current) return;
        console.log("[AI context response]", result);

        if (!result.analysisSucceeded) {
          const reply = "송금 이유를 분석하지 못했어요. 다시 말씀해 주세요.";
          appendMessage("assistant", reply);
          speak(reply, true);
        } else if (
          result.requiresFollowUp &&
          result.followUpQuestions.length > 0
        ) {
          setContextResult(result);
          setFollowUpIndex(0);
          followUpAnswersRef.current = [];
          changeConversationStep("follow-up");
          const question = result.followUpQuestions[0].questionText;
          appendMessage("assistant", question);
          speak(question, true);
        } else {
          await requestFdsAnalysis(result, []);
        }
      } else if (currentStep === "follow-up" && contextResult) {
        const currentQuestion = contextResult.followUpQuestions[followUpIndex];
        const answer = parseYesNoAnswer(normalizedText);
        if (answer === null) {
          const reply = "네 또는 아니요로 답해 주세요.";
          appendMessage("assistant", reply);
          speak(reply, true);
          return;
        }
        const updatedAnswers = currentQuestion
          ? [
              ...followUpAnswersRef.current,
              {
                code: currentQuestion.code,
                questionText: currentQuestion.questionText,
                answer,
                answerText: normalizedText,
              },
            ]
          : followUpAnswersRef.current;
        followUpAnswersRef.current = updatedAnswers;
        console.log("[AI follow-up answers]", updatedAnswers);

        const nextIndex = followUpIndex + 1;
        if (nextIndex < contextResult.followUpQuestions.length) {
          setFollowUpIndex(nextIndex);
          const question =
            contextResult.followUpQuestions[nextIndex].questionText;
          appendMessage("assistant", question);
          speak(question, true);
        } else {
          await requestFdsAnalysis(contextResult, updatedAnswers);
        }
      } else if (currentStep === "result") {
        const answer = parseYesNoAnswer(normalizedText);
        const finalConfirmation = [...messages]
          .reverse()
          .find((message) => message.fdsResult);

        if (answer === null || !finalConfirmation) {
          const reply = "송금하려면 네, 취소하려면 아니요라고 말씀해 주세요.";
          appendMessage("assistant", reply);
          speak(reply, true);
          return;
        }

        await handleFdsCard(
          finalConfirmation.id,
          answer ? "continue" : "cancel",
          false,
        );
      } else {
        const result = await analyzeIntent(
          normalizedText,
          requestedIntentHint ?? intentHint,
        );
        if (currentRequestVersion !== requestVersion.current) return;
        console.log("[AI intent response]", result);
        const reply = formatAiReply(result);
        if (
          result.intent === "BALANCE_CHECK" ||
          result.intent === "TRANSACTION_HISTORY"
        ) {
          await loadAccountInquiry(result.intent, result);
        } else if (
          result.intent === "TRANSFER" &&
          result.recipientKeyword &&
          result.amount !== null
        ) {
          const [recipients, senderAccount] = await Promise.all([
            searchRecipients(result.recipientKeyword),
            getMainAccount(),
          ]);
          if (currentRequestVersion !== requestVersion.current) return;
          const recipient = findSingleRecipient(
            recipients,
            result.recipientKeyword,
          );
          if (!recipient) {
            const notFound = `${result.recipientKeyword}님이 누구인지 찾지 못했어요. 등록된 받는 분을 확인해 주세요.`;
            appendMessage("assistant", notFound);
            speak(notFound, true);
            return;
          }
          appendMessage("assistant", reply, result, undefined, undefined, {
            recipient,
            senderAccount,
          });
          transferIntentRef.current = result;
          transferRecipientRef.current = recipient;
          transferSenderAccountRef.current = senderAccount;
          changeConversationStep("transfer-confirm");
          speak(reply, true);
        } else {
          appendMessage("assistant", reply, result);
          speak(reply, true);
        }
      }
    } catch (error) {
      if (currentRequestVersion !== requestVersion.current) return;
      console.warn("[AI request failed]", error);
      const errorMessage =
        "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";
      appendMessage("assistant", errorMessage);
      speak(errorMessage, true);
    } finally {
      if (currentRequestVersion === requestVersion.current)
        setIsProcessing(false);
    }
  };

  const finishListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const finishedAt = Date.now();
    if (lastVoiceResultAtRef.current !== null) {
      const finalGap = finishedAt - lastVoiceResultAtRef.current;
      if (finalGap >= PAUSE_THRESHOLD_MS) {
        voicePauseDurationsRef.current.push(finalGap);
      }
    }
    const pauses = voicePauseDurationsRef.current;
    lastAvgPauseDurationRef.current =
      pauses.length > 0
        ? Math.round(
            pauses.reduce((sum, pause) => sum + pause, 0) / pauses.length,
          )
        : 0;
    lastLongPauseCountRef.current = pauses.filter(
      (pause) => pause >= LONG_PAUSE_THRESHOLD_MS,
    ).length;
    lastVoiceDurationRef.current =
      voiceStartedAtRef.current === null
        ? null
        : Math.max(0, finishedAt - voiceStartedAtRef.current);
    voiceStartedAtRef.current = null;
    shouldSubmitVoiceRef.current = true;
    stopSpeechRecognition();
  };

  useEffect(() => {
    if (
      inputMode !== "voice" ||
      isVoicePaused ||
      isListening ||
      (isSpeaking && !allowSpeechInterruptionRef.current) ||
      (!isProcessing && !isSpeaking)
    ) {
      return;
    }

    shouldSubmitVoiceRef.current = false;
    lastVoiceResultAtRef.current = null;
    voicePauseDurationsRef.current = [];
    lastAvgPauseDurationRef.current = null;
    lastLongPauseCountRef.current = 0;
    void startSpeechRecognition().then((started) => {
      if (started) voiceStartedAtRef.current = Date.now();
    });
  }, [inputMode, isListening, isProcessing, isSpeaking, isVoicePaused]);

  useEffect(() => {
    if (!allowSpeechInterruptionRef.current || !isListening || !liveTranscript)
      return;

    if (isProcessing) {
      requestVersion.current += 1;
      setIsProcessing(false);
    }
    if (isSpeaking) {
      speechRunIdRef.current += 1;
      activeSpeechRef.current = null;
      pendingSpeechRef.current = null;
      Speech.stop();
      setIsSpeaking(false);
    }
  }, [isListening, isProcessing, isSpeaking, liveTranscript]);

  useEffect(() => {
    if (!allowSpeechInterruptionRef.current || !isListening || !liveTranscript)
      return;

    const now = Date.now();
    if (lastVoiceResultAtRef.current !== null) {
      const gap = now - lastVoiceResultAtRef.current;
      if (gap >= PAUSE_THRESHOLD_MS) {
        voicePauseDurationsRef.current.push(gap);
      }
    }
    lastVoiceResultAtRef.current = now;
  }, [isListening, liveTranscript]);

  useEffect(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (!allowSpeechInterruptionRef.current || !isListening || !liveTranscript)
      return;

    silenceTimerRef.current = setTimeout(
      finishListening,
      AUTO_SUBMIT_SILENCE_MS,
    );

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isListening, liveTranscript]);

  useEffect(() => {
    if (!shouldSubmitVoiceRef.current || isListening) return;

    shouldSubmitVoiceRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const recognizedText = (finalTranscript || liveTranscript).trim();
    if (recognizedText) {
      submitMessage(recognizedText);
      return;
    }

    const reply = "말씀을 듣지 못했어요. 다시 말씀해 주세요.";
    appendMessage("assistant", reply);
    speak(reply, true);
  }, [finalTranscript, isListening, liveTranscript]);

  const selectChat = () => {
    voicePausedRef.current = false;
    setIsVoicePaused(false);
    pendingSpeechRef.current = null;
    speechRunIdRef.current += 1;
    Speech.stop();
    setIsSpeaking(false);
    inputModeRef.current = "chat";
    setInputMode("chat");
    speak("무엇을 도와드릴까요?");
  };

  const selectVoice = () => {
    voicePausedRef.current = false;
    setIsVoicePaused(false);
    cancelListening();
    resetTranscript();
    inputModeRef.current = "voice";
    setInputMode("voice");
    speak("무엇을 도와드릴까요?", true);
  };

  const handleQuickStart = async (label: string, hint?: IntentHint) => {
    if (hint === "TRANSFER") {
      submitMessage(label, hint);
      return;
    }

    appendMessage("user", label);
    await persistUserMessage(label, "chat");
    if (hint === "BALANCE_CHECK" || hint === "TRANSACTION_HISTORY") {
      setIsProcessing(true);
      try {
        await loadAccountInquiry(hint);
      } catch (error) {
        console.warn("[AI account inquiry failed]", error);
        const reply =
          "통장 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
        appendMessage("assistant", reply);
        speak(reply, true);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const resetConversation = () => {
    const previousSession = sessionPromiseRef.current;
    sessionPromiseRef.current = null;
    if (previousSession) {
      void previousSession
        .then((sessionId) => endAiSession(sessionId))
        .catch((error) => console.warn("[AI session end failed]", error));
    }
    void startSession().catch((error) =>
      console.warn("[AI session create failed]", error),
    );
    requestVersion.current += 1;
    speechRunIdRef.current += 1;
    Speech.stop();
    setIsSpeaking(false);
    voicePausedRef.current = false;
    setIsVoicePaused(false);
    activeSpeechRef.current = null;
    pendingSpeechRef.current = null;
    setMessages([]);
    setHandledCardIds([]);
    setHandledFdsCardIds([]);
    setWaitingGuardianTransactionId(null);
    setDraft("");
    shouldSubmitVoiceRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    cancelListening();
    resetTranscript();
    setIsProcessing(false);
    inputModeRef.current = null;
    setInputMode(null);
    changeConversationStep("intent");
    setContextResult(null);
    setFollowUpIndex(0);
    followUpAnswersRef.current = [];
    transferIntentRef.current = null;
    transferRecipientRef.current = null;
    transferSenderAccountRef.current = null;
    transactionIdRef.current = null;
    waitingFdsMessageIdRef.current = null;
    purposeTextRef.current = "";
    setIsResetModalVisible(false);
  };

  const confirmResetConversation = () => {
    Speech.stop();
    setIsResetModalVisible(true);
  };

  const handleTransferCard = async (messageId: number, confirmed: boolean) => {
    if (handledCardIds.includes(messageId)) return;

    setHandledCardIds((current) => [...current, messageId]);
    if (confirmed) {
      const selected = messages.find((message) => message.id === messageId);
      if (!selected?.intentResult || !selected.transferPreview) return;
      transferIntentRef.current = selected.intentResult;
      transferRecipientRef.current = selected.transferPreview.recipient;
      transferSenderAccountRef.current = selected.transferPreview.senderAccount;
    }
    const answer = confirmed ? "맞아요" : "아니요";
    appendMessage("user", answer);
    await persistUserMessage(answer, "chat");

    const reply = confirmed
      ? TRANSFER_PURPOSE_QUESTION
      : "받는 분과 금액을 다시 말씀해 주세요.";
    changeConversationStep(confirmed ? "purpose" : "intent");
    appendMessage("assistant", reply);
    speak(reply, true);
  };

  const handleFdsCard = async (
    messageId: number,
    action: "continue" | "cancel",
    recordAnswer = true,
  ) => {
    if (handledFdsCardIds.includes(messageId)) return;

    setHandledFdsCardIds((current) => [...current, messageId]);

    const userText =
      action === "continue" ? "송금할게요." : "송금을 취소할게요.";

    if (recordAnswer) {
      appendMessage("user", userText);
      await persistUserMessage(userText, "chat");
    }
    const transactionId = transactionIdRef.current;
    let reply: string;
    try {
      if (!transactionId) throw new Error("송금 번호가 없습니다.");
      if (action === "continue") {
        const fdsMessage = messages.find((message) => message.id === messageId);
        const fds = fdsMessage?.fdsResult;
        const requiresGuardian = fds ? requiresGuardianReview(fds) : true;
        if (requiresGuardian && !fdsMessage?.guardianApproved) {
          reply = "보호자 확인 전에는 이 송금을 진행할 수 없어요.";
        } else {
          await finalConfirmTransfer(transactionId);
          const completed = await completeTransfer(transactionId);
          reply = `${completed.receiverName}님에게 ${completed.amount.toLocaleString("ko-KR")}원을 보냈어요.`;
          setWaitingGuardianTransactionId(null);
          waitingFdsMessageIdRef.current = null;
        }
      } else {
        await cancelTransfer(transactionId);
        reply = "알겠어요. 이번 송금은 취소했어요.";
        setWaitingGuardianTransactionId(null);
        waitingFdsMessageIdRef.current = null;
      }
    } catch (error) {
      console.warn("[AI transfer action failed]", error);
      reply =
        "송금을 처리하지 못했어요. 계좌 상태를 확인한 뒤 다시 시도해 주세요.";
    }
    appendMessage("assistant", reply);
    speak(reply);
  };

  const hasConversation =
    messages.length > 0 || liveTranscript.trim().length > 0 || isProcessing;
  const voiceStatusLabel = isVoicePaused
    ? "대화를 멈췄어요"
    : isSpeaking
      ? "답변하고 있어요"
      : isProcessing
        ? "답변을 준비하고 있어요"
        : isListening
          ? "듣고 있어요"
          : "말씀하세요";

  useEffect(() => {
    if (
      inputMode !== "voice" ||
      !hasConversation ||
      previousVoiceStatusRef.current === null
    ) {
      previousVoiceStatusRef.current = voiceStatusLabel;
      return;
    }
    if (previousVoiceStatusRef.current !== voiceStatusLabel) {
      previousVoiceStatusRef.current = voiceStatusLabel;
      if (Platform.OS !== "web") Vibration.vibrate(20);
    }
  }, [hasConversation, inputMode, voiceStatusLabel]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.screenContent}>
        <View style={styles.header}>
          <Text style={styles.title}>AI 금융비서</Text>
          {inputMode !== null && !isListening && !isProcessing && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="대화 다시 시작"
              onPress={confirmResetConversation}
              style={({ pressed }) => [
                styles.newChatButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.newChatButtonText}>다시 시작</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.conversation,
            !hasConversation && styles.emptyConversation,
          ]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
        >
          {!hasConversation && (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>
                {inputMode === null
                  ? "어떤 방식으로\n대화할까요?"
                  : "무엇을 도와드릴까요?"}
              </Text>
              {inputMode !== null && (
                <View style={styles.quickStartSection}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleQuickStart("돈 보내기", "TRANSFER")}
                    style={({ pressed }) => [
                      styles.quickStartCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.quickStartCardText}>돈 보내기</Text>
                    <Text style={styles.quickStartArrow}>›</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      handleQuickStart("최근 거래 내역", "TRANSACTION_HISTORY")
                    }
                    style={({ pressed }) => [
                      styles.quickStartCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.quickStartCardText}>
                      최근 거래 내역
                    </Text>
                    <Text style={styles.quickStartArrow}>›</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      handleQuickStart("통장 잔액", "BALANCE_CHECK")
                    }
                    style={({ pressed }) => [
                      styles.quickStartCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.quickStartCardText}>통장 잔액</Text>
                    <Text style={styles.quickStartArrow}>›</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === "user"
                  ? styles.userBubble
                  : styles.assistantBubble,
                message.role === "assistant" &&
                  message.intentResult?.intent === "TRANSFER" &&
                  message.intentResult.recipientKeyword &&
                  message.intentResult.amount !== null &&
                  styles.transferBubble,
                message.role === "assistant" &&
                  message.contextResult &&
                  styles.contextBubble,
                message.role === "assistant" &&
                  (message.balancePreview || message.transactionHistory) &&
                  styles.inquiryBubble,
                message.role === "assistant" &&
                  /님에게 .*원을 보냈어요\.$/.test(message.text) &&
                  styles.transferCompleteBubble,
              ]}
            >
              {message.role === "assistant" && (
                <Text style={styles.assistantLabel}>든든</Text>
              )}
              {message.role === "assistant" && message.balancePreview ? (
                <View style={styles.inquiryCard}>
                  <View style={styles.inquiryTitleRow}>
                    <Ionicons color="#146C54" name="wallet" size={25} />
                    <Text style={styles.inquiryTitle}>통장 잔액</Text>
                  </View>
                  <Text style={styles.inquiryAccountName}>
                    {message.balancePreview.account.accountName}
                  </Text>
                  <Text style={styles.inquiryAccountNumber}>
                    {message.balancePreview.account.bankCode} {"  "}
                    {formatAccountNumber(
                      message.balancePreview.account.accountNumber,
                    )}
                  </Text>
                  <Text style={styles.balanceResultLabel}>현재 잔액</Text>
                  <Text style={styles.balanceResultAmount}>
                    {message.balancePreview.balance.toLocaleString("ko-KR")}원
                  </Text>
                </View>
              ) : message.role === "assistant" && message.transactionHistory ? (
                <View style={styles.inquiryCard}>
                  <View style={styles.inquiryTitleRow}>
                    <Ionicons color="#146C54" name="receipt" size={25} />
                    <Text style={styles.inquiryTitle}>최근 거래내역</Text>
                  </View>
                  {message.transactionHistory.length === 0 ? (
                    <Text style={styles.emptyHistoryText}>
                      최근 거래내역이 없어요.
                    </Text>
                  ) : (
                    message.transactionHistory.map((transaction, index) => (
                      <View
                        key={transaction.transactionId}
                        style={[
                          styles.historyRow,
                          index === message.transactionHistory!.length - 1 &&
                            styles.historyLastRow,
                        ]}
                      >
                        <View style={styles.historyInfo}>
                          <Text style={styles.historyName}>
                            {transaction.receiverName}
                          </Text>
                          <Text style={styles.historyMeta}>
                            {formatTransactionDate(transaction.createdAt)} ·{" "}
                            {getTransactionStatusText(transaction.status)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.historyAmount,
                            transaction.status === "CANCELLED" &&
                              styles.cancelledHistoryAmount,
                          ]}
                        >
                          {transaction.status === "CANCELLED" ? "" : "-"}
                          {transaction.amount.toLocaleString("ko-KR")}원
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              ) : message.role === "assistant" && message.fdsResult ? (
                <View style={styles.contextCard}>
                  <View
                    style={[
                      styles.contextBadge,
                      message.guardianApproved
                        ? styles.approvedBadge
                        : requiresGuardianReview(message.fdsResult)
                          ? styles.riskBadge
                          : message.fdsResult.recommendedAction ===
                                "RECONFIRM" ||
                              message.fdsResult.riskLevel === "CAUTION"
                            ? styles.cautionBadge
                            : styles.safeBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.contextBadgeText,
                        message.guardianApproved
                          ? styles.approvedBadgeText
                          : requiresGuardianReview(message.fdsResult)
                            ? styles.riskBadgeText
                            : message.fdsResult.recommendedAction ===
                                  "RECONFIRM" ||
                                message.fdsResult.riskLevel === "CAUTION"
                              ? styles.cautionBadgeText
                              : styles.safeBadgeText,
                      ]}
                    >
                      {getFdsBadgeText(
                        message.fdsResult,
                        message.guardianApproved,
                      )}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.contextTitle,
                      message.guardianApproved
                        ? styles.safeTitle
                        : requiresGuardianReview(message.fdsResult)
                          ? styles.riskTitle
                          : message.fdsResult.recommendedAction ===
                                "RECONFIRM" ||
                              message.fdsResult.riskLevel === "CAUTION"
                            ? styles.cautionTitle
                            : styles.finalConfirmTitle,
                    ]}
                  >
                    {message.text}
                  </Text>
                  {(requiresGuardianReview(message.fdsResult) ||
                    message.fdsResult.recommendedAction === "RECONFIRM" ||
                    message.fdsResult.riskLevel === "CAUTION") &&
                    message.fdsResult.reasons.map((reason, index) => (
                      <View
                        key={`${message.id}-fds-reason-${index}`}
                        style={styles.reasonRow}
                      >
                        <Text style={styles.reasonDot}>•</Text>
                        <Text style={styles.reasonText}>{reason}</Text>
                      </View>
                    ))}
                  {requiresGuardianReview(message.fdsResult) &&
                    !message.guardianApproved && (
                      <View style={styles.riskNotice}>
                        <Text style={styles.riskNoticeText}>
                          보호자가 확인하기 전에는 송금을 진행할 수 없어요.
                        </Text>
                      </View>
                    )}
                  {inputMode === "chat" &&
                    !handledFdsCardIds.includes(message.id) && (
                      <View style={styles.resultActions}>
                        {(!requiresGuardianReview(message.fdsResult) ||
                          message.guardianApproved) && (
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              handleFdsCard(message.id, "continue")
                            }
                            style={({ pressed }) => [
                              styles.resultPrimaryButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.resultPrimaryButtonText}>
                              송금하기
                            </Text>
                          </Pressable>
                        )}
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => handleFdsCard(message.id, "cancel")}
                          style={({ pressed }) => [
                            styles.resultCancelButton,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={styles.resultCancelButtonText}>
                            송금 취소
                          </Text>
                        </Pressable>
                      </View>
                    )}
                </View>
              ) : message.role === "assistant" && message.contextResult ? (
                <View style={styles.contextCard}>
                  <View
                    style={[
                      styles.contextBadge,
                      message.contextResult.suspicious
                        ? styles.riskBadge
                        : styles.safeBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.contextBadgeText,
                        message.contextResult.suspicious
                          ? styles.riskBadgeText
                          : styles.safeBadgeText,
                      ]}
                    >
                      {message.contextResult.suspicious
                        ? "송금 주의"
                        : "확인 완료"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.contextTitle,
                      message.contextResult.suspicious
                        ? styles.riskTitle
                        : styles.safeTitle,
                    ]}
                  >
                    {message.contextResult.suspicious
                      ? "주의가 필요한 거래예요"
                      : "위험한 표현은 발견되지 않았어요"}
                  </Text>
                  {message.contextResult.contextReasons.map((reason, index) => (
                    <View
                      key={`${message.id}-reason-${index}`}
                      style={styles.reasonRow}
                    >
                      <Text style={styles.reasonDot}>•</Text>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                  {message.contextResult.suspicious && (
                    <View style={styles.riskNotice}>
                      <Text style={styles.riskNoticeText}>
                        지금은 송금을 진행하지 않는 것이 안전해요.
                      </Text>
                    </View>
                  )}
                </View>
              ) : message.role === "assistant" &&
                message.intentResult?.intent === "TRANSFER" &&
                message.intentResult.recipientKeyword &&
                message.intentResult.amount !== null &&
                message.transferPreview ? (
                <View style={styles.transferCard}>
                  <View style={styles.transferConfirmationContent}>
                    <Text style={styles.cardQuestion}>
                      송금 내용을 확인해 주세요
                    </Text>
                    <View
                      style={[styles.partySection, styles.recipientSection]}
                    >
                      <View style={styles.partyLabelRow}>
                        <Ionicons
                          color="#146C54"
                          name="arrow-down-circle"
                          size={24}
                        />
                        <Text style={[styles.cardLabel, styles.recipientLabel]}>
                          받는 분
                        </Text>
                      </View>
                      <Text style={styles.cardValue}>
                        {message.transferPreview.recipient.recipientName}
                      </Text>
                      <Text style={styles.cardDetail}>
                        {message.transferPreview.recipient.bankCode}
                      </Text>
                      <Text style={styles.cardDetail}>
                        {message.transferPreview.recipient.accountNumber}
                      </Text>
                    </View>
                    <View style={styles.cardAmountRow}>
                      <Text style={styles.cardAmountLabel}>보낼 금액</Text>
                      <Text style={styles.cardAmount}>
                        {message.intentResult.amount.toLocaleString("ko-KR")}원
                      </Text>
                    </View>
                    <View style={[styles.partySection, styles.senderSection]}>
                      <View style={styles.partyLabelRow}>
                        <Ionicons
                          color="#405C52"
                          name="arrow-up-circle"
                          size={24}
                        />
                        <Text style={[styles.cardLabel, styles.senderLabel]}>
                          보내는 계좌
                        </Text>
                      </View>
                      <Text style={styles.cardValue}>
                        {message.transferPreview.senderAccount.accountName}
                      </Text>
                      <Text style={styles.cardDetail}>
                        {message.transferPreview.senderAccount.bankCode}
                      </Text>
                      <Text style={styles.cardDetail}>
                        {message.transferPreview.senderAccount.accountNumber}
                      </Text>
                      <Text style={styles.cardBalance}>
                        잔액{" "}
                        {message.transferPreview.senderAccount.balance.toLocaleString(
                          "ko-KR",
                        )}
                        원
                      </Text>
                    </View>
                    {inputMode === "chat" &&
                      !handledCardIds.includes(message.id) && (
                        <View style={styles.cardActions}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              handleTransferCard(message.id, false)
                            }
                            style={({ pressed }) => [
                              styles.cardSecondaryButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text
                              adjustsFontSizeToFit
                              minimumFontScale={0.8}
                              numberOfLines={1}
                              style={styles.cardSecondaryButtonText}
                            >
                              아니요
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => handleTransferCard(message.id, true)}
                            style={({ pressed }) => [
                              styles.cardPrimaryButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.cardPrimaryButtonText}>
                              맞아요
                            </Text>
                          </Pressable>
                        </View>
                      )}
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    style={[
                      styles.messageText,
                      message.role === "user" && styles.userMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  {inputMode === "chat" &&
                    message.role === "assistant" &&
                    conversationStepRef.current === "follow-up" &&
                    contextResult?.followUpQuestions[followUpIndex]
                      ?.questionText === message.text && (
                      <View style={styles.followUpActions}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="네"
                          disabled={isProcessing}
                          onPress={() => submitMessage("네")}
                          style={({ pressed }) => [
                            styles.followUpYesButton,
                            isProcessing && styles.disabledButton,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={styles.followUpYesText}>네</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="아니요"
                          disabled={isProcessing}
                          onPress={() => submitMessage("아니요")}
                          style={({ pressed }) => [
                            styles.followUpNoButton,
                            isProcessing && styles.disabledButton,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={styles.followUpNoText}>아니요</Text>
                        </Pressable>
                      </View>
                    )}
                </View>
              )}
            </View>
          ))}

          {isListening && liveTranscript.trim().length > 0 && (
            <View
              style={[
                styles.messageBubble,
                styles.userBubble,
                styles.liveBubble,
              ]}
            >
              <Text style={styles.userLabel}>나</Text>
              <Text style={[styles.messageText, styles.userMessageText]}>
                {liveTranscript}
              </Text>
            </View>
          )}

          {inputMode === "voice" && speechRecognitionError && !isListening && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={styles.assistantLabel}>든든</Text>
              <Text style={styles.processingText}>
                {speechRecognitionError}
              </Text>
            </View>
          )}

          {isProcessing && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={styles.assistantLabel}>든든</Text>
              <Text style={styles.processingText}>
                내용을 확인하고 있어요 ···
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          {inputMode === null ? (
            <View style={styles.modeSelection}>
              <Pressable
                accessibilityRole="button"
                onPress={selectVoice}
                style={({ pressed }) => [
                  styles.selectionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.selectionButtonText}>음성으로 대화</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={selectChat}
                style={({ pressed }) => [
                  styles.selectionButton,
                  styles.secondarySelectionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.selectionButtonText,
                    styles.secondarySelectionText,
                  ]}
                >
                  채팅으로 대화
                </Text>
              </Pressable>
            </View>
          ) : inputMode === "voice" ? (
            <>
              <View
                accessibilityLabel={voiceStatusLabel}
                accessibilityLiveRegion="polite"
                style={[
                  styles.voiceStatus,
                  hasConversation && styles.compactVoiceStatus,
                ]}
              >
                {!hasConversation && (
                  <Text style={styles.voiceGuideText}>{voiceStatusLabel}</Text>
                )}
                <View
                  style={[
                    styles.voiceIndicator,
                    hasConversation && styles.compactVoiceIndicator,
                    isListening && styles.listeningIndicator,
                    isVoicePaused && styles.pausedIndicator,
                  ]}
                >
                  <Ionicons
                    color={colors.white}
                    name={
                      isVoicePaused
                        ? "pause"
                        : isSpeaking
                          ? "volume-high"
                          : isProcessing
                            ? "ellipsis-horizontal"
                            : "mic"
                    }
                    size={hasConversation ? 25 : 34}
                  />
                  {!hasConversation && (
                    <Text style={styles.voiceStatusText}>
                      {isVoicePaused
                        ? "멈춤"
                        : isSpeaking
                          ? "답변 중"
                          : isProcessing
                            ? "준비 중"
                            : isListening
                              ? "듣는 중"
                              : "말씀하세요"}
                    </Text>
                  )}
                </View>
                {hasConversation && (
                  <View style={styles.compactVoiceStatusContent}>
                    <Text style={styles.compactVoiceStatusText}>
                      {voiceStatusLabel}
                    </Text>
                    {isActivelyListening && (
                      <View accessibilityElementsHidden style={styles.waveform}>
                        {[0, 1, 2].map((bar) => (
                          <Animated.View
                            key={bar}
                            style={[
                              styles.waveformBar,
                              {
                                transform: [
                                  {
                                    scaleY: waveformProgress.interpolate({
                                      inputRange: [0, 1],
                                      outputRange:
                                        bar === 1 ? [0.45, 1] : [1, 0.45],
                                    }),
                                  },
                                ],
                              },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}
                <View
                  style={[
                    styles.voiceActionRow,
                    hasConversation && styles.compactVoiceActionRow,
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isVoicePaused
                        ? "음성 대화 계속하기"
                        : "음성 대화 잠시 멈춤"
                    }
                    disabled={isProcessing}
                    onPress={
                      isVoicePaused
                        ? resumeVoiceConversation
                        : pauseVoiceConversation
                    }
                    style={({ pressed }) => [
                      styles.voicePauseButton,
                      hasConversation && styles.compactVoicePauseButton,
                      isProcessing && styles.disabledButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      color={colors.primary}
                      name={isVoicePaused ? "play" : "pause"}
                      size={24}
                    />
                    <Text style={styles.voicePauseButtonText}>
                      {isVoicePaused
                        ? hasConversation
                          ? "계속"
                          : "대화 계속하기"
                        : hasConversation
                          ? "멈춤"
                          : "잠시 멈춤"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.chatRow}>
                <TextInput
                  accessibilityLabel="AI 금융비서 채팅 입력"
                  autoFocus
                  editable={!isProcessing}
                  multiline
                  onChangeText={handleDraftChange}
                  placeholder="내용을 입력해 주세요"
                  placeholderTextColor={colors.muted}
                  style={styles.chatInput}
                  value={draft}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="메시지 보내기"
                  disabled={!draft.trim() || isProcessing}
                  onPress={() => submitMessage(draft)}
                  style={({ pressed }) => [
                    styles.sendButton,
                    (!draft.trim() || isProcessing) && styles.disabledButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.sendButtonText}>전송</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsResetModalVisible(false)}
        transparent
        visible={isResetModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>↻</Text>
            </View>
            <Text style={styles.modalTitle}>대화를 다시 시작할까요?</Text>
            <Text style={styles.modalDescription}>
              지금까지 이야기한 내용은 사라져요.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={resetConversation}
              style={({ pressed }) => [
                styles.modalPrimaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalPrimaryButtonText}>다시 시작</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsResetModalVisible(false)}
              style={({ pressed }) => [
                styles.modalCancelButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalCancelButtonText}>계속 이야기하기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  screenContent: { flex: 1 },
  header: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.page,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: seniorTypography.pageTitle,
    lineHeight: 42,
    fontFamily: fonts.bold,
  },
  newChatButton: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#E8F4EF",
    paddingHorizontal: 14,
  },
  newChatButtonText: {
    color: colors.primary,
    fontSize: seniorTypography.caption,
    lineHeight: 26,
    fontFamily: fonts.semiBold,
  },
  conversation: {
    flexGrow: 1,
    gap: 14,
    paddingHorizontal: spacing.page,
    paddingTop: spacing.content,
    paddingBottom: spacing.item,
  },
  emptyConversation: { alignItems: "center", justifyContent: "center" },
  emptyContent: { width: "100%", alignItems: "center" },
  emptyTitle: {
    color: colors.text,
    fontSize: seniorTypography.pageTitle,
    lineHeight: 43,
    fontFamily: fonts.bold,
    textAlign: "center",
  },
  quickStartSection: { width: "100%", gap: 10, marginTop: 28 },
  quickStartCard: {
    width: "100%",
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#D7E8E1",
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  quickStartCardText: {
    color: colors.text,
    fontSize: seniorTypography.bodyStrong,
    lineHeight: 30,
    fontFamily: fonts.semiBold,
  },
  quickStartArrow: {
    color: colors.primary,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: fonts.semiBold,
  },
  messageBubble: {
    maxWidth: "88%",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 17,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
    backgroundColor: colors.white,
  },
  transferCompleteBubble: {
    backgroundColor: "#E7F6EF",
    borderWidth: 1,
    borderColor: "#B9E2D0",
  },
  transferBubble: {
    width: "100%",
    maxWidth: "100%",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  contextBubble: {
    width: "100%",
    maxWidth: "100%",
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  inquiryBubble: {
    width: "100%",
    maxWidth: "100%",
    backgroundColor: "#F0F8F4",
    borderWidth: 1,
    borderColor: "#C9E5D8",
  },
  inquiryCard: { width: "100%" },
  inquiryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
  },
  inquiryTitle: {
    color: "#123D31",
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  inquiryAccountName: {
    color: colors.text,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.bold,
  },
  inquiryAccountNumber: {
    color: "#405C52",
    fontSize: seniorTypography.caption,
    lineHeight: 26,
    fontFamily: fonts.semiBold,
    marginTop: 2,
  },
  balanceResultLabel: {
    color: "#405C52",
    fontSize: seniorTypography.caption,
    fontFamily: fonts.semiBold,
    marginTop: 20,
  },
  balanceResultAmount: {
    color: "#123D31",
    fontSize: 30,
    lineHeight: 40,
    fontFamily: fonts.bold,
    marginTop: 2,
  },
  historyRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D7E8E0",
    paddingVertical: 12,
  },
  historyLastRow: { borderBottomWidth: 0 },
  historyInfo: { flex: 1 },
  historyName: {
    color: colors.text,
    fontSize: seniorTypography.body,
    lineHeight: 28,
    fontFamily: fonts.bold,
  },
  historyMeta: {
    color: "#526B62",
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.semiBold,
  },
  historyAmount: {
    color: "#B42318",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  cancelledHistoryAmount: { color: "#66756F" },
  emptyHistoryText: {
    color: "#405C52",
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.semiBold,
    paddingVertical: 12,
  },
  assistantLabel: {
    color: colors.primary,
    fontSize: seniorTypography.caption,
    lineHeight: 26,
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  userLabel: {
    color: "#DDF3EA",
    fontSize: seniorTypography.caption,
    lineHeight: 24,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  messageText: {
    color: colors.text,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
  },
  transferCard: { width: "100%" },
  transferConfirmationContent: {
    width: "100%",
  },
  contextCard: { width: "100%" },
  contextBadge: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 14,
  },
  riskBadge: { backgroundColor: "#FDECEC" },
  cautionBadge: { backgroundColor: "#FFF4D6" },
  approvedBadge: { backgroundColor: "#E7F6EF" },
  safeBadge: { backgroundColor: "#E8F4EF" },
  contextBadgeText: {
    fontSize: seniorTypography.caption,
    lineHeight: 26,
    fontFamily: fonts.semiBold,
  },
  riskBadgeText: { color: "#C43D3D" },
  cautionBadgeText: { color: "#8A5A00" },
  approvedBadgeText: { color: "#146C54" },
  safeBadgeText: { color: colors.primary },
  contextTitle: {
    fontSize: seniorTypography.bodyStrong,
    lineHeight: 31,
    fontFamily: fonts.bold,
    marginBottom: 12,
  },
  riskTitle: { color: "#A52F2F" },
  cautionTitle: { color: "#765000" },
  safeTitle: { color: colors.primary },
  finalConfirmTitle: { color: colors.text },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 8,
  },
  reasonDot: { color: "#4E5968", fontSize: 20, lineHeight: 28 },
  reasonText: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fonts.regular,
  },
  followUpActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  followUpYesButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primary,
  },
  followUpYesText: {
    color: colors.white,
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  followUpNoButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#A9D2C2",
    borderRadius: 15,
    backgroundColor: colors.white,
  },
  followUpNoText: {
    color: colors.primary,
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  riskNotice: {
    borderRadius: 16,
    backgroundColor: "#FFF3F3",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 18,
  },
  riskNoticeText: {
    color: "#A52F2F",
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fonts.semiBold,
  },
  resultActions: { gap: 10, marginTop: 22 },
  resultPrimaryButton: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },
  resultPrimaryButtonText: {
    color: colors.white,
    fontSize: 19,
    fontFamily: fonts.bold,
    textAlign: "center",
  },
  resultCancelButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F1B8B8",
    borderRadius: 17,
    backgroundColor: colors.white,
  },
  resultCancelButtonText: {
    color: "#B43737",
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  cardQuestion: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.bold,
    marginBottom: 12,
  },
  partySection: {
    borderLeftWidth: 5,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  recipientSection: {
    borderLeftColor: "#1F8A6B",
    backgroundColor: "#E8F5F0",
  },
  senderSection: {
    borderLeftColor: "#5F7A70",
    backgroundColor: "#F1F7F4",
  },
  partyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 3,
  },
  cardAmountRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 8,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 19,
    lineHeight: 28,
    fontFamily: fonts.semiBold,
  },
  recipientLabel: { color: "#146C54" },
  senderLabel: { color: "#405C52" },
  cardAmountLabel: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.bold,
  },
  cardValue: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 30,
    fontFamily: fonts.bold,
  },
  cardDetail: {
    color: colors.text,
    fontSize: seniorTypography.body,
    lineHeight: 28,
    fontFamily: fonts.semiBold,
    flexShrink: 1,
  },
  cardBalance: {
    color: colors.text,
    fontSize: seniorTypography.caption,
    lineHeight: 26,
    fontFamily: fonts.semiBold,
  },
  cardAmount: {
    color: colors.primary,
    fontSize: 30,
    lineHeight: 40,
    fontFamily: fonts.bold,
    textAlign: "right",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  cardSecondaryButton: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F1B8B8",
    borderRadius: 16,
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 10,
  },
  cardSecondaryButtonText: {
    color: "#B42318",
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  cardPrimaryButton: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
  },
  cardPrimaryButtonText: {
    color: colors.white,
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  userMessageText: { color: colors.white },
  liveBubble: { minWidth: "30%" },
  processingText: {
    color: "#4E5968",
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
  },
  inputArea: {
    alignItems: "center",
    paddingHorizontal: spacing.page,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: colors.background,
  },
  modeSelection: { width: "100%", gap: 12 },
  selectionButton: {
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  secondarySelectionButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  selectionButtonText: {
    color: colors.white,
    fontSize: seniorTypography.button,
    fontFamily: fonts.bold,
  },
  secondarySelectionText: { color: colors.primary },
  voiceStatus: {
    width: "100%",
    alignItems: "center",
  },
  compactVoiceStatus: {
    minHeight: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  voiceIndicator: {
    width: 108,
    height: 108,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 54,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  compactVoiceIndicator: {
    width: 46,
    height: 46,
    borderRadius: 23,
    flexShrink: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  listeningIndicator: { backgroundColor: "#246B53" },
  pausedIndicator: {
    backgroundColor: "#667085",
    shadowColor: "#667085",
  },
  voiceGuideText: {
    color: "#4E5968",
    fontSize: 18,
    lineHeight: 27,
    fontFamily: fonts.semiBold,
    textAlign: "center",
    marginBottom: 8,
  },
  voiceStatusText: {
    color: colors.white,
    fontSize: seniorTypography.bodyStrong,
    lineHeight: 26,
    fontFamily: fonts.bold,
    textAlign: "center",
    width: 96,
    marginTop: 4,
  },
  compactVoiceStatusText: {
    color: colors.text,
    fontSize: seniorTypography.bodyStrong,
    lineHeight: 28,
    fontFamily: fonts.bold,
  },
  compactVoiceStatusContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  waveform: {
    width: 28,
    height: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  waveformBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  voiceActionRow: {
    width: "100%",
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  compactVoiceActionRow: {
    width: "auto",
    marginTop: 0,
    flexShrink: 0,
  },
  voicePauseButton: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  compactVoicePauseButton: {
    flex: 0,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  voicePauseButtonText: {
    color: colors.primary,
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  chatRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  chatInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#A9D2C2",
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: colors.text,
    fontSize: seniorTypography.body,
    lineHeight: 28,
    fontFamily: fonts.regular,
  },
  sendButton: {
    minWidth: 68,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: seniorTypography.bodyStrong,
    fontFamily: fonts.bold,
  },
  disabledButton: { opacity: 0.45 },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 31, 40, 0.48)",
    paddingHorizontal: spacing.page,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  modalIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: "#E8F4EF",
  },
  modalIconText: {
    color: colors.primary,
    fontSize: seniorTypography.hero,
    fontFamily: fonts.semiBold,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 36,
    fontFamily: fonts.bold,
    textAlign: "center",
    marginTop: 20,
  },
  modalDescription: {
    color: "#4E5968",
    fontSize: 18,
    lineHeight: 27,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 26,
  },
  modalPrimaryButton: {
    width: "100%",
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  modalPrimaryButtonText: {
    color: colors.white,
    fontSize: seniorTypography.button,
    fontFamily: fonts.bold,
  },
  modalCancelButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 6,
  },
  modalCancelButtonText: {
    color: "#4E5968",
    fontSize: seniorTypography.caption,
    fontFamily: fonts.semiBold,
  },
  pressed: { opacity: 0.76 },
});
