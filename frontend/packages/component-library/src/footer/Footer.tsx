/**
 * @status Ready for dev
 *
 * Design-system footer primitive. Renders the site-links row, language
 * picker (with skeleton loading state), copyright/fineprint text, and
 * an optional AWS attribution image link.
 *
 * All paint (colours, spacing, responsive breakpoints) lives in the
 * MuiFooter theme override. The component declares styled-component slot
 * wrappers so brand themes can target individual regions via
 * `components.MuiFooter.styleOverrides.<slotName>`.
 *
 * @see {@link FooterProps}
 */

import {
  FormControl,
  Grid,
  Link,
  List,
  ListItem,
  NativeSelect,
  Skeleton,
  Typography,
} from '@mui/material';
import type {LinkProps} from '@mui/material/Link';
import {styled} from '@mui/material/styles';
import type {ReactNode} from 'react';

// ---------------------------------------------------------------------------
// Prop interfaces
// ---------------------------------------------------------------------------

/** A site navigation link rendered in the footer link bar. */
export interface FooterSiteLink {
  id: string;
  label: string;
  href: string;
  /** When true, opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /** When true the link renders with the theme's accent color (e.g. brand orange). */
  accent?: boolean;
}

/** The AWS (or other image) attribution link rendered at the bottom. */
export interface FooterImageLink {
  src: string;
  altText: string;
  href: string;
  /** When true, opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
}

/** A single option in the language picker. */
export interface FooterLanguageOption {
  /** Language code passed to onLanguageChange. */
  value: string;
  /** Human-readable language name rendered in the option. */
  text: string;
}

/** Props for the Footer design-system primitive. */
export interface FooterProps {
  /** Navigation links rendered as a pipe-separated inline list. */
  siteLinks: FooterSiteLink[];
  /**
   * Pre-composed copyright / trademark line. Typically a ReactNode produced
   * by the studio composer so the year `<span>` selector stays at the source.
   */
  copyright: ReactNode;
  /** Art-credits + "Built on GitHub" block, rendered below copyright. */
  fineprint?: ReactNode;
  /** AWS attribution image + link, rendered at the very bottom. */
  imageLink?: FooterImageLink;
  /** Available languages for the locale picker. */
  languages: FooterLanguageOption[];
  /** Currently selected locale code (controls the picker's selected option). */
  selectedLocaleCode: string;
  /** Called with the chosen language code when the user changes the picker. */
  onLanguageChange: (code: string) => void;
  /**
   * When true the language list is not yet available; renders an MUI Skeleton
   * in place of the picker to avoid a 1→N option flicker.
   */
  languagesReady?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Slot wrappers — empty bodies; all paint lives in the theme override (4.1)
// ---------------------------------------------------------------------------

const FooterRoot = styled('footer', {
  name: 'MuiFooter',
  slot: 'root',
})({});

const FooterGrid = styled(Grid, {
  name: 'MuiFooter',
  slot: 'grid',
})({});

const FooterLinks = styled(List, {
  name: 'MuiFooter',
  slot: 'links',
})({});

const FooterLinkItem = styled('span', {
  name: 'MuiFooter',
  slot: 'link',
})({});

const FooterLocaleSelect = styled('div', {
  name: 'MuiFooter',
  slot: 'localeSelect',
})({});

const FooterCopyright = styled(Typography, {
  name: 'MuiFooter',
  slot: 'copyright',
})({});

const FooterFineprint = styled(Typography, {
  name: 'MuiFooter',
  slot: 'fineprint',
})({});

const FooterImageLinkSlot = styled('div', {
  name: 'MuiFooter',
  slot: 'imageLink',
})({});

// ---------------------------------------------------------------------------
// Private FooterLink wrapper (D10)
// ---------------------------------------------------------------------------

// TODO(footer): remove this wrapper once the DSCO `link` → MUI `Link` migration
// (per MIGRATION_STATUS.md) lands and MUI `Link` carries the `external` semantics
// natively. At that point this entire block collapses to `<Link external />`.
const FooterLink = ({external, ...props}: LinkProps & {external?: boolean}) => (
  <Link
    {...props}
    {...(external ? {rel: 'noopener noreferrer', target: '_blank'} : {})}
  />
);

// ---------------------------------------------------------------------------
// Footer component
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
  languagesReady = true,
  className,
}: FooterProps) => {
  return (
    <FooterRoot className={className}>
      <FooterGrid container>
        {/* Top: links (left) and locale picker (right), picker wraps above links on mobile */}
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap-reverse"
          gap={2}
        >
          <Grid size={{md: 'grow'}}>
            <FooterLinks disablePadding>
              {siteLinks.map(link => (
                <ListItem
                  key={link.id}
                  disablePadding
                  disableGutters
                  sx={{display: 'inline', width: 'auto'}}
                >
                  <FooterLinkItem data-accent={link.accent || undefined}>
                    <FooterLink href={link.href} external={link.external}>
                      {link.label}
                    </FooterLink>
                  </FooterLinkItem>
                </ListItem>
              ))}
            </FooterLinks>
          </Grid>
          {languagesReady ? (
            <FooterLocaleSelect>
              <FormControl>
                <NativeSelect
                  value={selectedLocaleCode}
                  onChange={e => onLanguageChange(e.target.value)}
                  aria-label="Select language"
                  inputProps={{'aria-label': 'Select language'}}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.text}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
            </FooterLocaleSelect>
          ) : (
            <FooterLocaleSelect>
              <Skeleton variant="rectangular" />
            </FooterLocaleSelect>
          )}
        </Grid>

        {/* Copyright — right-aligned to sit below the locale picker */}
        <Grid size={12}>
          <FooterCopyright component="p" variant="body2">
            {copyright}
          </FooterCopyright>
        </Grid>

        {/* Fineprint */}
        {fineprint && (
          <Grid size={12}>
            <FooterFineprint component="p" variant="body2">
              {fineprint}
            </FooterFineprint>
          </Grid>
        )}

        {/* AWS attribution image */}
        {imageLink && (
          <Grid size={12}>
            <FooterImageLinkSlot>
              <FooterLink href={imageLink.href} external={imageLink.external}>
                <img
                  src={imageLink.src}
                  alt={imageLink.altText}
                  loading="lazy"
                />
              </FooterLink>
            </FooterImageLinkSlot>
          </Grid>
        )}
      </FooterGrid>
    </FooterRoot>
  );
};

export default Footer;
