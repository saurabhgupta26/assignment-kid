import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { CampaignTheme, Theme as BaseTheme, CampaignType } from '../types/schema';

interface ThemeContextValue {
  theme: BaseTheme;
  campaignTheme: CampaignTheme | null;
  activeCampaignType: CampaignType | null;
  colors: {
    primary: string;
    background: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    card: string;
    border: string;
  };
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

const TYPOGRAPHY = {
  hero: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  h4: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  body1: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  body2: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 10, lineHeight: 14, fontWeight: '400' as const },
  button: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
} as const;

const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  theme: BaseTheme;
  campaignTheme?: CampaignTheme | null;
  activeCampaignType?: CampaignType | null;
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme,
  campaignTheme = null,
  activeCampaignType = null,
  children,
}) => {
  const colors = useMemo(() => {
    const effectiveTheme = campaignTheme || theme;
    return {
      primary: effectiveTheme.primary,
      background: campaignTheme?.background || theme.background || '#1A0033',
      secondary: campaignTheme?.secondary || theme.secondary || '#2D0050',
      accent: campaignTheme?.accent || theme.accent || '#FF5C00',
      text: theme.text || '#F5EEFF',
      textSecondary: theme.textSecondary || '#C4A0E8',
      success: theme.success || '#22C55E',
      warning: theme.warning || '#F59E0B',
      error: theme.error || '#EF4444',
      card: campaignTheme?.secondary || theme.secondary || '#2D0050',
      border: campaignTheme?.primary || theme.primary,
    };
  }, [theme, campaignTheme]);

  const value = useMemo(
    () => ({
      theme,
      campaignTheme,
      activeCampaignType,
      colors,
      spacing: SPACING,
      typography: TYPOGRAPHY,
      borderRadius: BORDER_RADIUS,
      shadows: SHADOWS,
    }),
    [theme, campaignTheme, activeCampaignType, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const createThemedStyles = (
  styleFactory: (colors: ThemeContextValue['colors']) => ReturnType<typeof StyleSheet.create>
) => {
  return (colors: ThemeContextValue['colors']) => styleFactory(colors);
};

export { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS };
