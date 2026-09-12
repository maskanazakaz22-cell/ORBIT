import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShakeScreen() {
  const [isListening, setIsListening] = useState(false);
  const [shakeDetected, setShakeDetected] = useState(false);

  const lastShakeTime = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (!isListening) {
        return;
      }

      let subscription: { remove: () => void } | null = null;
      let isActive = true;

      const startAccelerometer = async () => {
        const available = await Accelerometer.isAvailableAsync();

        if (!available || !isActive) {
          return;
        }

        Accelerometer.setUpdateInterval(100);

        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const acceleration = Math.sqrt(x * x + y * y + z * z);

          const now = Date.now();

          if (acceleration > 2.2 && now - lastShakeTime.current > 800) {
            lastShakeTime.current = now;

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 100);

            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 200);

            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 300);

            setShakeDetected(true);

            setTimeout(() => {
              setShakeDetected(false);
            }, 1200);
          }
        });
      };

      startAccelerometer();

      return () => {
        isActive = false;
        subscription?.remove();
        setIsListening(false);
        setShakeDetected(false);
      };
    }, [isListening])
  );

  const startShake = () => {
    setShakeDetected(false);
    setIsListening(true);
  };

  const stopShake = () => {
    setIsListening(false);
    setShakeDetected(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.replace('/(tabs)/universe')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>ORBIT</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>SHAKE</Text>
            <Text style={styles.subtitle}>FIND A NEW CONNECTION</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>

          <View
            style={[
              styles.shakeCircle,
              isListening && styles.shakeCircleActive,
              shakeDetected && styles.shakeCircleDetected,
            ]}
          >
            <Text style={styles.shakeIcon}>
              {shakeDetected ? '✓' : '↔'}
            </Text>
          </View>

          <Text style={styles.statusTitle}>
            {shakeDetected
              ? 'SHAKE DETECTED'
              : isListening
                ? 'SHAKE YOUR PHONE'
                : 'READY TO CONNECT'}
          </Text>

          <Text style={styles.description}>
            {shakeDetected
              ? 'Looking for another explorer...'
              : isListening
                ? 'Move your phone to activate SHAKE.'
                : 'Shake your phone to discover someone new.'}
          </Text>

        </View>

        <View style={styles.bottom}>

          {!isListening ? (
            <Pressable
              onPress={startShake}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>START SHAKE</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={stopShake}
              style={({ pressed }) => [
                styles.buttonSecondary,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonSecondaryText}>CANCEL</Text>
            </Pressable>
          )}

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 80,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 30,
    fontWeight: '300',
    color: '#171A20',
    marginRight: 4,
  },

  backText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#171A20',
  },

  header: {
    alignItems: 'center',
  },

  headerSpacer: {
    width: 80,
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 7,
    color: '#171A20',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 10,
    letterSpacing: 2,
    color: '#7B808A',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  shakeCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 5,
  },

  shakeCircleActive: {
    transform: [{ scale: 1.04 }],
  },

  shakeCircleDetected: {
    transform: [{ scale: 1.1 }],
  },

  shakeIcon: {
    fontSize: 56,
    fontWeight: '300',
    color: '#777D88',
  },

  statusTitle: {
    marginTop: 36,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
    color: '#171A20',
    textAlign: 'center',
  },

  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 23,
    color: '#777D88',
    textAlign: 'center',
    maxWidth: 300,
  },

  bottom: {
    alignItems: 'center',
  },

  button: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    backgroundColor: '#171A20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 3,
  },

  buttonSecondary: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 45, 0.12)',
  },

  buttonSecondaryText: {
    color: '#171A20',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 3,
  },

  buttonPressed: {
    opacity: 0.7,
  },
});
