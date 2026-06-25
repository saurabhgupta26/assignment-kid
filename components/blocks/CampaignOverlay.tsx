import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, InteractionManager } from 'react-native';
import { useCampaign } from '../../contexts/CampaignContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reduced from 40 → 15 particles. Each particle still loops independently
// but we defer the whole overlay until after interactions settle.
const PARTICLE_COUNT = 15;

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

// Seeded positions so they don't regenerate on every colors-array reference change
const generateParticles = (colors: string[], count: number): ParticleConfig[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i / count) * SCREEN_WIDTH + Math.sin(i * 2.5) * 30,
    y: Math.abs(Math.cos(i * 1.7)) * SCREEN_HEIGHT,
    size: 4 + (i % 5) * 2,
    color: colors[i % colors.length],
    duration: 1500 + (i % 5) * 400,
    delay: (i % 8) * 120,
  }));

const Particle: React.FC<ParticleConfig> = memo(({ x, y, size, color, duration, delay }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []); // stable: animatedValue is a ref, duration/delay are fixed per instance

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_HEIGHT * 0.25],
  });
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.4],
  });
  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1, 0.2],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    />
  );
});

Particle.displayName = 'Particle';

interface ConfettiOverlayProps {
  colors: string[];
}

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = memo(({ colors }) => {
  // Stringify the colors so useMemo invalidates only when values truly change,
  // not on every new array reference (which was regenerating all 40 particles).
  const colorKey = colors.join(',');
  const particles = useMemo(
    () => generateParticles(colors, PARTICLE_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorKey]
  );

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </View>
  );
});

ConfettiOverlay.displayName = 'ConfettiOverlay';

interface CampaignOverlayProps {
  visible?: boolean;
}

const CampaignOverlay: React.FC<CampaignOverlayProps> = ({ visible = true }) => {
  const { overlayConfig, activeCampaignType } = useCampaign();
  const { colors } = useTheme();

  // Defer rendering until after the initial interaction (list paint) is done.
  // This prevents 15+ Animated.loop calls from blocking the JS thread on startup.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);

  const particleColors = useMemo(() => {
    switch (activeCampaignType) {
      case 'BACK_TO_SCHOOL':
        return ['#FBBF24', '#1E40AF', '#3B82F6', '#FFFFFF'];
      case 'SUMMER_PLAYHOUSE':
        return ['#0EA5E9', '#06B6D4', '#F472B6', '#FFFFFF'];
      case 'MYSTERY_GIFT_CARNIVAL':
        return ['#DC2626', '#F97316', '#9333EA', '#FFD700'];
      default:
        return [colors.primary, colors.accent, '#FFFFFF'];
    }
  }, [activeCampaignType, colors.primary, colors.accent]);

  const overlayType = overlayConfig?.animation_type;

  if (!visible || !overlayConfig || overlayType === 'none' || !ready) {
    return null;
  }

  if (overlayType === 'confetti') {
    return <ConfettiOverlay colors={particleColors} />;
  }

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {overlayType === 'lottie' && (
        <View style={[styles.lottieContainer, { backgroundColor: 'transparent' }]}>
          <View
            style={[
              styles.fallbackAnimation,
              { backgroundColor: particleColors[0] + '10' },
            ]}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.fallbackParticle,
                  { backgroundColor: particleColors[i % particleColors.length] },
                ]}
              />
            ))}
          </View>
        </View>
      )}
      {overlayType === 'webp' && (
        <View style={[styles.webpContainer, { backgroundColor: particleColors[0] + '20' }]}>
          <Animated.View
            style={[
              styles.waterSplashBase,
              { backgroundColor: particleColors[0] + '30' },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  particle: {
    position: 'absolute',
  },
  lottieContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackAnimation: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackParticle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 10,
    opacity: 0.3,
  },
  webpContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  waterSplashBase: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 50,
    opacity: 0.2,
  },
});

export default memo(CampaignOverlay);
