import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BannerHeroBlock } from '../../types/schema';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../contexts/ThemeContext';
import SafeImage from '../ui/SafeImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BannerHeroProps {
  block: BannerHeroBlock;
  onPress?: (action: BannerHeroBlock['action']) => void;
}

const BannerHeroInner: React.FC<BannerHeroProps> = ({ block, onPress }) => {
  const { colors, campaignTheme } = useTheme();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(block.action);
    }
  }, [block.action, onPress]);

  const gradientColors = block.gradient && block.gradient.length >= 2
    ? block.gradient as [string, string, ...string[]]
    : [colors.primary, colors.accent] as [string, string, ...string[]];

  const hasCampaignContext = !!block.campaignContext;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      style={styles.container}
      accessible={true}
      accessibilityLabel={block.title}
      accessibilityRole="button"
    >
      {block.image ? (
        <SafeImage
          source={block.image}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ) : null}

      <View style={[styles.gradientOverlay, { opacity: 0.7 }]} pointerEvents="none">
        <LinearGradient
          colors={hasCampaignContext && campaignTheme ?
            [campaignTheme.primary, campaignTheme.secondary] :
            gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: '#FFFFFF' }]} numberOfLines={2}>
          {block.title}
        </Text>

        {block.subtitle && (
          <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
            {block.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    height: 180,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
  },
  title: {
    ...TYPOGRAPHY.hero,
    fontSize: 28,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    marginTop: SPACING.sm,
    letterSpacing: 0.2,
  },
});

const BannerHero = memo(BannerHeroInner);

BannerHero.displayName = 'BannerHero';

export default BannerHero;

export type { BannerHeroProps };
