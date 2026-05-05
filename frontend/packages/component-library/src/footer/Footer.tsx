/**
 * @status Ready for dev
 *
 * Design-system footer primitive. Renders the site-links row, language
 * picker (with skeleton loading state), copyright/fineprint text, and
 * an optional attribution image link.
 *
 * All paint (colours, spacing, responsive breakpoints) lives in the
 * MuiFooter theme override. The component declares styled-component slot
 * wrappers so brand themes can target individual regions via
 * `components.MuiFooter.styleOverrides.<slotName>`.
 *
 * @see {@link FooterProps}
 */

import {Box, Grid, Link, Typography} from '@mui/material';
import type {LinkProps} from '@mui/material/Link';
import {styled} from '@mui/material/styles';
import {visuallyHidden} from '@mui/utils';
import {useId} from 'react';
import type {ElementType} from 'react';

import type {FooterImageLink, FooterProps} from './Footer.types';
import FooterLocalePicker from './FooterLocalePicker';
import FooterNavLinks from './FooterNavLinks';

export type {
  FooterSiteLink,
  FooterImageLink,
  FooterLanguageOption,
  FooterProps,
} from './Footer.types';

// ---------------------------------------------------------------------------
// Slot wrappers — empty bodies; all paint lives in the theme override
// ---------------------------------------------------------------------------

const FooterRoot = styled('footer', {name: 'MuiFooter', slot: 'root'})({});
const FooterGrid = styled(Grid, {name: 'MuiFooter', slot: 'grid'})({});
const FooterCopyright = styled(Typography, {
  name: 'MuiFooter',
  slot: 'copyright',
})<{component?: ElementType}>({});
FooterCopyright.defaultProps = {component: 'p'};

const FooterFineprint = styled(Typography, {
  name: 'MuiFooter',
  slot: 'fineprint',
})<{component?: ElementType}>({});
FooterFineprint.defaultProps = {component: 'div'};
const ImageLinkWrapper = styled('div', {name: 'MuiFooter', slot: 'imageLink'})(
  {},
);

// ---------------------------------------------------------------------------
// ImageLink — local anchor with external-link semantics
// ---------------------------------------------------------------------------

// TODO(footer): remove once DSCO `link` → MUI `Link` migration lands
// (per MIGRATION_STATUS.md#link) and MUI `Link` carries `external` natively.
const buildImageLinkProps = (external?: boolean) =>
  external ? {rel: 'noopener noreferrer', target: '_blank'} : {};

interface FooterImageAnchorProps extends Omit<LinkProps, 'href'> {
  imageLink: FooterImageLink;
  extLinkDescId: string;
}

/** Attribution image wrapped in a themed anchor. */
const FooterImageAnchor = ({
  imageLink,
  extLinkDescId,
  ...rest
}: FooterImageAnchorProps) => (
  <ImageLinkWrapper>
    <Link
      href={imageLink.href}
      aria-describedby={imageLink.external ? extLinkDescId : undefined}
      {...buildImageLinkProps(imageLink.external)}
      {...rest}
    >
      <img src={imageLink.src} alt={imageLink.altText} loading="lazy" />
    </Link>
  </ImageLinkWrapper>
);

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

/**
 * Site footer with navigation links, language picker, copyright, fineprint,
 * and an optional attribution image.
 *
 * @param props - {@link FooterProps}
 */
const Footer = ({
  siteLinks,
  copyright,
  fineprint,
  imageLink,
  languages,
  selectedLocaleCode,
  onLanguageChange,
  className,
}: FooterProps) => {
  const extLinkDescId = useId();

  return (
    <FooterRoot className={className}>
      <Box
        component="span"
        id={extLinkDescId}
        data-testid="footer-ext-link-notice"
        sx={visuallyHidden}
      >
        (opens in a new tab)
      </Box>
      <FooterGrid container>
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap-reverse"
          gap={2}
        >
          <Grid size={{md: 'grow'}}>
            <FooterNavLinks
              siteLinks={siteLinks}
              extLinkDescId={extLinkDescId}
            />
          </Grid>
          <FooterLocalePicker
            languages={languages}
            selectedLocaleCode={selectedLocaleCode}
            onLanguageChange={onLanguageChange}
          />
        </Grid>

        <Grid size={12}>
          <FooterCopyright variant="body2" data-testid="footer-copyright">
            {copyright}
          </FooterCopyright>
        </Grid>

        {fineprint && (
          <Grid size={12}>
            <FooterFineprint variant="body2" data-testid="footer-fineprint">
              {fineprint}
            </FooterFineprint>
          </Grid>
        )}

        {imageLink && (
          <Grid size={12}>
            <FooterImageAnchor
              imageLink={imageLink}
              extLinkDescId={extLinkDescId}
            />
          </Grid>
        )}
      </FooterGrid>
    </FooterRoot>
  );
};

export default Footer;
