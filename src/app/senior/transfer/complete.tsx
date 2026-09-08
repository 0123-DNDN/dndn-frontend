import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransferCompleteScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.center}>
          <View style={styles.check}>
            <Text style={styles.checkText}>✓</Text>
          </View>

          <Text style={styles.title}>
            허경민님에게{'\n'}
            500,000원을 보냈어요.
          </Text>

          <Text style={styles.description}>
            KB 국민 든든통장에서 보냈어요.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/senior/home')}
        >
          <Text style={styles.primaryButtonText}>
            확인
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkText: {
    fontSize: 30,
    color: '#318866',
    fontWeight: '800',
  },

  title: {
    marginTop: 40,
    fontSize: 30,
    lineHeight: 40,
    textAlign: 'center',
    fontWeight: '800',
    color: '#191F28',
  },

  description: {
    marginTop: 16,
    fontSize: 18,
    color: '#8B95A1',
  },

  primaryButton: {
    height: 60,
    borderRadius: 16,
    backgroundColor: '#318866',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});