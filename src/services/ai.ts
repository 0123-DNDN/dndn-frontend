import { api } from '@/services/api';

export type FinancialIntent =
  | 'BALANCE_CHECK'
  | 'TRANSFER'
  | 'TRANSACTION_HISTORY'
  | 'UNKNOWN';

export type IntentHint = Exclude<FinancialIntent, 'UNKNOWN'>;

export type IntentAnalyzeResponse = {
  intent: FinancialIntent;
  recipientKeyword: string | null;
  amount: number | null;
};

export type FollowUpQuestion = {
  code: string;
  questionText: string;
};

export type FollowUpAnswer = FollowUpQuestion & {
  answer: boolean;
  answerText: string;
};

export type RiskLevel = 'LOW' | 'CAUTION' | 'HIGH' | 'CRITICAL';
export type RecommendedAction = 'PROCEED' | 'RECONFIRM' | 'WARN' | 'HOLD';

export type FdsAnalyzeResponse = {
  riskLevel: RiskLevel;
  riskScore: number;
  recommendedAction: RecommendedAction;
  hardRuleTriggered: boolean;
  combinationRuleTriggered: boolean;
  triggeredRules: string[];
  reasons: string[];
  contextAnalysisSucceeded: boolean;
};

export type FdsAnalyzeRequest = {
  purposeText: string;
  followUpAnswers: Array<{ code: string; answer: boolean }>;
  transaction: {
    amountRatioToAverage: number;
    amount: number;
    balanceRatio: number;
    outsideUsualTime: boolean;
  };
  recipient: {
    newRecipient: boolean;
    inactiveForOneYear: boolean;
    suspectedRiskAccount: boolean;
    confirmedFraudAccount: boolean;
  };
  velocity: {
    transfersIn10Minutes: number;
    transfersIn30Minutes: number;
    failedTransfersIn10Minutes: number;
    distinctRecipientsIn30Minutes: number;
    rapidCumulativeAmountIncrease: boolean;
  };
  device: {
    newDevice: boolean;
    environmentChanged: boolean;
    multipleDeviceChanges: boolean;
    remoteControlEnvironment: boolean;
  };
  behavior: {
    transferCancelCount: number;
    amountEditCount: number;
    recipientChangeCount: number;
    sameStepReentryCount: number;
    backNavigationCount: number;
    confirmationReentryCount: number;
  };
  condition: {
    inputType: 'VOICE' | 'CHAT';
    responseDelayRatio: number;
    answerReversalCount: number;
    confusionCount: number;
    reexplanationCount: number;
    speechRateDecreaseRatio: number;
    pauseIncreaseRatio: number;
    longPauseRepeated: boolean;
    pitchChanged: boolean;
    typingDurationRatio: number;
    textEditCount: number;
    fullDeleteCount: number;
    typingPauseCount: number;
  };
};

export type ContextAnalyzeResponse = {
  suspicious: boolean;
  detectedSignals: string[];
  contextReasons: string[];
  analysisSucceeded: boolean;
  requiresFollowUp: boolean;
  followUpQuestions: FollowUpQuestion[];
};

export async function analyzeIntent(
  text: string,
  intentHint?: IntentHint,
): Promise<IntentAnalyzeResponse> {
  const response = await api.post<IntentAnalyzeResponse>('/api/ai/intent', {
    text,
    ...(intentHint ? { intentHint } : {}),
  });

  return response.data;
}

export async function analyzeContext(
  purposeText: string,
): Promise<ContextAnalyzeResponse> {
  const response = await api.post<ContextAnalyzeResponse>('/api/ai/context', {
    purposeText,
  });

  return response.data;
}

export async function analyzeFds(
  request: FdsAnalyzeRequest,
): Promise<FdsAnalyzeResponse> {
  const response = await api.post<FdsAnalyzeResponse>('/api/fds/analyze', request);
  return response.data;
}
