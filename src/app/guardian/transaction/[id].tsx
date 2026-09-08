import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import {
  fonts,
  guardianTypography,
} from '@/constants/typography';

type ConfirmType = 'approve' | 'reject' | null;

type RiskLevel =
  | 'LOW'
  | 'CAUTION'
  | 'HIGH'
  | 'CRITICAL';

const RISK_LEVEL: RiskLevel = 'CRITICAL';

const riskSignals = [
  '검찰을 사칭하는 표현이 확인됐어요.',
  '안전계좌로 돈을 옮기라는 요청이 있었어요.',
  '처음 송금하는 계좌예요.',
  '평소보다 큰 금액을 보내려고 해요.',
];

const getRiskLabel = (level: RiskLevel) => {
  switch (level) {
    case 'LOW':
      return '정상';

    case 'CAUTION':
      return '주의';

    case 'HIGH':
      return '위험';

    case 'CRITICAL':
      return '고위험';
  }
};

const getRiskDescription = (level: RiskLevel) => {
  switch (level) {
    case 'LOW':
      return '현재 확인된 위험 신호가 적어요.';

    case 'CAUTION':
      return '한 번 더 확인이 필요한 거래예요.';

    case 'HIGH':
      return '여러 위험 신호가 감지된 거래예요.';

    case 'CRITICAL':
      return '여러 위험 신호가 함께 감지된 고위험 거래예요.';
  }
};

