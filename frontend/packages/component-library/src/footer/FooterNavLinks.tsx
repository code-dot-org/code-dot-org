import {List, ListItem, Link} from '@mui/material';
import type {LinkProps} from '@mui/material/Link';
import {styled} from '@mui/material/styles';

import type {FooterSiteLink} from './Footer.types';

// ---------------------------------------------------------------------------
// Slot wrappers
// ---------------------------------------------------------------------------

const FooterLinks = styled(List, {
  name: 'MuiFooter',
  slot: 'links',
})({});

const FooterLinkItem = styled('span', {
  name: 'MuiFooter',
  slot: 'link',
})({});

// ---------------------------------------------------------------------------
// FooterAnchor
// ---------------------------------------------------------------------------

// TODO(footer): remove once DSCO `link` → MUI `Link` migration lands
// (per MIGRATION_STATUS.md#link) and MUI `Link` carries `external` natively.
const FooterAnchor = ({
  external,
  children,
  ...props
}: LinkProps & {external?: boolean}) => (
  <Link
    {...props}
    {...(external ? {rel: 'noopener noreferrer', target: '_blank'} : {})}
  >
    {children}
  </Link>
);

// ---------------------------------------------------------------------------
// FooterNavLinks
// ---------------------------------------------------------------------------

interface FooterNavLinksProps {
  siteLinks: FooterSiteLink[];
  /** ID of the shared visually-hidden new-tab description span. */
  extLinkDescId: string;
}

/**
 * Footer navigation landmark containing the pipe-separated link list.
 *
 * @param props - {@link FooterNavLinksProps}
 */
const FooterNavLinks = ({siteLinks, extLinkDescId}: FooterNavLinksProps) => (
  <nav aria-label="Footer">
    <FooterLinks disablePadding>
      {siteLinks.map(link => (
        <ListItem key={link.id} disablePadding disableGutters>
          <FooterLinkItem>
            <FooterAnchor
              href={link.href}
              external={link.external}
              data-accent={link.accent || undefined}
              aria-describedby={link.external ? extLinkDescId : undefined}
            >
              {link.label}
            </FooterAnchor>
          </FooterLinkItem>
        </ListItem>
      ))}
    </FooterLinks>
  </nav>
);

export default FooterNavLinks;
