import { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type ObjectType = 'world' | 'interest' | 'place' | 'person';
type SpatialObject = {
  id: string;
  type: ObjectType;
  label: string;
  description?: string;
  x: number;
  y: number;
  depth: number;
  size: number;
  motionPhase: number;
};

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 2.2;
const PAN_LIMIT = 92;

const sceneObjects: SpatialObject[] = [
  { id: 'travel', type: 'world', label: 'Travel', x: -126, y: -172, depth: 0.92, size: 82, motionPhase: 0.4 },
  { id: 'nature', type: 'world', label: 'Nature', x: 142, y: -142, depth: 0.78, size: 76, motionPhase: 1.1 },
  { id: 'music', type: 'world', label: 'Music', x: -176, y: 6, depth: 0.7, size: 72, motionPhase: 2.2 },
  { id: 'art', type: 'world', label: 'Art', x: 172, y: 48, depth: 0.88, size: 78, motionPhase: 3.5 },
  { id: 'technology', type: 'world', label: 'Technology', x: -82, y: 178, depth: 0.82, size: 76, motionPhase: 4.2 },
  { id: 'wellness', type: 'world', label: 'Wellness', x: 112, y: 174, depth: 0.68, size: 70, motionPhase: 5.1 },
  { id: 'design', type: 'interest', label: 'Design', x: -48, y: -126, depth: 0.58, size: 46, motionPhase: 0.8 },
  { id: 'movement', type: 'interest', label: 'Movement', x: 76, y: -102, depth: 0.52, size: 42, motionPhase: 2.7 },
  { id: 'food', type: 'interest', label: 'Food', x: -132, y: 104, depth: 0.48, size: 38, motionPhase: 4.6 },
  { id: 'ideas', type: 'interest', label: 'Ideas', x: 132, y: 112, depth: 0.54, size: 42, motionPhase: 5.5 },
  { id: 'film', type: 'interest', label: 'Film', x: -208, y: -72, depth: 0.38, size: 34, motionPhase: 1.7 },
  { id: 'books', type: 'interest', label: 'Books', x: 208, y: -46, depth: 0.42, size: 36, motionPhase: 3.1 },
  { id: 'mind', type: 'interest', label: 'Mind', x: -24, y: 142, depth: 0.5, size: 40, motionPhase: 0.1 },
  { id: 'sound', type: 'interest', label: 'Sound', x: 42, y: 142, depth: 0.44, size: 36, motionPhase: 4.1 },
  { id: 'coast', type: 'place', label: 'Coast', x: -224, y: 88, depth: 0.3, size: 28, motionPhase: 2.5 },
  { id: 'tokyo', type: 'place', label: 'Tokyo', x: 218, y: 102, depth: 0.34, size: 30, motionPhase: 3.8 },
  { id: 'studio', type: 'place', label: 'Studio', x: -8, y: -218, depth: 0.36, size: 30, motionPhase: 4.8 },
  { id: 'park', type: 'place', label: 'Park', x: 16, y: 218, depth: 0.32, size: 28, motionPhase: 1.4 },
  { id: 'gallery', type: 'place', label: 'Gallery', x: 194, y: -154, depth: 0.4, size: 32, motionPhase: 5.9 },
  { id: 'trail', type: 'place', label: 'Trail', x: -192, y: -146, depth: 0.35, size: 30, motionPhase: 2.9 },
  { id: 'rooftop', type: 'place', label: 'Rooftop', x: 232, y: 8, depth: 0.28, size: 26, motionPhase: 0.6 },
  { id: 'aria', type: 'person', label: 'ARIA', description: 'Travel · Design · Photography', x: -104, y: -52, depth: 0.74, size: 26, motionPhase: 1.9 },
  { id: 'noah', type: 'person', label: 'NOAH', description: 'Music · Sound · Tokyo', x: 112, y: -38, depth: 0.7, size: 25, motionPhase: 3.3 },
  { id: 'mira', type: 'person', label: 'MIRA', description: 'Art · Film · Gallery', x: -148, y: 54, depth: 0.66, size: 24, motionPhase: 4.5 },
  { id: 'leo', type: 'person', label: 'LEO', description: 'Nature · Movement · Trail', x: 146, y: 70, depth: 0.72, size: 26, motionPhase: 5.7 },
  { id: 'june', type: 'person', label: 'JUNE', description: 'Books · Ideas · Coast', x: -58, y: 96, depth: 0.62, size: 23, motionPhase: 2.4 },
  { id: 'kai', type: 'person', label: 'KAI', description: 'Wellness · Food · Park', x: 58, y: 100, depth: 0.64, size: 24, motionPhase: 0.9 },
  { id: 'sora', type: 'person', label: 'SORA', description: 'Design · Technology · Studio', x: -4, y: -98, depth: 0.6, size: 22, motionPhase: 3.9 },
  { id: 'eden', type: 'person', label: 'EDEN', description: 'Nature · Travel · Coast', x: -226, y: -6, depth: 0.26, size: 20, motionPhase: 5.2 },
  { id: 'niko', type: 'person', label: 'NIKO', description: 'Music · Art · Rooftop', x: 16, y: -172, depth: 0.46, size: 21, motionPhase: 1.2 },
];

const connections = [
  { x: -63, y: -86, width: 128, rotation: 48, depth: 0.58 },
  { x: 72, y: -70, width: 122, rotation: -38, depth: 0.56 },
  { x: -90, y: 84, width: 116, rotation: -32, depth: 0.5 },
  { x: 88, y: 98, width: 124, rotation: 36, depth: 0.54 },
  { x: 4, y: 144, width: 104, rotation: 0, depth: 0.44 },
];

function clamp(value: number, minimum: number, maximum: number) {
  'worklet';
  return Math.min(Math.max(value, minimum), maximum);
}

// Rendering and tap hit-testing share the same UI-thread scene coordinates.
function objectPosition(object: SpatialObject, zoom: number, x: number, y: number, drift: number) {
  'worklet';
  const parallax = 0.2 + object.depth * 0.8;
  const floating = Math.sin(drift * Math.PI * 2 + object.motionPhase) * (1.5 + object.depth * 3.5);
  return {
    x: object.x * zoom + x * parallax + floating,
    y: object.y * zoom + y * parallax + floating * 0.7,
    scale: zoom * (0.58 + object.depth * 0.5),
  };
}

function objectDescription(object: SpatialObject) {
  if (object.description) return object.description;
  switch (object.type) {
    case 'world': return `People, places and interests connected through ${object.label.toLowerCase()}.`;
    case 'interest': return `People connected through ${object.label.toLowerCase()}.`;
    case 'place': return `People and experiences around ${object.label}.`;
    case 'person': return 'Discover shared interests and experiences.';
  }
}

function SelectionCard({ object, onClose }: { object: SpatialObject; onClose: () => void }) {
  const supportsGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  return (
    <View style={styles.card}>
      {supportsGlass ? (
        <GlassView pointerEvents="none" style={styles.cardBackground} glassEffectStyle="regular" colorScheme="dark" tintColor="#242C3D" />
      ) : <View pointerEvents="none" style={[styles.cardBackground, styles.cardFallback]} />}
      <View style={styles.cardContent}>
        <View style={styles.cardCopy} accessibilityLiveRegion="polite">
          <Text style={styles.cardType}>{object.type.toUpperCase()}</Text>
          <Text accessibilityRole="header" style={styles.cardTitle}>{object.label}</Text>
          <Text style={styles.cardDescription}>{objectDescription(object)}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close object information" onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeSymbol}>×</Text>
        </Pressable>
      </View>
    </View>
  );
}

type MotionProps = {
  scale: SharedValue<number>;
  panX: SharedValue<number>;
  panY: SharedValue<number>;
  drift: SharedValue<number>;
};

function Ring({ size, phase, drift }: Pick<MotionProps, 'drift'> & { size: number; phase: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    const motion = Math.sin(drift.value * Math.PI * 2 + phase);
    return {
      opacity: 0.12 + motion * 0.025,
      transform: [{ perspective: 900 }, { rotateX: '62deg' }, { rotateZ: `${phase + motion * 4}deg` }],
    };
  });

  return <Animated.View style={[styles.ring, { width: size, height: size }, animatedStyle]} />;
}

