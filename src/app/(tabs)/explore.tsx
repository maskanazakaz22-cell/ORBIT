import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type ObjectType = 'world' | 'interest' | 'place' | 'person';
type CategoryFilter = ObjectType | 'all';

const categories: { type: ObjectType; label: string }[] = [
  { type: 'world', label: 'Worlds' },
  { type: 'person', label: 'People' },
  { type: 'interest', label: 'Interests' },
  { type: 'place', label: 'Places' },
];
type SpatialObject = {
  id: string;
  type: ObjectType;
  label: string;
  description?: string;
  relatedIds?: string[];
  interests?: string[];
  x: number;
  y: number;
  depth: number;
  size: number;
  motionPhase: number;
};

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 2.2;
const PAN_OVERSCAN = 28;
const BASE_EXPLORATION_PAN = 120;
const ORBIT_ACCENT = '#79B8FF';
// Keep ordinary finger jitter below pan activation. Tap has a little extra
// tolerance; once a real drag activates, its tap sequence is marked ineligible.
const PAN_ACTIVATION_DISTANCE = 12;
const TAP_MOVEMENT_TOLERANCE = 14;

const sceneObjects: SpatialObject[] = [
  { id: 'travel', relatedIds: ['coast', 'tokyo', 'trail', 'food'], type: 'world', label: 'Travel', x: -126, y: -172, depth: 0.92, size: 82, motionPhase: 0.4 },
  { id: 'nature', relatedIds: ['movement', 'park', 'trail', 'coast'], type: 'world', label: 'Nature', x: 142, y: -142, depth: 0.78, size: 76, motionPhase: 1.1 },
  { id: 'music', relatedIds: ['sound', 'rooftop'], type: 'world', label: 'Music', x: -176, y: 6, depth: 0.7, size: 72, motionPhase: 2.2 },
  { id: 'art', relatedIds: ['design', 'film', 'gallery'], type: 'world', label: 'Art', x: 172, y: 48, depth: 0.88, size: 78, motionPhase: 3.5 },
  { id: 'technology', relatedIds: ['design', 'ideas', 'studio'], type: 'world', label: 'Technology', x: -82, y: 178, depth: 0.82, size: 76, motionPhase: 4.2 },
  { id: 'wellness', relatedIds: ['movement', 'mind', 'food', 'park'], type: 'world', label: 'Wellness', x: 112, y: 174, depth: 0.68, size: 70, motionPhase: 5.1 },
  { id: 'design', relatedIds: ['studio', 'gallery'], type: 'interest', label: 'Design', x: -48, y: -126, depth: 0.58, size: 46, motionPhase: 0.8 },
  { id: 'movement', relatedIds: ['park', 'trail'], type: 'interest', label: 'Movement', x: 76, y: -102, depth: 0.52, size: 42, motionPhase: 2.7 },
  { id: 'food', relatedIds: ['tokyo', 'rooftop'], type: 'interest', label: 'Food', x: -132, y: 104, depth: 0.48, size: 38, motionPhase: 4.6 },
  { id: 'ideas', relatedIds: ['books', 'studio'], type: 'interest', label: 'Ideas', x: 132, y: 112, depth: 0.54, size: 42, motionPhase: 5.5 },
  { id: 'film', relatedIds: ['gallery'], type: 'interest', label: 'Film', x: -208, y: -72, depth: 0.38, size: 34, motionPhase: 1.7 },
  { id: 'books', relatedIds: ['coast'], type: 'interest', label: 'Books', x: 208, y: -46, depth: 0.42, size: 36, motionPhase: 3.1 },
  { id: 'mind', relatedIds: ['park'], type: 'interest', label: 'Mind', x: -24, y: 142, depth: 0.5, size: 40, motionPhase: 0.1 },
  { id: 'sound', relatedIds: ['studio', 'rooftop'], type: 'interest', label: 'Sound', x: 42, y: 142, depth: 0.44, size: 36, motionPhase: 4.1 },
  { id: 'coast', type: 'place', label: 'Coast', x: -224, y: 88, depth: 0.3, size: 28, motionPhase: 2.5 },
  { id: 'tokyo', type: 'place', label: 'Tokyo', x: 218, y: 102, depth: 0.34, size: 30, motionPhase: 3.8 },
  { id: 'studio', type: 'place', label: 'Studio', x: -8, y: -218, depth: 0.36, size: 30, motionPhase: 4.8 },
  { id: 'park', type: 'place', label: 'Park', x: 16, y: 218, depth: 0.32, size: 28, motionPhase: 1.4 },
  { id: 'gallery', type: 'place', label: 'Gallery', x: 194, y: -154, depth: 0.4, size: 32, motionPhase: 5.9 },
  { id: 'trail', type: 'place', label: 'Trail', x: -192, y: -146, depth: 0.35, size: 30, motionPhase: 2.9 },
  { id: 'rooftop', type: 'place', label: 'Rooftop', x: 232, y: 8, depth: 0.28, size: 26, motionPhase: 0.6 },
  { id: 'aria', relatedIds: ['travel', 'design', 'tokyo'], type: 'person', label: 'ARIA', interests: ['Travel', 'Design', 'Photography'], description: 'Finding inspiration in Tokyo and new perspectives.', x: -104, y: -52, depth: 0.74, size: 26, motionPhase: 1.9 },
  { id: 'noah', relatedIds: ['music', 'sound', 'tokyo'], type: 'person', label: 'NOAH', interests: ['Music', 'Sound'], description: 'Exploring the sounds and rhythms of Tokyo.', x: 112, y: -38, depth: 0.7, size: 25, motionPhase: 3.3 },
  { id: 'mira', relatedIds: ['art', 'film', 'gallery'], type: 'person', label: 'MIRA', interests: ['Art', 'Film'], description: 'Finding stories in galleries and on screen.', x: -148, y: 54, depth: 0.66, size: 24, motionPhase: 4.5 },
  { id: 'leo', relatedIds: ['nature', 'movement', 'trail'], type: 'person', label: 'LEO', interests: ['Nature', 'Movement'], description: 'Following new trails and moving outdoors.', x: 146, y: 70, depth: 0.72, size: 26, motionPhase: 5.7 },
  { id: 'june', relatedIds: ['books', 'ideas', 'coast'], type: 'person', label: 'JUNE', interests: ['Books', 'Ideas'], description: 'Sharing new ideas and quiet moments by the coast.', x: -58, y: 96, depth: 0.62, size: 23, motionPhase: 2.4 },
  { id: 'kai', relatedIds: ['wellness', 'food', 'park'], type: 'person', label: 'KAI', interests: ['Wellness', 'Food'], description: 'Connecting through food and time in the park.', x: 58, y: 100, depth: 0.64, size: 24, motionPhase: 0.9 },
  { id: 'sora', relatedIds: ['design', 'technology', 'studio'], type: 'person', label: 'SORA', interests: ['Design', 'Technology'], description: 'Exploring where design and technology meet in the studio.', x: -4, y: -98, depth: 0.6, size: 22, motionPhase: 3.9 },
  { id: 'eden', relatedIds: ['nature', 'travel', 'coast'], type: 'person', label: 'EDEN', interests: ['Nature', 'Travel'], description: 'Discovering coastal places and time in nature.', x: -226, y: -6, depth: 0.26, size: 20, motionPhase: 5.2 },
  { id: 'niko', relatedIds: ['music', 'art', 'rooftop'], type: 'person', label: 'NIKO', interests: ['Music', 'Art'], description: 'Finding music and art above the city rooftops.', x: 16, y: -172, depth: 0.46, size: 21, motionPhase: 1.2 },
];

