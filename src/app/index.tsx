import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StartScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>든든 DNDN</Text>

        <Text style={styles.title}>
          일상은 편하게,{'\n'}
          금융은 더 안전하게.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/senior/home')}
        >
          <Text style={styles.primaryButtonText}>시니어로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/guardian/home')}
        >
          <Text style={styles.secondaryButtonText}>보호자로 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F735E',
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 44,
    color: '#1F2A24',
    marginBottom: 48,
  },

  primaryButton: {
    height: 68,
    backgroundColor: '#3F735E',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  secondaryButton: {
    height: 68,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0DC',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#1F2A24',
    fontSize: 22,
    fontWeight: '700',
  },
});