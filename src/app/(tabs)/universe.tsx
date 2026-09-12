import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { avatar } from '../../data/avatar';

export default function OrbitHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ORBIT</Text>
            <Text style={styles.subtitle}>YOUR SOCIAL UNIVERSE</Text>
          </View>
        </View>

        <View style={styles.orbitContainer}>
          <View style={styles.orbitRing} />

          <View style={[styles.connection, styles.connectionOne]} />
          <View style={[styles.connection, styles.connectionTwo]} />
          <View style={[styles.connection, styles.connectionThree]} />
          <View style={[styles.connection, styles.connectionFour]} />

          <View style={styles.avatar}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatarCore}>
              <View style={styles.avatarInner} />
            </View>
          </View>

          <Text style={styles.avatarName}>{avatar.name}</Text>

          <Text style={styles.avatarLevel}>
            LEVEL {avatar.level}
          </Text>

          <View style={[styles.user, styles.userOne]}>
            <View style={styles.userDot} />
          </View>

          <View style={[styles.user, styles.userTwo]}>
            <View style={styles.userDot} />
          </View>

          <View style={[styles.user, styles.userThree]}>
            <View style={styles.userDot} />
          </View>

          <View style={[styles.user, styles.userFour]}>
            <View style={styles.userDot} />
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.sectionTitle}>YOUR ORBIT</Text>

          <Text style={styles.description}>
            Discover people who share{'\n'}
            your interests, goals and values.
          </Text>

          <Pressable
            onPress={() => router.push('/shake')}
            style={({ pressed }) => [
              styles.shakeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.shakeTitle}>SHAKE</Text>

            <Text style={styles.shakeSubtitle}>
              Find a new connection
            </Text>
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
    alignItems: 'flex-start',
  },

  title: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 6,
    color: '#171A20',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 11,
    letterSpacing: 2,
    color: '#7B808A',
  },

  orbitContainer: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  orbitRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 45, 0.16)',
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 5,
  },

  avatarGlow: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(120,130,145,0.10)',
  },

  avatarCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#171A20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F4F5F7',
  },

  avatarName: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#777D88',
  },

  avatarLevel: {
    marginTop: 4,
    fontSize: 10,
    letterSpacing: 2,
    color: '#A0A4AC',
  },

  user: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  userDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#20242C',
  },

  userOne: {
    top: 0,
    right: 30,
  },

  userTwo: {
    left: 0,
    top: 120,
  },

  userThree: {
    left: 45,
    bottom: 0,
  },

  userFour: {
    right: 10,
    bottom: 10,
  },

  connection: {
    position: 'absolute',
    width: 100,
    height: 1,
    backgroundColor: 'rgba(30, 35, 45, 0.10)',
  },

  connectionOne: {
    transform: [{ rotate: '35deg' }],
  },

  connectionTwo: {
    transform: [{ rotate: '-35deg' }],
  },

  connectionThree: {
    transform: [{ rotate: '145deg' }],
  },

  connectionFour: {
    transform: [{ rotate: '-145deg' }],
  },

  bottom: {
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 6,
    color: '#171A20',
    marginBottom: 24,
  },

  description: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 28,
    color: '#777D88',
    marginBottom: 28,
  },

  shakeButton: {
    width: '100%',
    height: 72,
    borderRadius: 36,
    backgroundColor: '#171A20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shakeTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
  },

  shakeSubtitle: {
    marginTop: 6,
    color: '#A7ABB3',
    fontSize: 14,
    letterSpacing: 2,
  },

  buttonPressed: {
    opacity: 0.75,
  },
});
