import type {FooterSiteLink} from '@code-dot-org/component-library/footer';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';

/**
 * Studio footer navigation links, mirroring
 * `config/global_editions/root.yml#footer.links.studio`.
 * Brand-aware hrefs are resolved at module load via `siteConfig.marketingUrl`.
 * External entries use literal absolute URLs and `external: true`.
 */
export const FOOTER_LINKS: FooterSiteLink[] = [
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
