import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { spacing } from '@/constants/spacing';
import { fonts, seniorTypography } from '@/constants/typography';

export default function SeniorHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>
          김영희님,{'\n'}
          무엇을 도와드릴까요?
        </Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.menuButton}
            onPress={() =>
              router.push('/senior/account')
            }
          >
            <View style={styles.textArea}>
              <Text style={styles.menuTitle}>
                내 통장 보기
              </Text>

              <Text style={styles.menuDescription}>
                잔액과 거래내역을 확인해요
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.menuButton}
            onPress={() =>
              router.push(
                '/senior/transfer/request',
              )
            }
          >
            <View style={styles.textArea}>
              <Text style={styles.menuTitle}>
                돈 보내기
              </Text>

              <Text style={styles.menuDescription}>
                말로 쉽고 안전하게 보내요
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.menuButton}
            onPress={() =>
              router.push(
                '/senior/notifications',
              )
            }
          >
            <View style={styles.textArea}>
              <Text style={styles.menuTitle}>
                정기결제 확인
              </Text>

              <Text style={styles.menuDescription}>
                정기결제 및 자동이체를 확인해요
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.page,
    paddingTop: 18,
  },

  logo: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: '#318866',
    marginBottom: 34,
  },

  greeting: {
    fontSize:
      seniorTypography.pageTitle,
    fontFamily: fonts.bold,
    lineHeight: 42,
    letterSpacing: -0.8,
    color: '#191F28',
    marginBottom: spacing.content,
  },

  menuContainer: {
    gap: spacing.item,
  },

  menuButton: {
    width: '100%',
    minHeight:
      spacing.touchTarget * 2 +
      spacing.content,

    backgroundColor: '#FFFFFF',
    borderRadius:
      spacing.cardRadius,

    paddingHorizontal: 22,
    paddingVertical: 22,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  textArea: {
    flex: 1,
  },

  menuTitle: {
    fontSize:
      seniorTypography.sectionTitle,
    fontFamily: fonts.bold,
    color: '#191F28',
    letterSpacing: -0.5,
  },

  menuDescription: {
    marginTop: 8,
    fontSize:
      seniorTypography.body,
    fontFamily: fonts.regular,
    color: '#8B95A1',
    letterSpacing: -0.2,
  },

  arrow: {
    fontSize: 34,
    fontWeight: '300',
    color: '#B0B8C1',
    marginLeft: 12,
  },
});