// Static content extents, independent of viewport and focus state. Include the
// largest focus scale and selection ring so focusing never changes the bounds.
// Decorative rings are stationary and do not define pannable content.
const contentExtents = sceneObjects.map((object) => {
  const radius = (object.size / 2 + 4) * (0.58 + object.depth * 0.5) * 1.08;
  return {
    halfWidth: Math.abs(object.x) + radius,
    halfHeight: Math.abs(object.y) + radius,
    drift: 1.5 + object.depth * 3.5,
    parallax: 0.2 + object.depth * 0.8,
  };
});

function contentBounds(zoom: number, viewportWidth: number, viewportHeight: number) {
  'worklet';
  let sceneWidth = 0;
  let sceneHeight = 0;
  let maxPanX = 0;
  let maxPanY = 0;
  for (const extent of contentExtents) {
    // Drift is measured in screen points; unlike object geometry it isn't zoomed.
    const halfWidth = extent.halfWidth * zoom + extent.drift;
    const halfHeight = extent.halfHeight * zoom + extent.drift * 0.7;
    sceneWidth = Math.max(sceneWidth, halfWidth * 2);
    sceneHeight = Math.max(sceneHeight, halfHeight * 2);
    // Rendering applies pan * parallax. Convert visible overflow back to pan
    // units per object, otherwise distant objects remain unreachable at an edge.
    maxPanX = Math.max(maxPanX, (halfWidth - viewportWidth / 2 + PAN_OVERSCAN) / extent.parallax);
    maxPanY = Math.max(maxPanY, (halfHeight - viewportHeight / 2 + PAN_OVERSCAN) / extent.parallax);
  }
  const rawProgress = (zoom - MIN_ZOOM) / (1 - MIN_ZOOM);
  const progress = rawProgress < 0 ? 0 : rawProgress > 1 ? 1 : rawProgress;
  // Smoothstep reaches zero slope at both 0.65x and 1x. Above 1x the floor
  // stays constant, letting the existing content bounds take over naturally.
  const explorationFloor = BASE_EXPLORATION_PAN * progress * progress * (3 - 2 * progress);
  return {
    sceneWidth,
    sceneHeight,
    maxPanX: viewportWidth > 0 ? Math.max(explorationFloor, sceneWidth > viewportWidth ? maxPanX : 0) : 0,
    maxPanY: viewportHeight > 0 ? Math.max(explorationFloor, sceneHeight > viewportHeight ? maxPanY : 0) : 0,
  };
}

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

