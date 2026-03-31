import React, {createContext, useContext, ReactNode} from 'react';

import type {BrandCode} from './brand';

export interface SiteConfig {
  brand: BrandCode;
}

const SiteConfigContext = createContext<SiteConfig | undefined>(undefined);

export function useSiteConfig(): SiteConfig {
  const config = useContext(SiteConfigContext);
  if (config === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return config;
}

export function useBrand(): BrandCode {
  return useSiteConfig().brand;
}

export const SiteConfigProvider = ({
  config,
  children,
}: {
  config: SiteConfig;
  children: ReactNode;
}) => (
  <SiteConfigContext.Provider value={config}>
    {children}
  </SiteConfigContext.Provider>
);
