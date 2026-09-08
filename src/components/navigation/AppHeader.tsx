import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

type AppHeaderProps = {
  mode: 'senior' | 'guardian';
};

export default function AppHeader({
  mode,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  const isSenior = mode === 'senior';

  const handleSettings = () => {
    if (isSenior) {
      // TODO: 시니어 설정 화면 구현 후 연결
      return;
    }

    router.push('/guardian/settings');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height:
            insets.top +
            (isSenior ? 64 : 56),
        },
      ]}
    >
      <View style={styles.logoWrap}>
        <Image
          source={require('../../../assets/images/dndn-logo.png')}
          style={
            isSenior
              ? styles.seniorLogo
              : styles.guardianLogo
          }
          resizeMode="contain"
          accessibilityLabel="든든 DNDN 로고"
        />
      </View>

      <TouchableOpacity
        style={
          isSenior
            ? styles.seniorIconButton
            : styles.guardianIconButton
        }
        activeOpacity={0.6}
        onPress={handleSettings}
      >
        <Ionicons
          name="settings-outline"
          size={isSenior ? 28 : 25}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },

  logoWrap: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  seniorLogo: {
    width: 32,
    height: 32,
  },

  guardianLogo: {
    width: 36,
    height: 36,
  },

  seniorIconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  guardianIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});