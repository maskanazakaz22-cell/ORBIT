import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiscoveryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.header}>
          <Text style={styles.title}>DISCOVERY</Text>
          <Text style={styles.subtitle}>YOUR NEXT ENCOUNTER</Text>
        </View>

        <View style={styles.center}>

          <View style={styles.discoveryCircle}>
            <View style={styles.innerCircle} />

            <View style={[styles.person, styles.personOne]}>
              <View style={styles.personDot} />
            </View>

            <View style={[styles.person, styles.personTwo]}>
              <View style={styles.personDot} />
            </View>

            <View style={[styles.person, styles.personThree]}>
              <View style={styles.personDot} />
            </View>
          </View>

          <Text style={styles.statusTitle}>
            PEOPLE AROUND YOU
          </Text>

          <Text style={styles.description}>
            Discover people who share
            {'\n'}
            your interests, goals and values.
          </Text>

        </View>

        <View style={styles.bottom}>

          <Pressable
            onPress={() => router.push('/shake')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>START SHAKE</Text>
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

  header: {
    alignItems: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 6,
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

  discoveryCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 45, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  innerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 4,
  },

  person: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  personDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#20242C',
  },

  personOne: {
    top: 10,
    right: 22,
  },

  personTwo: {
    left: 8,
    top: 88,
  },

  personThree: {
    right: 32,
    bottom: 8,
  },

  statusTitle: {
    marginTop: 34,
    fontSize: 17,
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

  buttonPressed: {
    opacity: 0.7,
  },
});