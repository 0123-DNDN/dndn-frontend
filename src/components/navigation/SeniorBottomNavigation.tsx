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
  seniorTypography,
} from '@/constants/typography';

export default function SeniorBottomNavigation() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() =>
          router.replace('/senior/home')
        }
      >
        <Ionicons
          name="home"
          size={27}
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
          router.push('/senior/assistant')
        }
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={27}
          color="#B0B8C1"
        />
        <Text style={styles.label}>
          AI 비서
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() =>
          router.push('/senior/activity')
        }
      >
        <Ionicons
          name="walk-outline"
          size={28}
          color="#B0B8C1"
        />
        <Text style={styles.label}>
          활동
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',

    paddingTop: 8,
    paddingBottom: 10,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  activeLabel: {
    fontSize: seniorTypography.tabLabel,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  label: {
    fontSize: seniorTypography.tabLabel,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: '#B0B8C1',
  },
});