import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import {
  fonts,
  guardianTypography,
} from '@/constants/typography';

export default function GuardianBottomNavigation() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() =>
          router.replace('/guardian/home')
        }
      >
        <Ionicons
          name="home"
          size={24}
          color={colors.primary}
        />
        <Text style={styles.activeLabel}>
          홈
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() =>
          router.push('/guardian/alerts')
        }
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color="#B0B8C1"
        />
        <Text style={styles.label}>
          알림
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() =>
          router.push('/guardian/report')
        }
      >
        <Ionicons
          name="stats-chart-outline"
          size={24}
          color="#B0B8C1"
        />
        <Text style={styles.label}>
          리포트
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() =>
          router.push('/guardian/settings')
        }
      >
        <Ionicons
          name="settings-outline"
          size={24}
          color="#B0B8C1"
        />
        <Text style={styles.label}>
          설정
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',

    paddingTop: 7,
    paddingBottom: 9,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  activeLabel: {
    fontSize: guardianTypography.tabLabel,
    lineHeight: 20,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  label: {
    fontSize: guardianTypography.tabLabel,
    lineHeight: 20,
    fontFamily: fonts.semiBold,
    color: '#B0B8C1',
  },
});