import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { seniorTypography } from '@/constants/typography';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
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
} from '@/services/ai';
import { getMainAccount, type MainAccountResponse } from '@/services/account';
import { searchRecipients, type Recipient } from '@/services/recipient';
import {
  cancelTransfer,
  checkTransferFds,
  completeTransfer,
  confirmTransferAmount,
  confirmTransferRecipient,
  createTransfer,
  finalConfirmTransfer,
} from '@/services/transfer';

type InputMode = 'voice' | 'chat';
type ConversationStep = 'intent' | 'purpose' | 'follow-up' | 'result';
type TransferPreview = { recipient: Recipient; senderAccount: MainAccountResponse };
type Message = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  intentResult?: IntentAnalyzeResponse;
  contextResult?: ContextAnalyzeResponse;
  fdsResult?: FdsAnalyzeResponse;
  transferPreview?: TransferPreview;
};

const TTS_OPTIONS = {
  language: 'ko-KR',
  rate: 0.78,
  pitch: 0.82,
} as const;

const TRANSFER_PURPOSE_QUESTION = '어떤 이유로 보내시는 돈인가요?';
const PAUSE_THRESHOLD_MS = 800;
const LONG_PAUSE_THRESHOLD_MS = 2000;

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { intentHint: rawIntentHint } = useLocalSearchParams<{
    intentHint?: IntentHint;
  }>();
  const intentHint = typeof rawIntentHint === 'string' ? rawIntentHint : undefined;

  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [contextResult, setContextResult] = useState<ContextAnalyzeResponse | null>(null);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [handledCardIds, setHandledCardIds] = useState<number[]>([]);
  const [handledFdsCardIds, setHandledFdsCardIds] = useState<number[]>([]);
  const nextMessageId = useRef(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const requestVersion = useRef(0);
  const voiceIdentifier = useRef<string | undefined>(undefined);
  const conversationStepRef = useRef<ConversationStep>('intent');
  const followUpAnswersRef = useRef<FollowUpAnswer[]>([]);
  const transferIntentRef = useRef<IntentAnalyzeResponse | null>(null);
  const transferRecipientRef = useRef<Recipient | null>(null);
  const transferSenderAccountRef = useRef<MainAccountResponse | null>(null);
  const transactionIdRef = useRef<number | null>(null);
  const purposeTextRef = useRef('');
  const shouldSubmitVoiceRef = useRef(false);
  const sessionPromiseRef = useRef<Promise<number> | null>(null);
  const voiceStartedAtRef = useRef<number | null>(null);
  const lastVoiceDurationRef = useRef<number | null>(null);
  const lastVoiceResultAtRef = useRef<number | null>(null);
  const voicePauseDurationsRef = useRef<number[]>([]);
  const lastAvgPauseDurationRef = useRef<number | null>(null);
  const lastLongPauseCountRef = useRef(0);
  const typingStartedAtRef = useRef<number | null>(null);
  const lastTypingAtRef = useRef<number | null>(null);
  const editCountRef = useRef(0);
  const fullDeleteCountRef = useRef(0);
  const typingPauseCountRef = useRef(0);
  const lastAssistantAtRef = useRef<number | null>(null);
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

  const startSession = () => {
    const promise = createAiSession().then((session) => {
      console.log('[AI session created]', session);
      return session.sessionId;
    });
    sessionPromiseRef.current = promise;
    return promise;
  };

  const ensureSession = () => sessionPromiseRef.current ?? startSession();

  useFocusEffect(useCallback(() => {
    void ensureSession().catch((error) => console.warn('[AI session create failed]', error));
    return () => {
      const activeSession = sessionPromiseRef.current;
      sessionPromiseRef.current = null;
      if (!activeSession) return;
      void activeSession
        .then((sessionId) => endAiSession(sessionId))
        .then((session) => console.log('[AI session ended]', session))
        .catch((error) => console.warn('[AI session end failed]', error));
    };
  }, []));

  const changeConversationStep = (step: ConversationStep) => {
    conversationStepRef.current = step;
  };

  const speak = (message: string) => {
    Speech.stop();
    Speech.speak(message, {
      ...TTS_OPTIONS,
      voice: voiceIdentifier.current,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const prepareVoice = async () => {
      const voices = await Speech.getAvailableVoicesAsync();
      if (!isMounted) return;

      const koreanVoices = voices.filter((voice) =>
        voice.language.toLowerCase().startsWith('ko'),
      );
      const adultMaleVoice = koreanVoices.find((voice) =>
        /male|남성/i.test(`${voice.name} ${voice.identifier}`),
      );
      const enhancedVoice = koreanVoices.find(
        (voice) => voice.quality === Speech.VoiceQuality.Enhanced,
      );

      voiceIdentifier.current = (adultMaleVoice ?? enhancedVoice ?? koreanVoices[0])?.identifier;
    };

    prepareVoice();

    return () => {
      isMounted = false;
      requestVersion.current += 1;
      Speech.stop();
    };
  }, []);

  const appendMessage = (
    role: Message['role'],
    text: string,
    intentResult?: IntentAnalyzeResponse,
    messageContextResult?: ContextAnalyzeResponse,
    fdsResult?: FdsAnalyzeResponse,
    transferPreview?: TransferPreview,
  ) => {
    const id = nextMessageId.current++;
    setMessages((current) => [
      ...current,
      { id, role, text, intentResult, contextResult: messageContextResult, fdsResult, transferPreview },
    ]);
    if (role === 'assistant') {
      lastAssistantAtRef.current = Date.now();
      void ensureSession()
        .then((sessionId) => saveAiAssistantMessage(sessionId, text))
        .catch((error) => console.warn('[AI assistant message save failed]', error));
    }
    return id;
  };

  const persistUserMessage = async (
    content: string,
    mode: InputMode,
    voiceDurationMs: number | null = null,
  ) => {
    const now = Date.now();
    const responseDelayMs = lastAssistantAtRef.current === null
      ? null
      : Math.max(0, now - lastAssistantAtRef.current);
    const isVoice = mode === 'voice';
    const durationSeconds = voiceDurationMs && voiceDurationMs > 0
      ? voiceDurationMs / 1000
      : null;
    const spokenUnits = content.replace(/\s+/g, '').length;

    try {
      const sessionId = await ensureSession();
      const saved = await saveAiUserMessage(sessionId, {
        inputType: isVoice ? 'VOICE' : 'CHAT',
        content,
        behavior: {
          responseDelayMs,
          typingDurationMs: isVoice || typingStartedAtRef.current === null
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
              speechRate: durationSeconds ? spokenUnits / durationSeconds : null,
              avgPauseDurationMs: lastAvgPauseDurationRef.current,
              longPauseCount: lastLongPauseCountRef.current,
            }
          : null,
      });
      console.log('[AI user message saved]', saved);
    } catch (error) {
      console.warn('[AI user message save failed]', error);
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
    if (lastTypingAtRef.current !== null && now - lastTypingAtRef.current >= 2000) {
      typingPauseCountRef.current += 1;
    }
    if (text.length < draft.length) editCountRef.current += 1;
    if (draft.length > 0 && text.length === 0) fullDeleteCountRef.current += 1;
    lastTypingAtRef.current = now;
    setDraft(text);
  };

  const formatAiReply = (result: IntentAnalyzeResponse) => {
    if (result.intent === 'TRANSFER') {
      if (result.recipientKeyword && result.amount !== null) {
        return `${result.recipientKeyword}에게 ${result.amount.toLocaleString('ko-KR')}원을 보내시는 게 맞나요?`;
      }
      if (result.recipientKeyword) {
        return `${result.recipientKeyword}에게 얼마를 보내실까요?`;
      }
      if (result.amount !== null) {
        return `${result.amount.toLocaleString('ko-KR')}원을 누구에게 보내실까요?`;
      }
      return '누구에게 얼마를 보내실까요?';
    }
    if (result.intent === 'BALANCE_CHECK') {
      return '연결된 계좌의 잔액을 확인할게요.';
    }
    if (result.intent === 'TRANSACTION_HISTORY') {
      return '최근 거래내역을 확인할게요.';
    }
    return '말씀하신 내용을 정확히 이해하지 못했어요. 다시 말씀해 주세요.';
  };

  const parseYesNoAnswer = (text: string) => {
    if (/아니|아뇨|아니요|없어요|없어|않았|안 했/.test(text)) return false;
    if (/네|예|맞아요|맞아|응|엉|그래요|그랬/.test(text)) return true;
    return null;
  };

  const findSingleRecipient = (recipients: Recipient[], keyword: string) => {
    const exact = recipients.filter(
      (recipient) => recipient.aliasName === keyword || recipient.recipientName === keyword,
    );
    return exact.length === 1 ? exact[0] : recipients.length === 1 ? recipients[0] : null;
  };

  const getBankName = (bankCode: string) => ({
    '004': 'KB국민은행', '011': 'NH농협은행', '020': '우리은행',
    '081': '하나은행', '088': '신한은행',
  })[bankCode] ?? `은행코드 ${bankCode}`;

  const maskAccountNumber = (accountNumber: string) => {
    const digits = accountNumber.replace(/\D/g, '');
    return digits.length > 7 ? `${digits.slice(0, 3)}-***-${digits.slice(-4)}` : accountNumber;
  };

  const requestFdsAnalysis = async (
    result: ContextAnalyzeResponse,
    _answers: FollowUpAnswer[],
  ) => {
    const transfer = transferIntentRef.current;
    const recipient = transferRecipientRef.current;
    if (!transfer?.amount || !recipient) {
      throw new Error('송금 정보가 준비되지 않았습니다.');
    }

    const senderAccount = transferSenderAccountRef.current;
    if (!senderAccount) throw new Error('출금계좌가 준비되지 않았습니다.');
    const created = await createTransfer({
      senderAccountId: senderAccount.accountId,
      receiverAccountId: null,
      receiverBankCode: recipient.bankCode,
      receiverAccountNumber: recipient.accountNumber,
      receiverName: recipient.recipientName,
      amount: transfer.amount,
      purpose: purposeTextRef.current,
    });
    console.log('[AI transfer created]', created);
    transactionIdRef.current = created.transactionId;
    console.log('[AI transfer recipient confirmed]', await confirmTransferRecipient(created.transactionId));
    console.log('[AI transfer amount confirmed]', await confirmTransferAmount(created.transactionId));
    const checked = await checkTransferFds(created.transactionId);
    console.log('[AI transfer FDS checked]', checked);
    const fdsResult: FdsAnalyzeResponse = {
      ...checked.fds,
      hardRuleTriggered: false,
      combinationRuleTriggered: false,
      triggeredRules: [],
      contextAnalysisSucceeded: true,
    };
    console.log('[AI FDS response]', fdsResult);
    const canComplete =
      fdsResult.riskLevel === 'LOW' && fdsResult.recommendedAction === 'PROCEED';
    const reply = canComplete
      ? '최종 확인 결과, 위험도가 낮아요. 송금을 진행할까요?'
      : '보호자 확인이 필요한 송금이라 지금은 진행할 수 없어요.';
    appendMessage('assistant', reply, undefined, result, fdsResult);
    changeConversationStep('result');
    speak(reply);
  };

  const submitMessage = async (text: string, requestedIntentHint?: IntentHint) => {
    const normalizedText = text.trim();
    if (!normalizedText || isProcessing) return;

    Speech.stop();
    appendMessage('user', normalizedText);
    const messageSavePromise = persistUserMessage(
      normalizedText,
      inputMode ?? 'chat',
      inputMode === 'voice' ? lastVoiceDurationRef.current : null,
    );
    setDraft('');
    resetTranscript();
    setIsProcessing(true);
    const currentRequestVersion = ++requestVersion.current;

    try {
      await messageSavePromise;
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'assistant');
      const currentStep =
        lastAssistantMessage?.text === TRANSFER_PURPOSE_QUESTION
          ? 'purpose'
          : conversationStepRef.current;
      console.log('[AI submit route]', { step: currentStep, text: normalizedText });

      if (currentStep === 'purpose') {
        purposeTextRef.current = normalizedText;
        const result = await analyzeContext(normalizedText);
        if (currentRequestVersion !== requestVersion.current) return;
        console.log('[AI context response]', result);

        if (!result.analysisSucceeded) {
          const reply = '송금 이유를 분석하지 못했어요. 다시 말씀해 주세요.';
          appendMessage('assistant', reply);
          speak(reply);
        } else if (result.requiresFollowUp && result.followUpQuestions.length > 0) {
          setContextResult(result);
          setFollowUpIndex(0);
          followUpAnswersRef.current = [];
          changeConversationStep('follow-up');
          const question = result.followUpQuestions[0].questionText;
          appendMessage('assistant', question);
          speak(question);
        } else {
          await requestFdsAnalysis(result, []);
        }
      } else if (currentStep === 'follow-up' && contextResult) {
        const currentQuestion = contextResult.followUpQuestions[followUpIndex];
        const answer = parseYesNoAnswer(normalizedText);
        if (answer === null) {
          const reply = '네 또는 아니요로 답해 주세요.';
          appendMessage('assistant', reply);
          speak(reply);
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
        console.log('[AI follow-up answers]', updatedAnswers);

        const nextIndex = followUpIndex + 1;
        if (nextIndex < contextResult.followUpQuestions.length) {
          setFollowUpIndex(nextIndex);
          const question = contextResult.followUpQuestions[nextIndex].questionText;
          appendMessage('assistant', question);
          speak(question);
        } else {
          await requestFdsAnalysis(contextResult, updatedAnswers);
        }
      } else if (currentStep === 'result') {
        const reply = '새로운 요청은 다시 시작 버튼을 눌러 말씀해 주세요.';
        appendMessage('assistant', reply);
        speak(reply);
      } else {
        const result = await analyzeIntent(
          normalizedText,
          requestedIntentHint ?? intentHint,
        );
        if (currentRequestVersion !== requestVersion.current) return;
        console.log('[AI intent response]', result);
        const reply = formatAiReply(result);
        if (result.intent === 'TRANSFER' && result.recipientKeyword && result.amount !== null) {
          const [recipients, senderAccount] = await Promise.all([
            searchRecipients(result.recipientKeyword),
            getMainAccount(),
          ]);
          const recipient = findSingleRecipient(recipients, result.recipientKeyword);
          if (!recipient) {
            const notFound = `${result.recipientKeyword}님이 누구인지 찾지 못했어요. 등록된 받는 분을 확인해 주세요.`;
            appendMessage('assistant', notFound);
            speak(notFound);
            return;
          }
          appendMessage('assistant', reply, result, undefined, undefined, {
            recipient,
            senderAccount,
          });
        } else {
          appendMessage('assistant', reply, result);
        }
        speak(reply);
      }
    } catch (error) {
      if (currentRequestVersion !== requestVersion.current) return;
      console.warn('[AI request failed]', error);
      const errorMessage = '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';
      appendMessage('assistant', errorMessage);
      speak(errorMessage);
    } finally {
      if (currentRequestVersion === requestVersion.current) setIsProcessing(false);
    }
  };

  const startListening = async () => {
    Speech.stop();
    shouldSubmitVoiceRef.current = false;
    lastVoiceResultAtRef.current = null;
    voicePauseDurationsRef.current = [];
    lastAvgPauseDurationRef.current = null;
    lastLongPauseCountRef.current = 0;
    const started = await startSpeechRecognition();
    if (started) voiceStartedAtRef.current = Date.now();
  };

  const finishListening = () => {
    const finishedAt = Date.now();
    if (lastVoiceResultAtRef.current !== null) {
      const finalGap = finishedAt - lastVoiceResultAtRef.current;
      if (finalGap >= PAUSE_THRESHOLD_MS) {
        voicePauseDurationsRef.current.push(finalGap);
      }
    }
    const pauses = voicePauseDurationsRef.current;
    lastAvgPauseDurationRef.current = pauses.length > 0
      ? Math.round(pauses.reduce((sum, pause) => sum + pause, 0) / pauses.length)
      : 0;
    lastLongPauseCountRef.current = pauses.filter(
      (pause) => pause >= LONG_PAUSE_THRESHOLD_MS,
    ).length;
    lastVoiceDurationRef.current = voiceStartedAtRef.current === null
      ? null
      : Math.max(0, finishedAt - voiceStartedAtRef.current);
    voiceStartedAtRef.current = null;
    shouldSubmitVoiceRef.current = true;
    stopSpeechRecognition();
  };

  useEffect(() => {
    if (!isListening || !liveTranscript) return;

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
    if (!shouldSubmitVoiceRef.current || isListening) return;

    shouldSubmitVoiceRef.current = false;
    const recognizedText = (finalTranscript || liveTranscript).trim();
    if (recognizedText) {
      submitMessage(recognizedText);
      return;
    }

    const reply = '말씀을 듣지 못했어요. 다시 말씀해 주세요.';
    appendMessage('assistant', reply);
    speak(reply);
  }, [finalTranscript, isListening, liveTranscript]);

  const selectChat = () => {
    Speech.stop();
    setInputMode('chat');
    speak('무엇을 도와드릴까요?');
  };

  const selectVoice = () => {
    setInputMode('voice');
    speak('무엇을 도와드릴까요?');
  };

  const handleQuickStart = async (
    label: string,
    hint?: IntentHint,
  ) => {
    if (hint === 'TRANSFER') {
      submitMessage(label, hint);
      return;
    }

    appendMessage('user', label);
    await persistUserMessage(label, 'chat');
    const reply =
      hint === 'BALANCE_CHECK'
        ? '통장 잔액 조회는 계좌와 로그인 연결 후 이용할 수 있어요.'
        : '최근 거래내역 조회는 API가 준비되면 이용할 수 있어요.';
    appendMessage('assistant', reply);
    speak(reply);
  };

  const resetConversation = () => {
    const previousSession = sessionPromiseRef.current;
    sessionPromiseRef.current = null;
    if (previousSession) {
      void previousSession
        .then((sessionId) => endAiSession(sessionId))
        .catch((error) => console.warn('[AI session end failed]', error));
    }
    void startSession().catch((error) => console.warn('[AI session create failed]', error));
    requestVersion.current += 1;
    Speech.stop();
    setMessages([]);
    setHandledCardIds([]);
    setHandledFdsCardIds([]);
    setDraft('');
    shouldSubmitVoiceRef.current = false;
    cancelListening();
    resetTranscript();
    setIsProcessing(false);
    setInputMode(null);
    changeConversationStep('intent');
    setContextResult(null);
    setFollowUpIndex(0);
    followUpAnswersRef.current = [];
    transferIntentRef.current = null;
    transferRecipientRef.current = null;
    transferSenderAccountRef.current = null;
    transactionIdRef.current = null;
    purposeTextRef.current = '';
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
    const answer = confirmed ? '맞아요' : '아니요, 다시 말할게요';
    appendMessage('user', answer);
    await persistUserMessage(answer, 'chat');

    const reply = confirmed
      ? TRANSFER_PURPOSE_QUESTION
      : '받는 분과 금액을 다시 말씀해 주세요.';
    changeConversationStep(confirmed ? 'purpose' : 'intent');
    appendMessage('assistant', reply);
    speak(reply);
  };

  const handleFdsCard = async (
    messageId: number,
    action: 'continue' | 'cancel',
  ) => {
    if (handledFdsCardIds.includes(messageId)) return;

    setHandledFdsCardIds((current) => [...current, messageId]);

    const userText =
      action === 'continue'
        ? '송금할게요.'
        : '송금을 취소할게요.';

    appendMessage('user', userText);
    await persistUserMessage(userText, 'chat');
    const transactionId = transactionIdRef.current;
    let reply: string;
    try {
      if (!transactionId) throw new Error('송금 번호가 없습니다.');
      if (action === 'continue') {
        const fds = messages.find((message) => message.id === messageId)?.fdsResult;
        if (fds?.riskLevel !== 'LOW' || fds.recommendedAction !== 'PROCEED') {
          reply = '보호자 확인 전에는 이 송금을 진행할 수 없어요.';
        } else {
          await finalConfirmTransfer(transactionId);
          const completed = await completeTransfer(transactionId);
          reply = `${completed.receiverName}님에게 ${completed.amount.toLocaleString('ko-KR')}원을 보냈어요.`;
        }
      } else {
        await cancelTransfer(transactionId);
        reply = '알겠어요. 이번 송금은 취소했어요.';
      }
    } catch (error) {
      console.warn('[AI transfer action failed]', error);
      reply = '송금을 처리하지 못했어요. 계좌 상태를 확인한 뒤 다시 시도해 주세요.';
    }
    appendMessage('assistant', reply);
    speak(reply);
  };

  const hasConversation = messages.length > 0 || isListening || isProcessing;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 12}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI 금융비서</Text>
        {inputMode !== null && !isListening && !isProcessing && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="대화 다시 시작"
            onPress={confirmResetConversation}
            style={({ pressed }) => [styles.newChatButton, pressed && styles.pressed]}
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
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {!hasConversation && (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>
              {inputMode === null
                ? '어떤 방식으로\n대화할까요?'
                : '무엇을 도와드릴까요?'}
            </Text>
            {inputMode !== null && (
              <View style={styles.quickStartSection}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleQuickStart('돈 보내기', 'TRANSFER')}
                  style={({ pressed }) => [styles.quickStartCard, pressed && styles.pressed]}
                >
                  <Text style={styles.quickStartCardText}>돈 보내기</Text>
                  <Text style={styles.quickStartArrow}>›</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    handleQuickStart('최근 거래 내역', 'TRANSACTION_HISTORY')
                  }
                  style={({ pressed }) => [styles.quickStartCard, pressed && styles.pressed]}
                >
                  <Text style={styles.quickStartCardText}>최근 거래 내역</Text>
                  <Text style={styles.quickStartArrow}>›</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleQuickStart('통장 잔액', 'BALANCE_CHECK')}
                  style={({ pressed }) => [styles.quickStartCard, pressed && styles.pressed]}
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
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              message.role === 'assistant' &&
                message.intentResult?.intent === 'TRANSFER' &&
                message.intentResult.recipientKeyword &&
                message.intentResult.amount !== null &&
                styles.transferBubble,
              message.role === 'assistant' &&
                message.contextResult &&
                styles.contextBubble,
            ]}
          >
            {message.role === 'assistant' && (
              <Text style={styles.assistantLabel}>든든</Text>
            )}
            {message.role === 'assistant' && message.fdsResult ? (
              <View style={styles.contextCard}>
                <View
                  style={[
                    styles.contextBadge,
                    message.fdsResult.riskLevel === 'LOW'
                      ? styles.safeBadge
                      : styles.riskBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.contextBadgeText,
                      message.fdsResult.riskLevel === 'LOW'
                        ? styles.safeBadgeText
                        : styles.riskBadgeText,
                    ]}
                  >
                    {message.fdsResult.riskLevel === 'LOW'
                      ? '안전'
                      : message.fdsResult.riskLevel === 'CAUTION'
                        ? '주의'
                        : '송금 위험'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.contextTitle,
                    message.fdsResult.riskLevel === 'LOW'
                      ? styles.safeTitle
                      : styles.riskTitle,
                  ]}
                >
                  {message.text}
                </Text>
                <Text style={styles.riskScoreText}>
                  위험 점수 {message.fdsResult.riskScore}점
                </Text>
                {message.fdsResult.reasons.map((reason, index) => (
                  <View key={`${message.id}-fds-reason-${index}`} style={styles.reasonRow}>
                    <Text style={styles.reasonDot}>•</Text>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
                {(message.fdsResult.riskLevel !== 'LOW' ||
                  message.fdsResult.recommendedAction !== 'PROCEED') && (
                  <View style={styles.riskNotice}>
                    <Text style={styles.riskNoticeText}>
                      보호자 승인 기능이 준비될 때까지 이 송금은 진행할 수 없어요.
                    </Text>
                  </View>
                )}
                {!handledFdsCardIds.includes(message.id) && (
                  <View style={styles.resultActions}>
                    {message.fdsResult.riskLevel === 'LOW' &&
                    message.fdsResult.recommendedAction === 'PROCEED' && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleFdsCard(message.id, 'continue')}
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
                      onPress={() => handleFdsCard(message.id, 'cancel')}
                      style={({ pressed }) => [
                        styles.resultCancelButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.resultCancelButtonText}>송금 취소</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : message.role === 'assistant' && message.contextResult ? (
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
                    {message.contextResult.suspicious ? '송금 주의' : '확인 완료'}
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
                    ? '주의가 필요한 거래예요'
                    : '위험한 표현은 발견되지 않았어요'}
                </Text>
                {message.contextResult.contextReasons.map((reason, index) => (
                  <View key={`${message.id}-reason-${index}`} style={styles.reasonRow}>
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
            ) : message.role === 'assistant' &&
            message.intentResult?.intent === 'TRANSFER' &&
            message.intentResult.recipientKeyword &&
            message.intentResult.amount !== null &&
            message.transferPreview ? (
              <View style={styles.transferCard}>
                <Text style={styles.cardQuestion}>이대로 보내시겠어요?</Text>
                <View style={styles.cardSection}>
                  <Text style={styles.cardLabel}>받는 분</Text>
                  <Text style={styles.cardValue}>{message.transferPreview.recipient.recipientName}</Text>
                  <Text style={styles.cardDetail}>
                    {getBankName(message.transferPreview.recipient.bankCode)} ·{' '}
                    {maskAccountNumber(message.transferPreview.recipient.accountNumber)}
                  </Text>
                </View>
                <View style={styles.cardDivider} />
                <View style={styles.cardSection}>
                  <Text style={styles.cardLabel}>보낼 금액</Text>
                  <Text style={styles.cardAmount}>
                    {message.intentResult.amount.toLocaleString('ko-KR')}원
                  </Text>
                </View>
                <View style={styles.cardDivider} />
                <View style={styles.cardSection}>
                  <Text style={styles.cardLabel}>출금계좌</Text>
                  <Text style={styles.cardValue}>
                    {message.transferPreview.senderAccount.accountName}
                  </Text>
                  <Text style={styles.cardDetail}>
                    {maskAccountNumber(message.transferPreview.senderAccount.accountNumber)} · 잔액{' '}
                    {message.transferPreview.senderAccount.balance.toLocaleString('ko-KR')}원
                  </Text>
                </View>
                {!handledCardIds.includes(message.id) && (
                  <View style={styles.cardActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleTransferCard(message.id, true)}
                      style={({ pressed }) => [
                        styles.cardPrimaryButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.cardPrimaryButtonText}>맞아요</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleTransferCard(message.id, false)}
                      style={({ pressed }) => [
                        styles.cardSecondaryButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.cardSecondaryButtonText}>아니요, 다시 말할게요</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' && styles.userMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                {inputMode === 'chat' &&
                  message.role === 'assistant' &&
                  conversationStepRef.current === 'follow-up' &&
                  contextResult?.followUpQuestions[followUpIndex]?.questionText ===
                    message.text && (
                    <View style={styles.followUpActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="네"
                        disabled={isProcessing}
                        onPress={() => submitMessage('네')}
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
                        onPress={() => submitMessage('아니요')}
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

        {isListening && (
          <View style={[styles.messageBubble, styles.userBubble, styles.liveBubble]}>
            <View style={styles.listeningRow}>
              <View style={styles.liveDot} />
              <Text style={styles.listeningText}>듣고 있어요</Text>
            </View>
            <Text style={[styles.messageText, styles.userMessageText]}>
              {liveTranscript || '말씀하신 내용이 여기에 보여요'}
            </Text>
          </View>
        )}

        {inputMode === 'voice' && speechRecognitionError && !isListening && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.assistantLabel}>든든</Text>
            <Text style={styles.processingText}>{speechRecognitionError}</Text>
          </View>
        )}

        {isProcessing && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.assistantLabel}>든든</Text>
            <Text style={styles.processingText}>내용을 확인하고 있어요 ···</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {inputMode === null ? (
          <View style={styles.modeSelection}>
            <Pressable
              accessibilityRole="button"
              onPress={selectVoice}
              style={({ pressed }) => [styles.selectionButton, pressed && styles.pressed]}
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
              <Text style={[styles.selectionButtonText, styles.secondarySelectionText]}>
                채팅으로 대화
              </Text>
            </Pressable>
          </View>
        ) : inputMode === 'voice' ? (
          <>
            <Text style={styles.voiceGuideText}>
              {isListening
                ? '말씀이 끝나면 완료 버튼을 눌러 주세요'
                : '버튼을 눌러 말씀해 주세요'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isListening ? '말씀 완료' : '말하기 시작'}
              disabled={isProcessing}
              onPress={isListening ? finishListening : startListening}
              style={({ pressed }) => [
                styles.voiceButton,
                isListening && styles.finishButton,
                isProcessing && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.micSymbol}>{isListening ? '■' : '●'}</Text>
              <Text style={styles.voiceButtonText}>{isListening ? '완료' : '말하기'}</Text>
            </Pressable>
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

      <Modal
        animationType="fade"
        onRequestClose={() => setIsResetModalVisible(false)}
        transparent
        visible={isResetModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <View
            accessibilityViewIsModal
            style={styles.modalCard}
          >
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
              style={({ pressed }) => [styles.modalPrimaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.modalPrimaryButtonText}>다시 시작</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsResetModalVisible(false)}
              style={({ pressed }) => [styles.modalCancelButton, pressed && styles.pressed]}
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
  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.page,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E8EB',
    backgroundColor: colors.white,
  },
  title: { color: colors.text, fontSize: 25, fontWeight: '800' },
  newChatButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#E8F4EF',
    paddingHorizontal: 14,
  },
  newChatButtonText: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  conversation: {
    flexGrow: 1,
    gap: 14,
    paddingHorizontal: spacing.page,
    paddingTop: 24,
    paddingBottom: 20,
  },
  emptyConversation: { alignItems: 'center', justifyContent: 'center' },
  emptyContent: { width: '100%', alignItems: 'center' },
  emptyTitle: {
    color: colors.text,
    fontSize: seniorTypography.pageTitle,
    lineHeight: 43,
    fontWeight: '800',
    textAlign: 'center',
  },
  quickStartSection: { width: '100%', gap: 10, marginTop: 28 },
  quickStartCard: {
    width: '100%',
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#D7E8E1',
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  quickStartCardText: { color: colors.text, fontSize: 20, fontWeight: '800' },
  quickStartArrow: { color: colors.primary, fontSize: 30, lineHeight: 34, fontWeight: '700' },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 17,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    backgroundColor: colors.white,
  },
  transferBubble: {
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  contextBubble: {
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  assistantLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  messageText: {
    color: colors.text,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontWeight: '600',
  },
  transferCard: { width: '100%' },
  contextCard: { width: '100%' },
  contextBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 14,
  },
  riskBadge: { backgroundColor: '#FDECEC' },
  safeBadge: { backgroundColor: '#E8F4EF' },
  contextBadgeText: { fontSize: 16, fontWeight: '800' },
  riskBadgeText: { color: '#C43D3D' },
  safeBadgeText: { color: colors.primary },
  contextTitle: {
    fontSize: seniorTypography.bodyStrong,
    lineHeight: 31,
    fontWeight: '800',
    marginBottom: 12,
  },
  riskTitle: { color: '#A52F2F' },
  safeTitle: { color: colors.primary },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 8,
  },
  reasonDot: { color: '#4E5968', fontSize: 20, lineHeight: 28 },
  reasonText: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
  },
  riskScoreText: {
    color: '#4E5968',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  followUpActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  followUpYesButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.primary,
  },
  followUpYesText: { color: colors.white, fontSize: 19, fontWeight: '800' },
  followUpNoButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A9D2C2',
    borderRadius: 15,
    backgroundColor: colors.white,
  },
  followUpNoText: { color: colors.primary, fontSize: 19, fontWeight: '800' },
  riskNotice: {
    borderRadius: 16,
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 18,
  },
  riskNoticeText: {
    color: '#A52F2F',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '800',
  },
  resultActions: { gap: 10, marginTop: 22 },
  resultPrimaryButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },
  resultPrimaryButtonText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultCancelButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F1B8B8',
    borderRadius: 17,
    backgroundColor: colors.white,
  },
  resultCancelButtonText: { color: '#B43737', fontSize: 18, fontWeight: '800' },
  cardQuestion: {
    color: colors.text,
    fontSize: seniorTypography.bodyStrong,
    lineHeight: 30,
    fontWeight: '800',
    marginBottom: 18,
  },
  cardSection: { gap: 5, paddingVertical: 3 },
  cardDivider: { height: 1, backgroundColor: '#E8EBED', marginVertical: 16 },
  cardLabel: { color: colors.muted, fontSize: 17, fontWeight: '600' },
  cardValue: { color: colors.text, fontSize: 22, lineHeight: 30, fontWeight: '800' },
  cardDetail: { color: colors.muted, fontSize: 17, lineHeight: 25, fontWeight: '600' },
  cardAmount: { color: colors.primary, fontSize: 28, lineHeight: 36, fontWeight: '800' },
  cardActions: { gap: 10, marginTop: 24 },
  cardSecondaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A9D2C2',
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  cardSecondaryButtonText: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  cardPrimaryButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  cardPrimaryButtonText: { color: colors.white, fontSize: 18, fontWeight: '800' },
  userMessageText: { color: colors.white },
  liveBubble: { minWidth: '76%' },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD6D6' },
  listeningText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  processingText: { color: '#4E5968', fontSize: seniorTypography.body, lineHeight: 30 },
  inputArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.page,
    paddingTop: 18,
    backgroundColor: colors.background,
  },
  modeSelection: { width: '100%', gap: 12 },
  selectionButton: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  secondarySelectionButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  selectionButtonText: { color: colors.white, fontSize: 21, fontWeight: '800' },
  secondarySelectionText: { color: colors.primary },
  voiceButton: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  voiceGuideText: {
    color: '#4E5968',
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  finishButton: { backgroundColor: '#246B53' },
  micSymbol: { color: colors.white, fontSize: 20, lineHeight: 24, marginBottom: 3 },
  voiceButtonText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  chatRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  chatInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#A9D2C2',
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: colors.text,
    fontSize: seniorTypography.body,
    lineHeight: 28,
  },
  sendButton: {
    minWidth: 68,
    minHeight: 58,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  sendButtonText: { color: colors.white, fontSize: 18, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25, 31, 40, 0.48)',
    paddingHorizontal: spacing.page,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  modalIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#E8F4EF',
  },
  modalIconText: { color: colors.primary, fontSize: 36, fontWeight: '700' },
  modalTitle: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
  },
  modalDescription: {
    color: '#4E5968',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 26,
  },
  modalPrimaryButton: {
    width: '100%',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  modalPrimaryButtonText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  modalCancelButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
  },
  modalCancelButtonText: { color: '#4E5968', fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.76 },
});
