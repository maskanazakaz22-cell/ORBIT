import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { avatar } from '../../data/avatar';

type PersonalObject = {
  id: string;
  kind: 'bond' | 'world' | 'interest' | 'place';
  label: string;
  x: number;
  y: number;
  size: number;
  closeness: 'inner' | 'outer';
};

const SHOW_DEMO_UNIVERSE = true;
const SCENE_SIZE = 350;
const SCENE_CENTER = SCENE_SIZE / 2;

const personalObjects: PersonalObject[] = [
  { id: 'aria', kind: 'bond', label: 'ARIA', x: -92, y: -82, size: 54, closeness: 'inner' },
  { id: 'kai', kind: 'bond', label: 'KAI', x: 104, y: -34, size: 48, closeness: 'inner' },
  { id: 'mira', kind: 'bond', label: 'MIRA', x: 62, y: 108, size: 44, closeness: 'outer' },
  { id: 'travel', kind: 'world', label: 'Travel', x: 18, y: -142, size: 68, closeness: 'outer' },
  { id: 'design', kind: 'interest', label: 'Design', x: -138, y: 30, size: 48, closeness: 'outer' },
  { id: 'music', kind: 'interest', label: 'Music', x: -82, y: 126, size: 42, closeness: 'outer' },
  { id: 'tokyo', kind: 'place', label: 'Tokyo', x: 140, y: 52, size: 40, closeness: 'outer' },
];