// Relationships are direct and bidirectional, independent of positions or labels.
function isRelated(object: SpatialObject, focus: SpatialObject) {
  return !!(focus.relatedIds?.includes(object.id) || object.relatedIds?.includes(focus.id));
}

function SelectionCard({ object, onClose }: { object: SpatialObject; onClose: () => void }) {
  const supportsGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  return (
    <View style={styles.card}>
      {supportsGlass ? (
        <GlassView pointerEvents="none" style={styles.cardBackground} glassEffectStyle="regular" colorScheme="light" tintColor="#EEF4FB" />
      ) : <View pointerEvents="none" style={[styles.cardBackground, styles.cardFallback]} />}
      <View style={styles.cardContent}>
        <View style={styles.cardCopy} accessibilityLiveRegion="polite">
          <Text style={styles.cardType}>{object.type.toUpperCase()}</Text>
          <Text accessibilityRole="header" style={styles.cardTitle}>{object.label}</Text>
          {object.type === 'person' && object.interests && (
            <Text style={styles.cardInterests}>{object.interests.join(' · ')}</Text>
          )}
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
      opacity: 0.2 + motion * 0.03,
      transform: [{ perspective: 900 }, { rotateX: '62deg' }, { rotateZ: `${phase + motion * 4}deg` }],
    };
  });

  return <Animated.View style={[styles.ring, { width: size, height: size }, animatedStyle]} />;
}

