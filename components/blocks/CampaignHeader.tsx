import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CampaignHeaderBlock } from '../../types/schema';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../contexts/ThemeContext';
import { useCampaign } from '../../contexts/CampaignContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CampaignHeaderProps {
  block: CampaignHeaderBlock;
}

const CampaignHeaderInner: React.FC<CampaignHeaderProps> = ({ block }) => {
  const { campaignTheme, activeCampaignType } = useCampaign();
  const { colors } = useTheme();

  const isMatchingCampaign = activeCampaignType === block.campaignId;

  const gradientColors = useMemo((): [string, string, ...string[]] => {
    if (isMatchingCampaign && campaignTheme) {
      return [campaignTheme.primary, campaignTheme.secondary];
    }
    return [colors.primary, colors.accent];
  }, [isMatchingCampaign, campaignTheme, colors.primary, colors.accent]);

  const campaignEmoji = useMemo(() => {
    switch (block.campaignId) {
      case 'BACK_TO_SCHOOL':
        return 'Back to School';
      case 'SUMMER_PLAYHOUSE':
        return 'Summer Festival';
      case 'MYSTERY_GIFT_CARNIVAL':
        return 'Carnival';
      default:
        return 'Special';
    }
  }, [block.campaignId]);

  if (!isMatchingCampaign) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        <Text style={styles.badge}>{campaignEmoji}</Text>
        <Text style={styles.title}>{block.title}</Text>
        {block.subtitle && (
          <Text style={styles.subtitle}>{block.subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    height: 120,
    overflow: 'hidden',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  badge: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.hero,
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

const CampaignHeader = memo(CampaignHeaderInner);

CampaignHeader.displayName = 'CampaignHeader';

export default CampaignHeader;

export type { CampaignHeaderProps };