export default function TransactionDetailScreen() {
  const [confirmType, setConfirmType] =
    useState<ConfirmType>(null);

  const riskLabel = getRiskLabel(RISK_LEVEL);
  const riskDescription =
    getRiskDescription(RISK_LEVEL);

  const handleCallSenior = () => {
    // TODO:
    // 실제 연결된 시니어 전화번호로 교체
    Linking.openURL('tel:01012345678');
  };

  const openApproveSheet = () => {
    setConfirmType('approve');
  };

  const openRejectSheet = () => {
    setConfirmType('reject');
  };

  const closeSheet = () => {
    setConfirmType(null);
  };

  const handleApproveConfirm = () => {
    /*
     * TODO:
     * 실제 보호자 승인 API 호출
     *
     * 승인 이후 시니어가
     * 최종 송금을 다시 확인하는 흐름
     */

    setConfirmType(null);

    router.replace('/guardian/(tabs)/home');
  };

  const handleRejectConfirm = () => {
    /*
     * TODO:
     * 실제 보호자 거절 API 호출
     */

    setConfirmType(null);

    router.replace('/guardian/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 뒤로가기 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
        >
          <Text style={styles.backText}>
            ‹
          </Text>

          <Text style={styles.backLabel}>
            뒤로가기
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageLabel}>
            위험 거래 확인
          </Text>

          <Text style={styles.title}>
            확인이 필요한{'\n'}
            송금이에요
          </Text>

          <Text style={styles.subtitle}>
            김영희님이 보호자 확인을 요청했어요.
          </Text>
        </View>

        {/* 송금 정보 */}
        <View style={styles.transferCard}>
          <View style={styles.riskLevelBadge}>
            <Ionicons
              name="warning"
              size={16}
              color="#F04452"
            />

            <Text style={styles.riskLevelBadgeText}>
              {riskLabel}
            </Text>
          </View>

          <Text style={styles.transferRoute}>
            김영희님 → 김상우님
          </Text>

          <Text style={styles.amount}>
            5,000,000원
          </Text>

          <View style={styles.accountInfo}>
            <Text style={styles.accountBank}>
              신한은행
            </Text>

            <Text style={styles.accountNumber}>
              110-***-4821
            </Text>
          </View>
        </View>

        {/* 부모님이 말씀하신 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            부모님이 말씀하신 내용
          </Text>

          <View style={styles.quoteCard}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={colors.primary}
            />

            <Text style={styles.quoteText}>
              “검찰에서 전화가 왔는데 내 통장이
              위험하니까 안전계좌로 옮겨놓으래.”
            </Text>
          </View>
        </View>

        {/* 위험 신호 */}
        <View style={styles.section}>
          <View style={styles.riskSectionHeader}>
            <View style={styles.riskTitleRow}>
              <View style={styles.riskIcon}>
                <Ionicons
                  name="shield-outline"
                  size={21}
                  color="#F04452"
                />
              </View>

              <Text style={styles.sectionTitle}>
                든든이 감지한 위험 신호
              </Text>
            </View>

            <View style={styles.riskBadge}>
              <Text style={styles.riskBadgeText}>
                {riskLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.riskSummary}>
            {riskDescription}
          </Text>

          <View style={styles.riskList}>
            {riskSignals.map((signal, index) => (
              <View
                key={signal}
                style={styles.riskItem}
              >
                <View style={styles.riskNumber}>
                  <Text style={styles.riskNumberText}>
                    {index + 1}
                  </Text>
                </View>

                <Text style={styles.riskText}>
                  {signal}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.riskNotice}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6B7684"
            />

            <Text style={styles.riskNoticeText}>
              현재 송금이 보류된 상태예요.
              승인하기 전에 부모님과 직접
              상황을 확인해주세요.
            </Text>
          </View>
        </View>

        {/* 행동 버튼 */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.75}
            onPress={handleCallSenior}
          >
            <Ionicons
              name="call-outline"
              size={21}
              color={colors.primary}
            />

            <Text style={styles.callButtonText}>
              부모님께 전화하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveButton}
            activeOpacity={0.8}
            onPress={openApproveSheet}
          >
            <Text style={styles.approveButtonText}>
              거래 승인
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            activeOpacity={0.75}
            onPress={openRejectSheet}
          >
            <Text style={styles.rejectButtonText}>
              거래 거절
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.bottomGuide}>
          승인 후에도 김영희님이 직접 한 번 더
          송금을 확인합니다.
        </Text>
      </ScrollView>

      {/* 승인 / 거절 확인 Bottom Sheet */}
      <Modal
        visible={confirmType !== null}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={closeSheet}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            {confirmType === 'approve' ? (
              <>
                <View style={styles.highRiskSheetBadge}>
                  <Ionicons
                    name="warning"
                    size={18}
                    color="#F04452"
                  />

                  <Text
                    style={
                      styles.highRiskSheetBadgeText
                    }
                  >
                    고위험 거래
                  </Text>
                </View>

                <Text style={styles.sheetTitle}>
                  정말 이 거래를{'\n'}
                  승인하시겠어요?
                </Text>

                <View style={styles.approveWarningBox}>
                  <Ionicons
                    name="shield-outline"
                    size={23}
                    color="#F04452"
                  />

                  <Text
                    style={
                      styles.approveWarningText
                    }
                  >
                    든든이가 여러 위험 신호를
                    감지해 고위험 거래로 판단했어요.
                  </Text>
                </View>

                <Text style={styles.sheetDescription}>
                  현재 송금이 보류된 상태예요.
                  승인하면 김영희님이 다시 송금을
                  진행할 수 있어요.
                  {'\n\n'}
                  실제 송금이 완료된 후에는
                  되돌리기 어려울 수 있으니
                  충분히 확인해주세요.
                </Text>

                <TouchableOpacity
                  style={styles.approveConfirmButton}
                  activeOpacity={0.8}
                  onPress={handleApproveConfirm}
                >
                  <Text
                    style={
                      styles.approveConfirmButtonText
                    }
                  >
                    위험을 이해하고 승인하기
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetCancelButton}
                  activeOpacity={0.7}
                  onPress={closeSheet}
                >
                  <Text
                    style={
                      styles.sheetCancelButtonText
                    }
                  >
                    다시 확인할게요
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.rejectSheetIcon}>
                  <Ionicons
                    name="close"
                    size={30}
                    color="#F04452"
                  />
                </View>

                <Text style={styles.sheetTitle}>
                  이 거래를{'\n'}
                  거절하시겠어요?
                </Text>

                <Text style={styles.sheetDescription}>
                  현재 송금이 보류된 상태예요.
                  {'\n\n'}
                  거래를 거절하면 김영희님에게
                  송금이 진행되지 않는다는 안내가
                  전달돼요.
                </Text>

                <TouchableOpacity
                  style={styles.rejectConfirmButton}
                  activeOpacity={0.8}
                  onPress={handleRejectConfirm}
                >
                  <Text
                    style={
                      styles.rejectConfirmButtonText
                    }
                  >
                    거래 거절하기
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetCancelButton}
                  activeOpacity={0.7}
                  onPress={closeSheet}
                >
                  <Text
                    style={
                      styles.sheetCancelButtonText
                    }
                  >
                    취소
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  /*
   * Back
   */

  backButton: {
    minHeight: spacing.touchTarget,
    marginTop: spacing.item,

    flexDirection: 'row',
    alignItems: 'center',

    alignSelf: 'flex-start',
  },

  backText: {
    width: 32,

    fontSize: 38,
    lineHeight: 44,

    fontFamily: fonts.regular,
    color: colors.text,
  },

  backLabel: {
    fontSize: 18,
    lineHeight: 26,

    fontFamily: fonts.semiBold,
    color: colors.text,
  },

  /*
   * Header
   */

  header: {
    marginTop: 18,
    marginBottom: 26,
  },

  pageLabel: {
    fontSize: 15,
    lineHeight: 22,

    fontFamily: fonts.semiBold,
    color: '#F04452',
  },

  title: {
    marginTop: 7,

    fontSize: guardianTypography.pageTitle,
    lineHeight: 38,

    fontFamily: fonts.bold,
    color: '#191F28',
  },

  subtitle: {
    marginTop: 8,

    fontSize: guardianTypography.secondary,
    lineHeight: 24,

    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  /*
   * Transfer Card
   */

  transferCard: {
    padding: 22,

    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    alignItems: 'center',
  },

  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    paddingHorizontal: 11,
    paddingVertical: 6,

    borderRadius: 10,
    backgroundColor: '#FFF1F3',

    marginBottom: 14,
  },

  riskLevelBadgeText: {
    fontSize: 14,
    lineHeight: 20,

    fontFamily: fonts.bold,
    color: '#F04452',
  },

  transferRoute: {
    fontSize: 15,
    lineHeight: 22,

    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  amount: {
    marginTop: 8,

    fontSize: 32,
    lineHeight: 42,

    fontFamily: fonts.bold,
    color: '#191F28',
  },

  accountInfo: {
    marginTop: 10,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,
  },

  accountBank: {
    fontSize: 15,
    lineHeight: 22,

    fontFamily: fonts.medium,
    color: '#6B7684',
  },

  accountNumber: {
    fontSize: 15,
    lineHeight: 22,

    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  /*
   * Section
   */

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: guardianTypography.sectionTitle,
    lineHeight: 30,

    fontFamily: fonts.bold,
    color: '#191F28',
  },

  /*
   * Quote
   */

  quoteCard: {
    marginTop: 14,

    padding: 20,

    borderRadius: 18,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 12,
  },

  quoteText: {
    flex: 1,

    fontSize: 16,
    lineHeight: 26,

    fontFamily: fonts.medium,
    color: '#333D4B',
  },

  /*
   * Risk
   */

  riskSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    gap: 12,
  },

  riskTitleRow: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,
  },

  riskIcon: {
    width: 36,
    height: 36,

    borderRadius: 12,
    backgroundColor: '#FFF1F3',

    alignItems: 'center',
    justifyContent: 'center',
  },

  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 10,
    backgroundColor: '#FFF1F3',
  },

  riskBadgeText: {
    fontSize: 13,
    lineHeight: 18,

    fontFamily: fonts.bold,
    color: '#F04452',
  },

  riskSummary: {
    marginTop: 12,

    fontSize: 15,
    lineHeight: 23,

    fontFamily: fonts.medium,
    color: '#6B7684',
  },

  riskList: {
    marginTop: 14,
    gap: 10,
  },

  riskItem: {
    minHeight: 64,

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderRadius: 16,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,
  },

  riskNumber: {
    width: 28,
    height: 28,

    borderRadius: 9,
    backgroundColor: '#FFF1F3',

    alignItems: 'center',
    justifyContent: 'center',
  },

  riskNumberText: {
    fontSize: 14,
    lineHeight: 20,

    fontFamily: fonts.bold,
    color: '#F04452',
  },

  riskText: {
    flex: 1,

    fontSize: 16,
    lineHeight: 24,

    fontFamily: fonts.medium,
    color: '#333D4B',
  },

  riskNotice: {
    marginTop: 12,

    padding: 16,

    borderRadius: 16,
    backgroundColor: '#EEF0F2',

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 9,
  },

  riskNoticeText: {
    flex: 1,

    fontSize: 14,
    lineHeight: 22,

    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  /*
   * Actions
   */

  actionSection: {
    marginTop: 32,
    gap: 10,
  },

  callButton: {
    minHeight: 56,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#D1D6DB',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,
  },

  callButtonText: {
    fontSize: guardianTypography.button,
    lineHeight: 24,

    fontFamily: fonts.bold,
    color: colors.primary,
  },

  approveButton: {
    minHeight: 56,

    borderRadius: 16,
    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  approveButtonText: {
    fontSize: guardianTypography.button,
    lineHeight: 24,

    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  rejectButton: {
    minHeight: 56,

    borderRadius: 16,
    backgroundColor: '#FFF1F3',

    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectButtonText: {
    fontSize: guardianTypography.button,
    lineHeight: 24,

    fontFamily: fonts.bold,
    color: '#F04452',
  },

  bottomGuide: {
    marginTop: 14,

    fontSize: 13,
    lineHeight: 21,

    fontFamily: fonts.regular,
    color: '#8B95A1',

    textAlign: 'center',
  },

  /*
   * Modal
   */

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },

  bottomSheet: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 34,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    backgroundColor: '#FFFFFF',
  },

  sheetHandle: {
    width: 40,
    height: 5,

    borderRadius: 3,

    alignSelf: 'center',

    marginBottom: 24,

    backgroundColor: '#D1D6DB',
  },

  /*
   * Approve Sheet
   */

  highRiskSheetBadge: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    paddingHorizontal: 11,
    paddingVertical: 7,

    borderRadius: 10,
    backgroundColor: '#FFF1F3',
  },

  highRiskSheetBadgeText: {
    fontSize: 14,
    lineHeight: 20,

    fontFamily: fonts.bold,
    color: '#F04452',
  },

  sheetTitle: {
    marginTop: 18,

    fontSize: 26,
    lineHeight: 36,

    fontFamily: fonts.bold,
    color: '#191F28',
  },

  approveWarningBox: {
    marginTop: 20,

    padding: 16,

    borderRadius: 16,
    backgroundColor: '#FFF1F3',

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 10,
  },

  approveWarningText: {
    flex: 1,

    fontSize: 16,
    lineHeight: 24,

    fontFamily: fonts.semiBold,
    color: '#C72C3A',
  },

  sheetDescription: {
    marginTop: 16,

    fontSize: 16,
    lineHeight: 25,

    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  approveConfirmButton: {
    minHeight: 56,

    marginTop: 26,

    borderRadius: 16,
    backgroundColor: '#F04452',

    alignItems: 'center',
    justifyContent: 'center',
  },

  approveConfirmButtonText: {
    fontSize: 17,
    lineHeight: 24,

    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  /*
   * Reject Sheet
   */

  rejectSheetIcon: {
    width: 52,
    height: 52,

    borderRadius: 18,
    backgroundColor: '#FFF1F3',

    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectConfirmButton: {
    minHeight: 56,

    marginTop: 26,

    borderRadius: 16,
    backgroundColor: '#F04452',

    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectConfirmButtonText: {
    fontSize: 17,
    lineHeight: 24,

    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  /*
   * Cancel
   */

  sheetCancelButton: {
    minHeight: 56,

    marginTop: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetCancelButtonText: {
    fontSize: 17,
    lineHeight: 24,

    fontFamily: fonts.semiBold,
    color: '#6B7684',
  },
});