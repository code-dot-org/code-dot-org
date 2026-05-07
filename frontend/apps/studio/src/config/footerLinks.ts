import type {FooterSiteLink} from '@code-dot-org/component-library/footer';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';

/**
 * Build the studio footer navigation links.
 * Called lazily (not at module load) so siteConfig is always fully
 * initialised — and test mocks are in place — when hrefs are resolved.
 * Mirrors `config/global_editions/root.yml#footer.links.studio`.
 *
 * @returns Ordered array of footer site links.
 */
export function getFooterLinks(): FooterSiteLink[] {
  return [
    {
      id: 'privacy',
      label: 'Privacy Policy',
      href: siteConfig.marketingUrl('/privacy'),
      accent: true,
    },
    {
      id: 'manage_cookies',
      label: 'Manage Cookies',
      href: siteConfig.marketingUrl('/cookies'),
    },
    {
      id: 'help_support',
      label: 'Help and support',
      href: 'https://support.code.org',
      external: true,
    },
    {
      id: 'store',
      label: 'Store',
      href: 'https://store.code.org',
      external: true,
    },
    {
      id: 'tos_short',
      label: 'Terms',
      href: siteConfig.marketingUrl('/tos'),
    },
  ];
}
