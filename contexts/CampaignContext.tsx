import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Campaign, CampaignType, CampaignTheme } from '../types/schema';

interface CampaignContextValue {
  activeCampaign: Campaign | null;
  activeCampaignType: CampaignType | null;
  campaignTheme: CampaignTheme | null;
  overlayConfig: Campaign['overlay'] | null;
  switchCampaign: (campaignId: CampaignType) => void;
  getAvailableCampaigns: () => Campaign[];
  getActiveSpecialtyComponent: () => Campaign['specialtyComponent'] | null;
}

const CampaignContext = createContext<CampaignContextValue | null>(null);

interface CampaignProviderProps {
  campaigns: Campaign[];
  initialActiveCampaign?: CampaignType;
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({
  campaigns,
  initialActiveCampaign,
  children,
}) => {
  const [activeCampaignType, setActiveCampaignType] = useState<CampaignType | null>(
    initialActiveCampaign || campaigns.find((c) => c.active)?.id || null
  );

  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === activeCampaignType) || null;
  }, [campaigns, activeCampaignType]);

  const campaignTheme = useMemo(() => {
    return activeCampaign?.theme || null;
  }, [activeCampaign]);

  const overlayConfig = useMemo(() => {
    return activeCampaign?.overlay || null;
  }, [activeCampaign]);

  const switchCampaign = useCallback((campaignId: CampaignType) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setActiveCampaignType(campaignId);
    }
  }, [campaigns]);

  const getAvailableCampaigns = useCallback(() => {
    return campaigns;
  }, [campaigns]);

  const getActiveSpecialtyComponent = useCallback(() => {
    return activeCampaign?.specialtyComponent || null;
  }, [activeCampaign]);

  const value = useMemo(
    () => ({
      activeCampaign,
      activeCampaignType,
      campaignTheme,
      overlayConfig,
      switchCampaign,
      getAvailableCampaigns,
      getActiveSpecialtyComponent,
    }),
    [
      activeCampaign,
      activeCampaignType,
      campaignTheme,
      overlayConfig,
      switchCampaign,
      getAvailableCampaigns,
      getActiveSpecialtyComponent,
    ]
  );

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
};

export const useCampaign = (): CampaignContextValue => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};

export const getActiveCampaignStyles = (campaignTheme: CampaignTheme | null) => {
  if (!campaignTheme) {
    return {
      primaryGradient: ['#FF9933', '#FFB84D'],
      headerBackgroundColor: '#FFFFFF',
      accentColor: '#FF6B35',
      particleColors: ['#FFD700', '#FF9933', '#FFFFFF'],
    };
  }

  return {
    primaryGradient: [campaignTheme.primary, campaignTheme.secondary],
    headerBackgroundColor: campaignTheme.background,
    accentColor: campaignTheme.accent,
    particleColors: [campaignTheme.primary, campaignTheme.secondary, campaignTheme.accent],
  };
};
