import type {FooterSiteLink} from '@code-dot-org/component-library/footer';
import {CodeStudioConfig} from '@code-dot-org/core';

/**
 * Studio footer link list, mirroring `config/global_editions/root.yml#footer.links.studio`.
 * Brand-aware paths are resolved at module load via `siteConfig.marketingUrl()` so consumers
 * receive plain strings with no knowledge of the marketing origin.
 */
export const FOOTER_LINKS: FooterSiteLink[] = [
  {
    id: 'privacy',
    label: 'Privacy Policy',
    href: CodeStudioConfig.marketingUrl('/privacy'),
    external: false,
  },
  {
    id: 'cookie_notice',
    label: 'Cookie Notice',
    href: CodeStudioConfig.marketingUrl('/cookies'),
    external: false,
  },
  {
    id: 'translate',
    label: 'Volunteer to translate our content',
    href: CodeStudioConfig.marketingUrl('/translate'),
    external: false,
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
    href: CodeStudioConfig.marketingUrl('/tos'),
    external: false,
  },
];
