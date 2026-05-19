import {render, screen} from '@testing-library/react';
import React from 'react';

import {
  SiteConfigProvider,
  useSiteConfig,
  useBrand,
} from '@cdo/apps/util/SiteConfigContext';

const SiteConfigDisplay = () => {
  const config = useSiteConfig();
  return <span role="status">{config.brand}</span>;
};

const BrandDisplay = () => {
  const brand = useBrand();
  return <span role="status">{brand}</span>;
};

describe('SiteConfigContext', () => {
  describe('useSiteConfig', () => {
    it('returns the config from SiteConfigProvider', () => {
      render(
        <SiteConfigProvider config={{brand: 'codeai'}}>
          <SiteConfigDisplay />
        </SiteConfigProvider>
      );

      expect(screen.getByRole('status').textContent).toBe('codeai');
    });

    it('throws when used outside SiteConfigProvider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<SiteConfigDisplay />)).toThrow(
        'useSiteConfig must be used within a SiteConfigProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('useBrand', () => {
    it('returns the brand from SiteConfigProvider', () => {
      render(
        <SiteConfigProvider config={{brand: 'codeai'}}>
          <BrandDisplay />
        </SiteConfigProvider>
      );

      expect(screen.getByRole('status').textContent).toBe('codeai');
    });

    it('returns default brand from SiteConfigProvider', () => {
      render(
        <SiteConfigProvider config={{brand: 'code'}}>
          <BrandDisplay />
        </SiteConfigProvider>
      );

      expect(screen.getByRole('status').textContent).toBe('code');
    });
  });
});
