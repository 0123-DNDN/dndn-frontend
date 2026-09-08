import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function TransferAnalyzingScreen() {
  const { risk } = useLocalSearchParams<{ risk?: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(
        risk === 'true'
          ? '/senior/transfer/fds-warning'
          : '/senior/transfer/complete',
      );
    }, 1800);

    return () => clearTimeout(timer);
  }, [risk]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.centerArea}>
          <ActivityIndicator
            size="large"
            color="#318866"
          />

          <Text style={styles.heroText}>
            안전한 거래인지{'\n'}
            확인하고 있어요
          </Text>

          <Text style={styles.description}>
            잠시만 기다려 주세요
          </Text>
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
    paddingHorizontal: 24,
  },

  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroText: {
    marginTop: 40,
    fontSize: 32,
    lineHeight: 43,
    fontWeight: '700',
    textAlign: 'center',
    color: '#191F28',
    letterSpacing: -0.6,
  },

  description: {
    marginTop: 16,
    fontSize: 18,
    color: '#8B95A1',
  },
});