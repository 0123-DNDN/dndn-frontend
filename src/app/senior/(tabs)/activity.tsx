import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { seniorTypography } from '@/constants/typography';

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>오늘의 활동</Text>
        <View style={styles.activityCard}>
          <Text style={styles.progress}>오늘 1 / 3</Text>
          <Text style={styles.activityTitle}>어제 기억나는 일을{'\n'}이야기해 주세요.</Text>
          <Text style={styles.description}>제가 질문을 읽어드리면{'\n'}천천히 말씀해 주세요.</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>첫 번째 활동 시작</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.familyCard}>
          <Text style={styles.familyTitle}>가족 소식이 도착했어요</Text>
          <Text style={styles.familyDescription}>오늘의 활동 3개를 모두 마치면{'\n'}사진과 메시지를 볼 수 있어요.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.page, paddingTop: 18 },
  title: { fontSize: seniorTypography.pageTitle, fontWeight: '800', color: colors.text, marginBottom: 28 },
  activityCard: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.page },
  progress: { fontSize: seniorTypography.bodyStrong, fontWeight: '800', color: colors.primary },
  activityTitle: { marginTop: spacing.item, fontSize: 28, lineHeight: 38, fontWeight: '800', color: colors.text },
  description: { marginTop: spacing.item, fontSize: seniorTypography.body, lineHeight: 26, color: colors.muted },
  primaryButton: { marginTop: 28, minHeight: spacing.primaryButtonHeight, backgroundColor: colors.primary, borderRadius: spacing.buttonRadius, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontSize: seniorTypography.button, fontWeight: '800', color: colors.white },
  familyCard: { marginTop: spacing.content, backgroundColor: '#FFFDF4', borderRadius: spacing.cardRadius, padding: spacing.content },
  familyTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  familyDescription: { marginTop: spacing.base * 2, fontSize: seniorTypography.body, lineHeight: 24, color: colors.muted },
});
