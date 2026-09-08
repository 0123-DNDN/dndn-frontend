import { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { useLocalSearchParams } from 'expo-router';
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
import {
  analyzeContext,
  analyzeFds,
  analyzeIntent,
  type ContextAnalyzeResponse,
  type FdsAnalyzeRequest,
  type FdsAnalyzeResponse,
  type FollowUpAnswer,
  type IntentAnalyzeResponse,
  type IntentHint,
} from '@/services/ai';

type InputMode = 'voice' | 'chat';
type ConversationStep = 'intent' | 'purpose' | 'follow-up' | 'result';
type Message = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  intentResult?: IntentAnalyzeResponse;
  contextResult?: ContextAnalyzeResponse;
  fdsResult?: FdsAnalyzeResponse;
};

const TTS_OPTIONS = {
  language: 'ko-KR',
  rate: 0.78,
  pitch: 0.82,
} as const;

const MOCK_VOICE_TEXT: Record<ConversationStep, string> = {
  intent: '아들에게 30만 원 보내줘',
  purpose: '검찰에서 안전계좌로 보내라고 했어',
  'follow-up': '네, 맞아요',
  result: '다른 것도 물어볼게',
};

const TRANSFER_PURPOSE_QUESTION = '어떤 이유로 보내시는 돈인가요?';

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { intentHint: rawIntentHint } = useLocalSearchParams<{
    intentHint?: IntentHint;
  }>();
  const intentHint = typeof rawIntentHint === 'string' ? rawIntentHint : undefined;

  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [contextResult, setContextResult] = useState<ContextAnalyzeResponse | null>(null);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
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
  const purposeTextRef = useRef('');

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
  ) => {
    const id = nextMessageId.current++;
    setMessages((current) => [
      ...current,
      { id, role, text, intentResult, contextResult: messageContextResult, fdsResult },
    ]);
    return id;
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

  const requestFdsAnalysis = async (
    result: ContextAnalyzeResponse,
    answers: FollowUpAnswer[],
  ) => {
    const transfer = transferIntentRef.current;
    const request: FdsAnalyzeRequest = {
      purposeText: purposeTextRef.current,
      followUpAnswers: answers.map(({ code, answer }) => ({ code, answer })),
      transaction: {
        amountRatioToAverage: 1,
        amount: transfer?.amount ?? 0,
        balanceRatio: 0,
        outsideUsualTime: false,
      },
      recipient: {
        newRecipient: false,
        inactiveForOneYear: false,
        suspectedRiskAccount: false,
        confirmedFraudAccount: false,
      },
      velocity: {
        transfersIn10Minutes: 0,
        transfersIn30Minutes: 0,
        failedTransfersIn10Minutes: 0,
        distinctRecipientsIn30Minutes: 0,
        rapidCumulativeAmountIncrease: false,
      },
      device: {
        newDevice: false,
        environmentChanged: false,
        multipleDeviceChanges: false,
        remoteControlEnvironment: false,
      },
      behavior: {
        transferCancelCount: 0,
        amountEditCount: 0,
        recipientChangeCount: 0,
        sameStepReentryCount: 0,
        backNavigationCount: 0,
        confirmationReentryCount: 0,
      },
      condition: {
        inputType: inputMode === 'voice' ? 'VOICE' : 'CHAT',
        responseDelayRatio: 1,
        answerReversalCount: 0,
        confusionCount: 0,
        reexplanationCount: 0,
        speechRateDecreaseRatio: 0,
        pauseIncreaseRatio: 0,
        longPauseRepeated: false,
        pitchChanged: false,
        typingDurationRatio: 1,
        textEditCount: 0,
        fullDeleteCount: 0,
        typingPauseCount: 0,
      },
    };

    console.log('[AI FDS request]', request);
    const fdsResult = await analyzeFds(request);
    console.log('[AI FDS response]', fdsResult);
    const reply =
      fdsResult.riskLevel === 'LOW'
        ? '최종 확인 결과, 위험도가 낮아요.'
        : fdsResult.riskLevel === 'CAUTION'
          ? '한 번 더 확인이 필요한 송금이에요.'
          : '위험한 송금일 수 있어요. 지금은 송금을 멈춰 주세요.';
    appendMessage('assistant', reply, undefined, result, fdsResult);
    changeConversationStep('result');
    speak(reply);
  };

  const submitMessage = async (text: string, requestedIntentHint?: IntentHint) => {
    const normalizedText = text.trim();
    if (!normalizedText || isProcessing) return;

    Speech.stop();
    appendMessage('user', normalizedText);
    setDraft('');
    setLiveTranscript('');
    setIsListening(false);
    setIsProcessing(true);
    const currentRequestVersion = ++requestVersion.current;

    try {
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
        appendMessage('assistant', reply, result);
        speak(reply);
      }
    } catch {
      if (currentRequestVersion !== requestVersion.current) return;
      const errorMessage = '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';
      appendMessage('assistant', errorMessage);
      speak(errorMessage);
    } finally {
      if (currentRequestVersion === requestVersion.current) setIsProcessing(false);
    }
  };

  const startListening = () => {
    Speech.stop();
    setLiveTranscript('');
    setIsListening(true);
  };

  const finishListening = () => {
    // STT 브랜치에서는 실시간 중간 결과로 liveTranscript를 갱신합니다.
    submitMessage(liveTranscript || MOCK_VOICE_TEXT[conversationStepRef.current]);
  };

  const selectChat = () => {
    Speech.stop();
    setInputMode('chat');
    speak('무엇을 도와드릴까요?');
  };

  const selectVoice = () => {
    setInputMode('voice');
    speak('무엇을 도와드릴까요?');
  };

  const handleQuickStart = (
    label: string,
    hint?: IntentHint,
  ) => {
    if (hint === 'TRANSFER') {
      submitMessage(label, hint);
      return;
    }

    appendMessage('user', label);
    const reply =
      hint === 'BALANCE_CHECK'
        ? '통장 잔액 조회는 계좌와 로그인 연결 후 이용할 수 있어요.'
        : '최근 거래내역 조회는 API가 준비되면 이용할 수 있어요.';
    appendMessage('assistant', reply);
    speak(reply);
  };

  const resetConversation = () => {
    requestVersion.current += 1;
    Speech.stop();
    setMessages([]);
    setHandledCardIds([]);
    setHandledFdsCardIds([]);
    setDraft('');
    setLiveTranscript('');
    setIsListening(false);
    setIsProcessing(false);
    setInputMode(null);
    changeConversationStep('intent');
    setContextResult(null);
    setFollowUpIndex(0);
    followUpAnswersRef.current = [];
    transferIntentRef.current = null;
    purposeTextRef.current = '';
    setIsResetModalVisible(false);
  };

  const confirmResetConversation = () => {
    Speech.stop();
    setIsResetModalVisible(true);
  };

  const handleTransferCard = (messageId: number, confirmed: boolean) => {
    if (handledCardIds.includes(messageId)) return;

    setHandledCardIds((current) => [...current, messageId]);
    if (confirmed) {
      transferIntentRef.current =
        messages.find((message) => message.id === messageId)?.intentResult ?? null;
    }
    appendMessage('user', confirmed ? '맞아요' : '수정할게요');

    const reply = confirmed
      ? TRANSFER_PURPOSE_QUESTION
      : '받는 분과 금액을 다시 말씀해 주세요.';
    changeConversationStep(confirmed ? 'purpose' : 'intent');
    appendMessage('assistant', reply);
    speak(reply);
  };

  const handleFdsCard = (
    messageId: number,
    action: 'continue' | 'guardian' | 'cancel',
  ) => {
    if (handledFdsCardIds.includes(messageId)) return;

    setHandledFdsCardIds((current) => [...current, messageId]);

    const userText =
      action === 'continue'
        ? '위험을 확인했어요. 계속할게요.'
        : action === 'guardian'
          ? '가족에게 확인 요청할게요.'
          : '송금을 취소할게요.';
    const reply =
      action === 'continue'
        ? '아직 실제 이체 API가 연결되지 않아 송금은 실행되지 않았어요.'
        : action === 'guardian'
          ? '송금을 보류했어요. 가족 확인 요청 기능은 API 연결 후 전송할 수 있어요.'
          : '알겠어요. 이번 송금은 취소했어요.';

    appendMessage('user', userText);
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
                {message.fdsResult.recommendedAction === 'HOLD' && (
                  <View style={styles.riskNotice}>
                    <Text style={styles.riskNoticeText}>
                      송금을 보류하고 가족에게 먼저 확인해 주세요.
                    </Text>
                  </View>
                )}
                {!handledFdsCardIds.includes(message.id) && (
                  <View style={styles.resultActions}>
                    {message.fdsResult.riskLevel === 'LOW' ||
                    message.fdsResult.riskLevel === 'CAUTION' ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleFdsCard(message.id, 'continue')}
                        style={({ pressed }) => [
                          styles.resultPrimaryButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.resultPrimaryButtonText}>
                          {message.fdsResult.riskLevel === 'LOW'
                            ? '송금 계속하기'
                            : '확인했어요. 계속하기'}
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleFdsCard(message.id, 'guardian')}
                        style={({ pressed }) => [
                          styles.resultPrimaryButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.resultPrimaryButtonText}>
                          가족에게 확인 요청
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
            message.intentResult.amount !== null ? (
              <View style={styles.transferCard}>
                <Text style={styles.cardQuestion}>이대로 보내시겠어요?</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>받는 분</Text>
                  <Text style={styles.cardValue}>
                    {message.intentResult.recipientKeyword}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>금액</Text>
                  <Text style={styles.cardAmount}>
                    {message.intentResult.amount.toLocaleString('ko-KR')}원
                  </Text>
                </View>
                {!handledCardIds.includes(message.id) && (
                  <View style={styles.cardActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleTransferCard(message.id, false)}
                      style={({ pressed }) => [
                        styles.cardSecondaryButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.cardSecondaryButtonText}>수정할게요</Text>
                    </Pressable>
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
                onChangeText={setDraft}
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    marginTop: 10,
  },
  cardLabel: { color: colors.muted, fontSize: 17, fontWeight: '600' },
  cardValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  cardAmount: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  cardSecondaryButton: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A9D2C2',
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  cardSecondaryButtonText: { color: colors.primary, fontSize: 17, fontWeight: '800' },
  cardPrimaryButton: {
    flex: 1,
    minHeight: 54,
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
