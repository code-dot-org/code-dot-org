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

import {
  FormControl,
  Grid,
  InputLabel,
  Link,
  List,
  ListItem,
  NativeSelect,
  Skeleton,
  Typography,
} from '@mui/material';
import type {LinkProps} from '@mui/material/Link';
import {styled} from '@mui/material/styles';
import {useId} from 'react';
import type {CSSProperties, ReactNode} from 'react';

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

/** The attribution image link rendered at the bottom. */
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
  /** Art-credits + trademark block, rendered below copyright. */
  fineprint?: ReactNode;
  /** Attribution image + link, rendered at the very bottom. */
  imageLink?: FooterImageLink;
  /**
   * Available languages for the locale picker, or `'loading'` to show a
   * skeleton while the list is being fetched. Passing `'loading'` avoids a
   * 1→N option flicker when the language list resolves asynchronously.
   */
  languages: FooterLanguageOption[] | 'loading';
  /** Currently selected locale code (controls the picker's selected option). */
  selectedLocaleCode: string;
  /** Called with the chosen language code when the user changes the picker. */
  onLanguageChange: (code: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Slot wrappers — empty bodies; all paint lives in the theme override
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

const ImageLinkWrapper = styled('div', {
  name: 'MuiFooter',
  slot: 'imageLink',
})({});

// ---------------------------------------------------------------------------
// Visually-hidden utility (standard clip pattern — no visible change)
// ---------------------------------------------------------------------------

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

// ---------------------------------------------------------------------------
// Private FooterAnchor wrapper
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
// Footer component
// ---------------------------------------------------------------------------

const LOCALE_SELECT_ID = 'footer-locale-select';

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
  const isLoading = languages === 'loading';
  const extLinkDescId = useId();

  return (
    <FooterRoot className={className}>
      <span
        id={extLinkDescId}
        data-testid="footer-ext-link-notice"
        style={visuallyHidden}
      >
        (opens in a new tab)
      </span>
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
            <nav aria-label="Footer">
              <FooterLinks disablePadding>
                {siteLinks.map(link => (
                  <ListItem key={link.id} disablePadding disableGutters>
                    <FooterLinkItem>
                      <FooterAnchor
                        href={link.href}
                        external={link.external}
                        data-accent={link.accent || undefined}
                        aria-describedby={
                          link.external ? extLinkDescId : undefined
                        }
                      >
                        {link.label}
                      </FooterAnchor>
                    </FooterLinkItem>
                  </ListItem>
                ))}
              </FooterLinks>
            </nav>
          </Grid>
          {isLoading ? (
            <FooterLocaleSelect>
              <Skeleton
                variant="rectangular"
                width="8.5rem"
                height="1.5rem"
                role="status"
                aria-label="Loading language options"
              />
            </FooterLocaleSelect>
          ) : (
            <FooterLocaleSelect>
              <FormControl>
                <InputLabel htmlFor={LOCALE_SELECT_ID} style={visuallyHidden}>
                  Language
                </InputLabel>
                <NativeSelect
                  value={selectedLocaleCode}
                  onChange={e => onLanguageChange(e.target.value)}
                  inputProps={{id: LOCALE_SELECT_ID}}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.text}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
            </FooterLocaleSelect>
          )}
        </Grid>

        {/* Copyright — right-aligned to sit below the locale picker */}
        <Grid size={12}>
          <FooterCopyright
            component="p"
            variant="body2"
            data-testid="footer-copyright"
          >
            {copyright}
          </FooterCopyright>
        </Grid>

        {/* Fineprint */}
        {fineprint && (
          <Grid size={12}>
            <FooterFineprint
              component="p"
              variant="body2"
              data-testid="footer-fineprint"
            >
              {fineprint}
            </FooterFineprint>
          </Grid>
        )}

        {/* Attribution image */}
        {imageLink && (
          <Grid size={12}>
            <ImageLinkWrapper>
              <FooterAnchor
                href={imageLink.href}
                external={imageLink.external}
                aria-describedby={
                  imageLink.external ? extLinkDescId : undefined
                }
              >
                <img
                  src={imageLink.src}
                  alt={imageLink.altText}
                  loading="lazy"
                />
              </FooterAnchor>
            </ImageLinkWrapper>
          </Grid>
        )}
      </FooterGrid>
    </FooterRoot>
  );
};

export default Footer;