function ConnectionLine({ object }: { object: PersonalObject }) {
  const distance = Math.hypot(object.x, object.y);
  const angle = Math.atan2(object.y, object.x) * 180 / Math.PI;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.connectionLine,
        object.closeness === 'inner' && styles.connectionLineStrong,
        {
          width: distance,
          left: SCENE_CENTER,
          top: SCENE_CENTER,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

function PersonalNode({ object }: { object: PersonalObject }) {
  return (
    <View
      style={[
        styles.node,
        styles[object.kind],
        object.closeness === 'inner' && styles.innerNode,
        {
          width: object.size,
          height: object.size,
          borderRadius: object.size / 2,
          left: SCENE_CENTER + object.x - object.size / 2,
          top: SCENE_CENTER + object.y - object.size / 2,
        },
      ]}
    >
      <View style={[styles.nodeCore, object.kind === 'bond' && styles.bondCore]} />
      <Text numberOfLines={1} style={[styles.nodeLabel, object.kind === 'bond' && styles.bondLabel]}>
        {object.label}
      </Text>
    </View>
  );
}

function QuietUniverse() {
  return (
    <View style={styles.quietState}>
      <View style={styles.quietOrbit}>
        <View style={styles.quietCore} />
      </View>
      <Text style={styles.quietTitle}>Your universe is quiet.</Text>
      <Text style={styles.quietCopy}>Explore or SHAKE to meet someone.</Text>
    </View>
  );
}

export default function UniverseScreen() {
  const hasConnections = SHOW_DEMO_UNIVERSE && personalObjects.some((object) => object.kind === 'bond');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>ORBIT</Text>
        <Text style={styles.title}>UNIVERSE</Text>
        <Text style={styles.subtitle}>YOUR PERSONAL SOCIAL MAP</Text>
      </View>

      <View style={styles.content}>
        {hasConnections ? (
          <>
            <View style={styles.scene}>
              <View style={styles.ambientGlow} />
              <View style={[styles.orbitRing, styles.orbitRingInner]} />
              <View style={[styles.orbitRing, styles.orbitRingOuter]} />
              {personalObjects.map((object) => <ConnectionLine key={`line-${object.id}`} object={object} />)}
              {personalObjects.map((object) => <PersonalNode key={object.id} object={object} />)}

              <View style={styles.youAnchor}>
                <View style={styles.youGlow} />
                <View style={styles.youCore}>
                  <View style={styles.youInner} />
                </View>
                <Text style={styles.youLabel}>YOU</Text>
              </View>
            </View>

            <View style={styles.caption}>
              <Text style={styles.captionTitle}>YOUR WORLD</Text>
              <Text style={styles.captionCopy}>{avatar.name}, these are the people and places closest to you.</Text>
            </View>
          </>
        ) : <QuietUniverse />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8' },
  header: { paddingHorizontal: 24, paddingTop: 16 },
  brand: { fontSize: 10, fontWeight: '600', letterSpacing: 3.5, color: '#7C899B' },
  title: { marginTop: 7, fontSize: 27, fontWeight: '600', letterSpacing: 7, color: '#202734' },
  subtitle: { marginTop: 8, fontSize: 9, fontWeight: '500', letterSpacing: 1.8, color: '#8794A5' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  scene: { width: SCENE_SIZE, height: SCENE_SIZE, alignItems: 'center', justifyContent: 'center' },
  ambientGlow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(121,184,255,0.08)' },
  orbitRing: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(105,132,166,0.20)' },
  orbitRingInner: { width: 206, height: 206 },
  orbitRingOuter: { width: 324, height: 324, borderColor: 'rgba(105,132,166,0.13)' },
  connectionLine: { position: 'absolute', height: 1, backgroundColor: 'rgba(103,132,168,0.20)', transformOrigin: 'left center' },
  connectionLineStrong: { height: 1.5, backgroundColor: 'rgba(91,145,207,0.36)' },
  node: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderWidth: 1, shadowColor: '#71849E', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  innerNode: { shadowColor: '#79B8FF', shadowOpacity: 0.23, shadowRadius: 13 },
  bond: { backgroundColor: 'rgba(255,255,255,0.96)', borderColor: 'rgba(93,128,168,0.50)' },
  world: { backgroundColor: 'rgba(229,239,250,0.96)', borderColor: 'rgba(87,121,161,0.48)' },
  interest: { backgroundColor: 'rgba(241,242,250,0.96)', borderColor: 'rgba(112,119,158,0.40)' },
  place: { backgroundColor: 'rgba(233,246,248,0.96)', borderColor: 'rgba(91,139,148,0.42)' },
  nodeCore: { position: 'absolute', width: '34%', height: '34%', borderRadius: 999, backgroundColor: 'rgba(104,132,166,0.20)' },
  bondCore: { width: '28%', height: '28%', backgroundColor: '#79B8FF', shadowColor: '#79B8FF', shadowOpacity: 0.38, shadowRadius: 7 },
  nodeLabel: { maxWidth: '82%', fontSize: 8, fontWeight: '600', letterSpacing: 0.35, color: '#2F4055', textAlign: 'center' },
  bondLabel: { fontSize: 7, letterSpacing: 0.75, color: '#20334B' },
  youAnchor: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: 'rgba(103,137,177,0.40)', shadowColor: '#7194BD', shadowOpacity: 0.24, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  youGlow: { position: 'absolute', width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(121,184,255,0.14)' },
  youCore: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#26384E' },
  youInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#EDF5FE' },
  youLabel: { position: 'absolute', bottom: 12, fontSize: 8, fontWeight: '600', letterSpacing: 1.7, color: '#55728F' },
  caption: { width: 280, marginTop: 12, alignItems: 'center' },
  captionTitle: { fontSize: 10, fontWeight: '600', letterSpacing: 2.7, color: '#61748A' },
  captionCopy: { marginTop: 9, fontSize: 13, lineHeight: 19, color: '#758398', textAlign: 'center' },
  quietState: { alignItems: 'center', paddingHorizontal: 30 },
  quietOrbit: { width: 156, height: 156, borderRadius: 78, borderWidth: 1, borderColor: 'rgba(105,132,166,0.20)', alignItems: 'center', justifyContent: 'center' },
  quietCore: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(121,184,255,0.14)', borderWidth: 1, borderColor: 'rgba(121,184,255,0.42)' },
  quietTitle: { marginTop: 32, fontSize: 21, fontWeight: '500', letterSpacing: 0.4, color: '#263449' },
  quietCopy: { marginTop: 10, fontSize: 13, letterSpacing: 0.2, color: '#7A899C' },
});
