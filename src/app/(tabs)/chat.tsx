import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>ORBIT</Text>
        <View style={styles.card}>
          <View style={styles.orbit} />
          <Text style={styles.title}>CHAT</Text>
          <Text style={styles.description}>Connections & conversations</Text>
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
    padding: 28,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#777D88',
  },
  card: {
    flex: 1,
    marginVertical: 72,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 45, 0.10)',
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.64)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  orbit: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(30, 35, 45, 0.16)',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 7,
    color: '#171A20',
  },
  description: {
    marginTop: 14,
    fontSize: 15,
    color: '#777D88',
  },
});
