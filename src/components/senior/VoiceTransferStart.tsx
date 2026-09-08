import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fonts, seniorTypography } from '@/constants/typography';

export function VoiceTransferStart() {
  return (
    <View style={styles.centerArea}>
      <Text style={styles.heroText}>
        누구에게 얼마를{'\n'}보낼지 알려주세요
      </Text>

      <View style={styles.suggestionGroup}>
        <TouchableOpacity style={styles.suggestion}>
          <Text style={styles.suggestionText}>아들에게 10만 원 보내줘</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.suggestion}>
          <Text style={styles.suggestionText}>최근 보낸 사람에게 보내줘</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.voiceInput}>
        <Text style={styles.placeholder}>보낼 사람과 금액을 알려주세요</Text>
        <TouchableOpacity
          style={styles.micButton}
          onPress={() =>
            router.push({
              pathname: '/senior/transfer/listening',
              params: { mode: 'transfer' },
            })
          }
        >
          <Text style={styles.mic}>🎙</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroText: { fontSize: seniorTypography.hero, lineHeight: 48, fontFamily: fonts.bold, textAlign: 'center', color: colors.text },
  suggestionGroup: { marginTop: spacing.section, gap: spacing.item, alignItems: 'center' },
  suggestion: { minHeight: spacing.touchTarget, backgroundColor: colors.white, borderRadius: spacing.buttonRadius, paddingHorizontal: spacing.content, justifyContent: 'center' },
  suggestionText: { fontSize: seniorTypography.body, fontFamily: fonts.semiBold, color: '#333D4B' },
  voiceInput: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 132, borderRadius: spacing.sheetRadius, backgroundColor: colors.white, padding: spacing.content, justifyContent: 'space-between' },
  placeholder: { fontSize: seniorTypography.body, fontFamily: fonts.regular, color: colors.muted },
  micButton: { alignSelf: 'flex-end', width: spacing.touchTarget, height: spacing.touchTarget, borderRadius: spacing.touchTarget / 2, backgroundColor: '#F2F4F6', alignItems: 'center', justifyContent: 'center' },
  mic: { fontSize: 22 },
});