function Connection({ connection, scale, panX, panY, drift }: MotionProps & { connection: (typeof connections)[number] }) {
  const animatedStyle = useAnimatedStyle(() => {
    const parallax = 0.22 + connection.depth * 0.7;
    return {
      opacity: 0.08 + connection.depth * 0.1,
      transform: [
        { translateX: connection.x * scale.value + panX.value * parallax },
        { translateY: connection.y * scale.value + panY.value * parallax + Math.sin(drift.value * Math.PI * 2 + connection.rotation) * 1.5 },
        { rotateZ: `${connection.rotation}deg` },
        { scaleX: scale.value },
      ],
    };
  });

  return <Animated.View style={[styles.connection, { width: connection.width }, animatedStyle]} />;
}

function ObjectNode({ object, selected, scale, panX, panY, drift }: MotionProps & { object: SpatialObject; selected: boolean }) {
  const selection = useSharedValue(0);
  useEffect(() => {
    const target = selected ? 1 : 0;
    if (selection.value !== target) selection.value = withTiming(target, { duration: 200 });
  }, [selected, selection]);
  const animatedStyle = useAnimatedStyle(() => {
    const zoom = scale.value;
    const position = objectPosition(object, zoom, panX.value, panY.value, drift.value);
    const detailOpacity = object.type === 'world'
      ? 0.9
      : object.type === 'person'
        ? clamp((zoom - 1.02) / 0.5, 0.2, 0.92)
        : clamp((zoom - 0.72) / 0.48, 0.3, 0.82);

    return {
      opacity: detailOpacity * (0.52 + object.depth * 0.48) * (1 - selection.value) + 0.98 * selection.value,
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { scale: position.scale * (1 + selection.value * 0.06) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.node, { width: object.size, height: object.size, marginLeft: -object.size / 2, marginTop: -object.size / 2 }, animatedStyle]}>
      {selected && <View style={styles.selectionRing} />}
      <View style={[styles.surface, object.type === 'world' && styles.world, object.type === 'person' && styles.person]}>
        <View style={styles.nodeGlow} />
        <Text numberOfLines={1} style={[styles.nodeLabel, object.type !== 'world' && styles.detailLabel]}>{object.label}</Text>
      </View>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedObject = sceneObjects.find((object) => object.id === selectedId);
  const selectObject = useCallback((id: string | null) => {
    setSelectedId((current) => current === id ? current : id);
  }, []);
  const sceneWidth = useSharedValue(0);
  const sceneHeight = useSharedValue(0);
  const scale = useSharedValue(1);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);
  const pinchStartScale = useSharedValue(1);
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(drift);
  }, [drift]);

  const sceneGesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(6)
      .onStart(() => {
        panStartX.value = panX.value;
        panStartY.value = panY.value;
      })
      .onUpdate((event) => {
        panX.value = clamp(panStartX.value + event.translationX, -PAN_LIMIT, PAN_LIMIT);
        panY.value = clamp(panStartY.value + event.translationY, -PAN_LIMIT, PAN_LIMIT);
      });
    const pinch = Gesture.Pinch()
      .onStart(() => { pinchStartScale.value = scale.value; })
      .onUpdate((event) => { scale.value = clamp(pinchStartScale.value * event.scale, MIN_ZOOM, MAX_ZOOM); });

    const tap = Gesture.Tap()
      .maxDistance(6)
      .maxDuration(250)
      .onTouchesDown((event, manager) => {
        if (event.numberOfTouches > 1) manager.fail();
      })
      .onEnd((event, success) => {
        if (!success) return;
        const x = event.x - sceneWidth.value / 2;
        const y = event.y - sceneHeight.value / 2;
        // YOU is drawn above the objects and remains a non-selectable anchor.
        if (Math.abs(x) < 40 && y > -55 && y < 55) return;
        let hit: string | null = null;
        let nearest = Infinity;
        // Prefer visible surfaces in reverse paint order, then nearest padded target.
        for (let index = sceneObjects.length - 1; index >= 0; index--) {
          const object = sceneObjects[index];
          const position = objectPosition(object, scale.value, panX.value, panY.value, drift.value);
          const distance = Math.hypot(x - position.x, y - position.y);
          const radius = object.size * position.scale / 2;
          if (distance <= radius) {
            hit = object.id;
            break;
          }
          if (distance <= Math.max(22, radius + 4) && distance < nearest) {
            hit = object.id;
            nearest = distance;
          }
        }
        runOnJS(selectObject)(hit);
      });

    return Gesture.Exclusive(Gesture.Simultaneous(pan, pinch), tap);
  }, [panStartX, panStartY, panX, panY, pinchStartScale, scale, drift, sceneWidth, sceneHeight, selectObject]);

  const changeZoom = (amount: number) => {
    scale.value = withTiming(clamp(scale.value + amount, MIN_ZOOM, MAX_ZOOM), { duration: 220 });
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ORBIT</Text>
          <Text style={styles.title}>EXPLORE</Text>
          <Text style={styles.categories}>WORLDS · PEOPLE · INTERESTS · PLACES</Text>
        </View>

        <View style={styles.sceneFrame}>
          <GestureDetector gesture={sceneGesture}>
            <View collapsable={false} style={styles.scene} onLayout={({ nativeEvent }) => {
              sceneWidth.value = nativeEvent.layout.width;
              sceneHeight.value = nativeEvent.layout.height;
            }}>
              <View style={styles.backgroundGlow} />
              <View style={styles.star} />
              <View pointerEvents="none" style={styles.sceneLayer}>
                {[{ size: 210, phase: 8 }, { size: 322, phase: 24 }, { size: 444, phase: 42 }, { size: 578, phase: 64 }].map((ring) => (
                  <Ring drift={drift} key={ring.size} {...ring} />
                ))}
                {connections.map((connection) => <Connection connection={connection} drift={drift} key={`${connection.x}-${connection.y}`} panX={panX} panY={panY} scale={scale} />)}
                {sceneObjects.map((object) => <ObjectNode drift={drift} key={object.id} object={object} selected={selectedId === object.id} panX={panX} panY={panY} scale={scale} />)}
                <View style={styles.you}>
                  <View style={styles.youHalo} />
                  <View style={styles.youCore}><View style={styles.youInner} /></View>
                  <Text style={styles.youLabel}>YOU</Text>
                </View>
              </View>
            </View>
          </GestureDetector>
          {selectedObject && <SelectionCard object={selectedObject} onClose={() => selectObject(null)} />}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Explore what moves you.</Text>
          <View style={styles.zoomControls}>
            <Pressable onPress={() => changeZoom(0.18)} style={styles.zoomButton}><Text style={styles.zoomSymbol}>+</Text></Pressable>
            <Pressable onPress={() => changeZoom(-0.18)} style={styles.zoomButton}><Text style={styles.zoomSymbol}>−</Text></Pressable>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, backgroundColor: '#10131A' },
  header: { paddingHorizontal: 24, paddingTop: 14 },
  brand: { fontSize: 10, fontWeight: '600', letterSpacing: 3.5, color: 'rgba(228, 232, 240, 0.56)' },
  title: { marginTop: 7, fontSize: 27, fontWeight: '600', letterSpacing: 7, color: '#F4F5F7' },
  categories: { marginTop: 12, fontSize: 9, fontWeight: '500', letterSpacing: 1.4, color: 'rgba(205, 211, 224, 0.48)' },
  sceneFrame: { flex: 1, marginTop: 10 },
  scene: { flex: 1, overflow: 'hidden' },
  selectionRing: { position: 'absolute', top: -4, right: -4, bottom: -4, left: -4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(237,243,255,0.55)' },
  card: { position: 'absolute', bottom: 8, left: 20, right: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(230,238,255,0.22)', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  cardBackground: { ...StyleSheet.absoluteFill, borderRadius: 24 },
  cardFallback: { backgroundColor: 'rgba(35,43,58,0.96)' },
  cardContent: { padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardCopy: { flex: 1 },
  cardType: { fontSize: 9, fontWeight: '600', letterSpacing: 2.5, color: '#ADBBD1' },
  cardTitle: { marginTop: 8, fontSize: 23, fontWeight: '500', letterSpacing: 1.5, color: '#F5F7FC' },
  cardDescription: { marginTop: 8, fontSize: 13, lineHeight: 20, color: '#C8D2E2' },
  closeButton: { width: 44, height: 44, marginTop: -10, marginRight: -10, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  closeSymbol: { fontSize: 25, fontWeight: '300', color: '#C8D2E2' },
  backgroundGlow: { position: 'absolute', width: 420, height: 420, borderRadius: 210, alignSelf: 'center', top: '24%', backgroundColor: 'rgba(156, 171, 205, 0.07)' },
  star: { position: 'absolute', width: 4, height: 4, borderRadius: 2, top: '22%', right: 44, backgroundColor: 'rgba(255,255,255,0.68)', shadowColor: '#FFFFFF', shadowOpacity: 0.35, shadowRadius: 8 },
  sceneLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(215, 223, 239, 0.76)', borderRadius: 999 },
  connection: { position: 'absolute', height: 1, borderRadius: 1, backgroundColor: 'rgba(219, 227, 241, 0.9)' },
  node: { position: 'absolute', left: '50%', top: '50%', alignItems: 'center', justifyContent: 'center' },
  surface: { width: '100%', height: '100%', borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(226, 232, 243, 0.13)', borderWidth: 1, borderColor: 'rgba(242, 246, 255, 0.34)' },
  world: { backgroundColor: 'rgba(231, 237, 247, 0.2)', borderColor: 'rgba(255,255,255,0.54)', shadowColor: '#D6E2FF', shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } },
  person: { backgroundColor: 'rgba(255, 255, 255, 0.24)' },
  nodeGlow: { position: 'absolute', width: '54%', height: '54%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)' },
  nodeLabel: { maxWidth: '82%', fontSize: 9, fontWeight: '600', letterSpacing: 0.6, color: '#F7F9FD', textAlign: 'center' },
  detailLabel: { fontSize: 7, letterSpacing: 0.35, color: 'rgba(245,248,255,0.84)' },
  you: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  youHalo: { position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(239, 244, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(246, 249, 255, 0.2)' },
  youCore: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FB', shadowColor: '#DCE7FF', shadowOpacity: 0.34, shadowRadius: 22, shadowOffset: { width: 0, height: 8 } },
  youInner: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#151923' },
  youLabel: { marginTop: 13, fontSize: 11, fontWeight: '600', letterSpacing: 3.4, color: '#FFFFFF' },
  footer: { minHeight: 78, paddingHorizontal: 24, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerText: { fontSize: 14, letterSpacing: 0.3, color: 'rgba(225, 231, 241, 0.68)' },
  zoomControls: { flexDirection: 'row', gap: 8 },
  zoomButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  zoomSymbol: { marginTop: -1, fontSize: 22, fontWeight: '300', color: '#F5F7FB' },
});
