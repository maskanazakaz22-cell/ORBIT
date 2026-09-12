import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.orbit}>
            <View style={styles.orbitRing} />
            <View style={styles.orbitCore} />
            <View style={styles.orbitDot} />
          </View>

          <View style={styles.brand}>
            <Text style={styles.title}>ORBIT</Text>
            <Text style={styles.subtitle}>YOUR SOCIAL UNIVERSE</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.description}>
            Meet people who share your interests,
            {'\n'}
            goals and values.
          </Text>

          <Pressable
            onPress={() => router.replace('/(tabs)/universe')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>ENTER ORBIT</Text>
          </Pressable>
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

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  orbit: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 42,
  },

  orbitRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 45, 0.16)',
  },

  orbitCore: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 5,
  },

  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#20242C',
    top: 22,
    right: 22,
  },

  brand: {
    alignItems: 'center',
  },

  title: {
    fontSize: 42,
    fontWeight: '600',
    letterSpacing: 8,
    color: '#171A20',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#7B808A',
  },

  bottom: {
    alignItems: 'center',
  },

  description: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#6E737D',
    marginBottom: 28,
  },

  button: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#171A20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
  },
});