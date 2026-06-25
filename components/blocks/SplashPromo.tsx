import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Floating food emoji decorations ──────────────────────────────────────────
interface FloatingFoodProps {
  emoji: string;
  style: object;
  animValue: Animated.Value;
}

const FloatingFood: React.FC<FloatingFoodProps> = ({ emoji, style, animValue }) => {
  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-12deg', '12deg'],
  });
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  return (
    <Animated.Text
      style={[
        styles.floatingFood,
        style,
        { transform: [{ rotate }, { translateY }] },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

// ─── Row separator inside the ticket ──────────────────────────────────────────
const FeeRow: React.FC<{ label: string; slideAnim: Animated.Value }> = ({
  label,
  slideAnim,
}) => {
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });

  return (
    <Animated.View
      style={[styles.feeRow, { opacity: slideAnim, transform: [{ translateX }] }]}
    >
      <Text style={styles.feeLabel}>{label}</Text>
      <View style={styles.feeLine} />
    </Animated.View>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
interface SplashPromoProps {
  onDismiss?: () => void;
}

const PANEL_HEIGHT = SCREEN_HEIGHT * 0.5;

const SplashPromo: React.FC<SplashPromoProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);

  const bgOpacity = useRef(new Animated.Value(0)).current;
  // Slide up from below: starts at PANEL_HEIGHT (off screen bottom)
  const panelTranslateY = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const row1 = useRef(new Animated.Value(0)).current;
  const row2 = useRef(new Animated.Value(0)).current;
  const row3 = useRef(new Animated.Value(0)).current;
  const foodBob = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Dim the backdrop
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Slide panel up
    Animated.spring(panelTranslateY, {
      toValue: 0,
      tension: 55,
      friction: 9,
      useNativeDriver: true,
    }).start();

    const stagger = (anim: Animated.Value, delay: number) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      });

    Animated.parallel([
      stagger(row1, 420),
      stagger(row2, 540),
      stagger(row3, 660),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(foodBob, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(foodBob, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(exitOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(panelTranslateY, { toValue: PANEL_HEIGHT, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      {/* Dim overlay – tapping outside dismisses */}
      <Animated.View
        style={[styles.dimOverlay, { opacity: Animated.multiply(bgOpacity, exitOpacity) }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={dismiss} activeOpacity={1} />
      </Animated.View>

      {/* Half-screen bottom panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            opacity: exitOpacity,
            transform: [{ translateY: panelTranslateY }],
          },
        ]}
      >
        {/* Sunburst inside panel */}
        <View style={styles.sunburstContainer} pointerEvents="none">
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[styles.sunRay, { transform: [{ rotate: `${i * 30}deg` }] }]}
            />
          ))}
        </View>

        {/* Floating food emojis around the top edge */}
        <FloatingFood emoji="🍔" style={styles.food1} animValue={foodBob} />
        <FloatingFood emoji="🍟" style={styles.food2} animValue={foodBob} />
        <FloatingFood emoji="🌮" style={styles.food3} animValue={foodBob} />
        <FloatingFood emoji="🍕" style={styles.food4} animValue={foodBob} />

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={dismiss} activeOpacity={0.8}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* Ticket card */}
        <View style={styles.card}>
          {/* Notch top */}
          <View style={styles.notchRow}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={styles.notch} />
            ))}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.headlineRow}>
              <Text style={styles.headlineAccent}>›› </Text>
              <Text style={styles.headlineMain}>NO FEE </Text>
              <Text style={styles.headlineAccent}> ‹‹</Text>
            </View>
            <Text style={styles.headlineDays}>DAYS</Text>
            <Text style={styles.subHeadline}>100% fees refunded as cashback*</Text>

            <View style={styles.divider} />

            <View style={styles.feeSection}>
              <View style={styles.feeList}>
                <FeeRow label="DELIVERY FEE" slideAnim={row1} />
                <FeeRow label="PLATFORM FEE" slideAnim={row2} />
                <FeeRow label="PACKAGING FEE" slideAnim={row3} />
              </View>

              <Animated.View style={[styles.badge, { transform: [{ scale: badgePulse }] }]}>
                <View style={styles.badgeInner}>
                  <Text style={styles.badgeText}>ALL</Text>
                  <Text style={styles.badgeText}>REFUNDED</Text>
                  <Text style={styles.badgeStars}>★ ★ ★</Text>
                </View>
              </Animated.View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.tcText}>*T&C Applied</Text>
          </View>

          {/* Notch bottom */}
          <View style={styles.notchRow}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={styles.notch} />
            ))}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} onPress={dismiss} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Order Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Semi-transparent dim over the top half
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  // Purple panel anchored to the bottom, exactly half the screen tall
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: '#3D0066',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    overflow: 'hidden',
  },
  sunburstContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: PANEL_HEIGHT * 1.4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: PANEL_HEIGHT * 0.5 - (PANEL_HEIGHT * 1.4) / 2,
  },
  floatingFood: {
    position: 'absolute',
    fontSize: 38,
  },
  // Corners of the panel
  food1: { top: -16, left: SCREEN_WIDTH * 0.02 },
  food2: { top: -16, right: SCREEN_WIDTH * 0.02 },
  food3: { bottom: 70, left: SCREEN_WIDTH * 0.01 },
  food4: { bottom: 68, right: SCREEN_WIDTH * 0.01 },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: '#F5EEFF',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 14,
  },
  notchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    backgroundColor: '#3D0066',
  },
  notch: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F5EEFF',
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headlineMain: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D0050',
    letterSpacing: 1,
  },
  headlineAccent: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7B00CC',
    marginTop: 4,
  },
  headlineDays: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D0050',
    letterSpacing: 2,
    marginTop: -6,
  },
  subHeadline: {
    fontSize: 11,
    color: '#3E1F5C',
    marginTop: 2,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#D0A0FF',
    marginVertical: 6,
    opacity: 0.5,
  },
  feeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeList: {
    flex: 1,
    marginRight: 12,
  },
  feeRow: {
    marginBottom: 6,
  },
  feeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D0050',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  feeLine: {
    height: 1.5,
    backgroundColor: '#B070E0',
    borderRadius: 1,
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#7B00CC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EEFF',
  },
  badgeInner: {
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5500AA',
    letterSpacing: 0.5,
  },
  badgeStars: {
    fontSize: 8,
    color: '#9933FF',
    marginTop: 2,
  },
  tcText: {
    fontSize: 9,
    color: '#5A4575',
    marginTop: 2,
    fontStyle: 'italic',
  },
  ctaButton: {
    width: SCREEN_WIDTH * 0.9,
    marginTop: 10,
    backgroundColor: '#FF5C00',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF5C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default SplashPromo;
