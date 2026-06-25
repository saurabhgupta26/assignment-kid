import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { CampaignProvider, useCampaign } from '@/contexts/CampaignContext';
import { mockHomepagePayload } from '@/data/mockPayload';
import SplashPromo from '@/components/blocks/SplashPromo';

const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { campaignTheme, activeCampaignType } = useCampaign();
  return (
    <ThemeProvider
      theme={mockHomepagePayload.theme}
      campaignTheme={campaignTheme}
      activeCampaignType={activeCampaignType}
    >
      {children}
    </ThemeProvider>
  );
};

export default function RootLayout() {
  useFrameworkReady();
  const [showSplash, setShowSplash] = useState(true);

  const activeCampaign = mockHomepagePayload.activeCampaign;

  return (
    <GestureHandlerRootView style={styles.container}>
      <CampaignProvider
        campaigns={mockHomepagePayload.campaigns}
        initialActiveCampaign={activeCampaign}
      >
        <AppThemeProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            {showSplash && <SplashPromo onDismiss={() => setShowSplash(false)} />}
          </CartProvider>
        </AppThemeProvider>
      </CampaignProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