function CategoryButton({ label, active, dimmed, onPress }: { label: string; active: boolean; dimmed: boolean; onPress: () => void }) {
  const visibility = useSharedValue(1);
  useEffect(() => {
    visibility.value = withTiming(dimmed ? 0.45 : 1, { duration: 250 });
  }, [dimmed, visibility]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: visibility.value }));
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Filter ${label}`} accessibilityState={{ selected: active }} onPress={onPress} style={styles.categoryButton}>
      <Animated.View style={[styles.categorySurface, active && styles.categoryActive, animatedStyle]}>
        <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{label.toUpperCase()}</Text>
      </Animated.View>
    </Pressable>
  );
}

function ObjectNode({ object, selected, emphasis, filteredOut, filterActive, scale, panX, panY, drift }: MotionProps & { object: SpatialObject; selected: boolean; emphasis: number; filteredOut: boolean; filterActive: boolean }) {
  const coreColor = object.type === 'world'
    ? 'rgba(91,126,168,0.30)'
    : object.type === 'person'
      ? 'rgba(126,145,169,0.25)'
      : object.type === 'interest'
        ? 'rgba(120,121,163,0.25)'
        : 'rgba(82,139,149,0.25)';
  const accent = useSharedValue(0);
  useEffect(() => {
    accent.value = withTiming(filterActive ? 1 : 0, { duration: 250 });
  }, [filterActive, accent]);
  const accentStyle = useAnimatedStyle(() => ({ opacity: accent.value }));
  const glowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(accent.value, [0, 1], [coreColor, ORBIT_ACCENT]),
  }));
  const filtering = useSharedValue(0);
  useEffect(() => {
    filtering.value = withTiming(filteredOut ? 1 : 0, { duration: 250 });
  }, [filteredOut, filtering]);
  const focusEmphasis = useSharedValue(0);
  useEffect(() => {
    // Only focus changes start transitions; zoom and drift stay on the UI thread.
    focusEmphasis.value = withTiming(emphasis, { duration: 260 });
  }, [emphasis, focusEmphasis]);
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

    const baseOpacity = detailOpacity * (0.52 + object.depth * 0.48);
    const related = Math.max(0, focusEmphasis.value);
    const dimming = Math.max(0, -focusEmphasis.value);
    // Keep the semantic zoom curve, gently lifting related details toward visibility.
    const focusOpacity = (baseOpacity + (1 - baseOpacity) * related * 0.42) * (1 - dimming * 0.22);
    const accentedOpacity = focusOpacity + (1 - focusOpacity) * accent.value * 0.55;
    return {
      opacity: (accentedOpacity * (1 - selection.value) + 0.98 * selection.value) * (1 - filtering.value) + 0.1 * filtering.value,
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { scale: position.scale * (1 + selection.value * 0.08) * (1 - filtering.value * 0.05) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.node, { width: object.size, height: object.size, marginLeft: -object.size / 2, marginTop: -object.size / 2 }, animatedStyle]}>
      {selected && <View style={styles.selectionRing} />}
      <View style={[styles.surface, object.type === 'world' && styles.world, object.type === 'person' && styles.person, object.type === 'interest' && styles.interest, object.type === 'place' && styles.place]}>
        <Animated.View pointerEvents="none" style={[styles.filterAccent, accentStyle]} />
        <Animated.View style={[styles.nodeGlow, glowStyle]} />
        <Text numberOfLines={1} style={[styles.nodeLabel, object.type !== 'world' && styles.detailLabel]}>{object.label}</Text>
      </View>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const interactionFilter = useSharedValue<CategoryFilter>('all');
  const pendingTapId = useSharedValue<string | null>(null);
  const pendingTapValid = useSharedValue(false);
  const singleTapDownAt = useSharedValue(0);
  const singleTapNavigated = useSharedValue(false);
  const doubleTapNavigated = useSharedValue(false);
  const toggleCategory = (category: ObjectType) => {
    const next = activeFilter === category ? 'all' : category;
    interactionFilter.value = next;
    setActiveFilter(next);
  };
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedObject = sceneObjects.find((object) => object.id === selectedId);
  const selectObject = useCallback((id: string | null) => {
    setSelectedId((current) => current === id ? current : id);
  }, []);
  const viewportWidth = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const scale = useSharedValue(1);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const panLastX = useSharedValue(0);
  const panLastY = useSharedValue(0);
  const panActive = useSharedValue(false);
  const doubleTapZoomActive = useSharedValue(false);
  const pinchStartScale = useSharedValue(1);
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(drift);
  }, [drift]);

  const panBounds = useDerivedValue(() => contentBounds(scale.value, viewportWidth.value, viewportHeight.value));

  useAnimatedReaction(
    () => ({ x: panBounds.value.maxPanX, y: panBounds.value.maxPanY, active: panActive.value || doubleTapZoomActive.value }),
    (current, previous) => {
      if (current.active || (previous && current.x === previous.x && current.y === previous.y && !previous.active)) return;
      const x = clamp(panX.value, -current.x, current.x);
      const y = clamp(panY.value, -current.y, current.y);
      if (x !== panX.value) panX.value = withTiming(x, { duration: 220 });
      if (y !== panY.value) panY.value = withTiming(y, { duration: 220 });
    },
  );

  const sceneGesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(PAN_ACTIVATION_DISTANCE)
      .onStart(() => {
        singleTapNavigated.value = true;
        doubleTapNavigated.value = true;
        pendingTapValid.value = false;
        if (doubleTapZoomActive.value) {
          cancelAnimation(scale);
          doubleTapZoomActive.value = false;
        }
        cancelAnimation(panX);
        cancelAnimation(panY);
        panActive.value = true;
        panLastX.value = 0;
        panLastY.value = 0;
      })
      .onUpdate((event) => {
        const { maxPanX, maxPanY } = panBounds.value;
        // Incremental deltas avoid stale origins after a zoom correction or hitting an edge.
        const x = clamp(panX.value + event.translationX - panLastX.value, -maxPanX, maxPanX);
        const y = clamp(panY.value + event.translationY - panLastY.value, -maxPanY, maxPanY);
        panLastX.value = event.translationX;
        panLastY.value = event.translationY;
        // A simultaneous pinch can shrink the bounds while this pan is active.
        panX.value = Math.abs(panX.value) > maxPanX ? withTiming(x, { duration: 220 }) : x;
        panY.value = Math.abs(panY.value) > maxPanY ? withTiming(y, { duration: 220 }) : y;
      })
      .onFinalize(() => { panActive.value = false; });
    const pinch = Gesture.Pinch()
      .onStart(() => {
        singleTapNavigated.value = true;
        doubleTapNavigated.value = true;
        pendingTapValid.value = false;
        if (doubleTapZoomActive.value) {
          cancelAnimation(scale);
          cancelAnimation(panX);
          cancelAnimation(panY);
          doubleTapZoomActive.value = false;
        }
        pinchStartScale.value = scale.value;
      })
      .onUpdate((event) => { scale.value = clamp(pinchStartScale.value * event.scale, MIN_ZOOM, MAX_ZOOM); });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(250)
      .maxDuration(250)
      .maxDistance(TAP_MOVEMENT_TOLERANCE)
      .onBegin(() => { doubleTapNavigated.value = false; })
      .onTouchesDown((event, manager) => {
        if (event.numberOfTouches > 1) manager.fail();
      })
      .onEnd((event, success) => {
        if (!success || doubleTapNavigated.value || !viewportWidth.value || !viewportHeight.value) return;
        cancelAnimation(scale);
        cancelAnimation(panX);
        cancelAnimation(panY);
        const zoom = scale.value;
        const target = zoom < 1.8 ? 1.8 : 1;
        const ratio = target / zoom;
        const x = event.x - viewportWidth.value / 2;
        const y = event.y - viewportHeight.value / 2;
        // Depth layers move differently. Anchor the tapped surface, or the
        // nearest object for empty space, without changing selection/focus.
        let anchor = sceneObjects[0];
        let nearest = Infinity;
        for (let index = sceneObjects.length - 1; index >= 0; index--) {
          const object = sceneObjects[index];
          const position = objectPosition(object, zoom, panX.value, panY.value, drift.value);
          const distance = Math.hypot(x - position.x, y - position.y);
          if (distance <= object.size * position.scale / 2) {
            anchor = object;
            break;
          }
          if (distance < nearest) {
            anchor = object;
            nearest = distance;
          }
        }
        const parallax = 0.2 + anchor.depth * 0.8;
        const floating = Math.sin(drift.value * Math.PI * 2 + anchor.motionPhase) * (1.5 + anchor.depth * 3.5);
        const bounds = contentBounds(target, viewportWidth.value, viewportHeight.value);
        // Keep the anchor-layer coordinate under the finger stable:
        // newPan = ratio * oldPan + (1 - ratio) * (tap - drift) / parallax.
        const targetX = clamp(ratio * panX.value + (1 - ratio) * (x - floating) / parallax, -bounds.maxPanX, bounds.maxPanX);
        const targetY = clamp(ratio * panY.value + (1 - ratio) * (y - floating * 0.7) / parallax, -bounds.maxPanY, bounds.maxPanY);
        doubleTapZoomActive.value = true;
        // Suspend the bounds reaction while these three synchronized animations
        // run, so zoom-out correction cannot compete with focal translation.
        panX.value = withTiming(targetX, { duration: 260 });
        panY.value = withTiming(targetY, { duration: 260 });
        scale.value = withTiming(target, { duration: 260 }, (finished) => {
          if (finished) doubleTapZoomActive.value = false;
        });
      });

    const tap = Gesture.Tap()
      .maxDistance(TAP_MOVEMENT_TOLERANCE)
      // iOS keeps its duration deadline alive while waiting for DoubleTap to
      // fail. Allow 250ms contact + 250ms arbitration + 100ms scheduling margin.
      // The actual finger-down duration is still limited to 250ms below.
      .maxDuration(600)
      .onBegin(() => {
        singleTapNavigated.value = false;
      })
      .onTouchesDown((event, manager) => {
        pendingTapValid.value = false;
        singleTapDownAt.value = performance.now();
        if (event.numberOfTouches > 1) manager.fail();
      })
      .onTouchesUp((event) => {
        if (singleTapNavigated.value) return;
        const contactDuration = performance.now() - singleTapDownAt.value;
        if (contactDuration > 250) return;
        const touch = event.changedTouches[0];
        if (!touch) return;
        // Capture local coordinates and the hit before waiting for double tap.
        // Delayed recognizer events no longer need to recover a lifted finger's
        // position, or hit-test against objects that have drifted in the meantime.
        const x = touch.x - viewportWidth.value / 2;
        const y = touch.y - viewportHeight.value / 2;
        let hit: string | null = null;
        let nearest = Infinity;
        // Prefer visible surfaces in reverse paint order, then nearest padded target.
        for (let index = sceneObjects.length - 1; index >= 0; index--) {
          const object = sceneObjects[index];
          // The scene uses manual hit-testing; muted categories must be skipped
          // here even though their nodes remain mounted and animated.
          if (interactionFilter.value !== 'all' && object.type !== interactionFilter.value) continue;
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
        pendingTapId.value = hit;
        pendingTapValid.value = true;
      })
      .onEnd((_event, success) => {
        // Successful native completion is the only authority to apply selection.
        // A hit saved on release alone never authorizes selection.
        if (success && pendingTapValid.value && !singleTapNavigated.value) runOnJS(selectObject)(pendingTapId.value);
      })
      .onFinalize(() => {
        // Cleanup only: never select from a failed/cancelled recognizer.
        pendingTapValid.value = false;
      });

    // Flat Simultaneous gives both navigation recognizers simultaneous relations
    // with each other AND with the tap pair. Only taps have a require-fail order.
    // Navigation flags survive release, preventing delayed selection after drag.
    return Gesture.Simultaneous(pan, pinch, Gesture.Exclusive(doubleTap, tap));
  }, [panLastX, panLastY, panActive, doubleTapZoomActive, panX, panY, pinchStartScale, scale, drift, viewportWidth, viewportHeight, panBounds, selectObject, interactionFilter, pendingTapId, pendingTapValid, singleTapDownAt, singleTapNavigated, doubleTapNavigated]);

  const changeZoom = (amount: number) => {
    if (doubleTapZoomActive.value) {
      cancelAnimation(scale);
      cancelAnimation(panX);
      cancelAnimation(panY);
      doubleTapZoomActive.value = false;
    }
    scale.value = withTiming(clamp(scale.value + amount, MIN_ZOOM, MAX_ZOOM), { duration: 220 });
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ORBIT</Text>
          <Text style={styles.title}>EXPLORE</Text>
          <View style={styles.categories}>
            {categories.map((category) => (
              <CategoryButton key={category.type} label={category.label} active={activeFilter === category.type} dimmed={activeFilter !== 'all' && activeFilter !== category.type} onPress={() => toggleCategory(category.type)} />
            ))}
          </View>
        </View>

        <View style={styles.sceneFrame}>
          <GestureDetector gesture={sceneGesture}>
            <View collapsable={false} style={styles.scene} onLayout={({ nativeEvent }) => {
              const { width, height } = nativeEvent.layout;
              if (viewportWidth.value !== width) viewportWidth.value = width;
              if (viewportHeight.value !== height) viewportHeight.value = height;
            }}>
              <View style={styles.backgroundGlow} />
              <View style={styles.star} />
              <View pointerEvents="none" style={styles.sceneLayer}>
                {[{ size: 210, phase: 8 }, { size: 322, phase: 24 }, { size: 444, phase: 42 }, { size: 578, phase: 64 }].map((ring) => (
                  <Ring drift={drift} key={ring.size} {...ring} />
                ))}
                {sceneObjects.map((object) => <ObjectNode drift={drift} key={object.id} object={object} selected={selectedId === object.id} emphasis={!selectedObject || selectedId === object.id ? 0 : isRelated(object, selectedObject) ? 1 : -1} filteredOut={activeFilter !== 'all' && activeFilter !== object.type} filterActive={activeFilter === object.type} panX={panX} panY={panY} scale={scale} />)}
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
  container: { flex: 1, backgroundColor: '#F1F4F8' },
  header: { paddingHorizontal: 24, paddingTop: 14 },
  brand: { fontSize: 10, fontWeight: '600', letterSpacing: 3.5, color: '#7C899B' },
  title: { marginTop: 7, fontSize: 27, fontWeight: '600', letterSpacing: 7, color: '#202734' },
  categories: { marginTop: 6, flexDirection: 'row', gap: 4 },
  categoryButton: { flex: 1, minHeight: 44, justifyContent: 'center' },
  categorySurface: { paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', alignItems: 'center' },
  categoryActive: { backgroundColor: 'rgba(121,184,255,0.16)', borderColor: 'rgba(121,184,255,0.72)', shadowColor: ORBIT_ACCENT, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  categoryLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 0.8, color: '#65758A' },
  categoryLabelActive: { color: ORBIT_ACCENT },
  sceneFrame: { flex: 1, marginTop: 10 },
  scene: { flex: 1, overflow: 'hidden' },
  selectionRing: { position: 'absolute', top: -6, right: -6, bottom: -6, left: -6, borderRadius: 999, borderWidth: 2, borderColor: '#397FCF', shadowColor: ORBIT_ACCENT, shadowOpacity: 0.4, shadowRadius: 13, shadowOffset: { width: 0, height: 0 } },
  card: { position: 'absolute', bottom: 8, left: 20, right: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(126,148,177,0.24)', shadowColor: '#708099', shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: 9 } },
  cardBackground: { ...StyleSheet.absoluteFill, borderRadius: 24 },
  cardFallback: { backgroundColor: 'rgba(245,248,252,0.96)' },
  cardContent: { padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardCopy: { flex: 1 },
  cardType: { fontSize: 9, fontWeight: '600', letterSpacing: 2.5, color: '#73849A' },
  cardTitle: { marginTop: 8, fontSize: 23, fontWeight: '500', letterSpacing: 1.5, color: '#202936' },
  cardInterests: { marginTop: 8, fontSize: 12, lineHeight: 18, color: '#50647E' },
  cardDescription: { marginTop: 8, fontSize: 13, lineHeight: 20, color: '#5F6E82' },
  closeButton: { width: 44, height: 44, marginTop: -10, marginRight: -10, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  closeSymbol: { fontSize: 25, fontWeight: '300', color: '#66778D' },
  backgroundGlow: { position: 'absolute', width: 420, height: 420, borderRadius: 210, alignSelf: 'center', top: '24%', backgroundColor: 'rgba(125,166,218,0.075)' },
  star: { position: 'absolute', width: 4, height: 4, borderRadius: 2, top: '22%', right: 44, backgroundColor: 'rgba(104,136,177,0.48)', shadowColor: ORBIT_ACCENT, shadowOpacity: 0.3, shadowRadius: 8 },
  sceneLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(105,132,166,0.58)', borderRadius: 999 },
  node: { position: 'absolute', left: '50%', top: '50%', alignItems: 'center', justifyContent: 'center' },
  surface: { width: '100%', height: '100%', borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: 'rgba(91,119,153,0.44)', shadowColor: '#71849E', shadowOpacity: 0.19, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  filterAccent: { ...StyleSheet.absoluteFill, borderRadius: 999, borderWidth: 1.5, borderColor: ORBIT_ACCENT, backgroundColor: 'rgba(121,184,255,0.24)', shadowColor: ORBIT_ACCENT, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
  world: { backgroundColor: 'rgba(228,238,249,0.95)', borderColor: 'rgba(83,116,156,0.58)', shadowColor: '#6688B1', shadowOpacity: 0.24, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  person: { backgroundColor: 'rgba(255,255,255,0.97)', borderColor: 'rgba(102,125,153,0.46)' },
  interest: { backgroundColor: 'rgba(240,241,250,0.95)', borderColor: 'rgba(111,117,158,0.46)', shadowColor: '#7D7FA4' },
  place: { backgroundColor: 'rgba(233,246,248,0.95)', borderColor: 'rgba(87,136,146,0.48)', shadowColor: '#668F98' },
  nodeGlow: { position: 'absolute', width: '54%', height: '54%', borderRadius: 999 },
  nodeLabel: { maxWidth: '82%', fontSize: 9, fontWeight: '600', letterSpacing: 0.6, color: '#172537', textAlign: 'center', textShadowColor: 'rgba(255,255,255,0.65)', textShadowRadius: 2 },
  detailLabel: { fontSize: 7, letterSpacing: 0.35, color: '#30455F' },
  footer: { minHeight: 78, paddingHorizontal: 24, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerText: { fontSize: 14, letterSpacing: 0.3, color: '#68788D' },
  zoomControls: { flexDirection: 'row', gap: 8 },
  zoomButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(112,136,167,0.26)', shadowColor: '#8291A5', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  zoomSymbol: { marginTop: -1, fontSize: 22, fontWeight: '300', color: '#364558' },
});
