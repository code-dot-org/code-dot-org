import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import NativeSelect from '@mui/material/NativeSelect';
import Skeleton from '@mui/material/Skeleton';

import {FooterLink} from './FooterLink';
import {LocaleSelectIcon} from './LocaleSelectIcon';
import {
  FooterCopyright,
  FooterFineprint,
  FooterGrid,
  FooterImageLink,
  FooterLinks,
  FooterLocaleSelect,
  FooterRoot,
} from './slots';
import type {FooterProps} from './types';

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction;
 *  * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 * Design System: Footer.
 * Footer rendered at the bottom of every studio route. Covers the site link
 * list, language picker, copyright/trademark line, optional fineprint, and
 * optional attribution image. All directional CSS uses logical properties so
 * the layout mirrors automatically in RTL locales. Responsive breakpoints
 * follow the marketing footer's approach: link list stacks to single-column
 * below `md`, picker grows full-width below `sm`.
 *
 * @param siteLinks - Ordered list of site navigation links.
 * @param copyright - Pre-composed copyright/trademark line.
 * @param fineprint - Optional fineprint block (credits, legal notices).
 * @param imageLink - Optional attribution image link.
 * @param languages - Available locale options.
 * @param selectedLocaleCode - BCP-47 code of the currently active locale.
 * @param onLanguageChange - Called with the chosen locale code on change.
 * @param languagesLoading - When true renders a skeleton instead of the picker.
 * @param className - Forwarded to the root `<footer>` element.
 */
export function Footer({
  siteLinks,
  copyright,
  fineprint,
  imageLink,
  languages,
  selectedLocaleCode,
  onLanguageChange,
  languagesLoading = false,
  className,
}: FooterProps) {
  return (
    <FooterRoot className={className}>
      <FooterGrid container spacing={2}>
        {/* Top section: link list + language picker */}
        <Grid
          size={12}
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap-reverse"
          gap={4}
        >
          {/* Site navigation links */}
          <FooterLinks aria-label="Site links">
            {siteLinks.map(link => (
              <ListItem key={link.id}>
                <FooterLink href={link.href} external={link.external}>
                  {link.label}
                </FooterLink>
              </ListItem>
            ))}
          </FooterLinks>

          {/* Language picker — skeleton while locale list is loading */}
          {languagesLoading ? (
            <Skeleton variant="rectangular" height={36} />
          ) : (
            <FooterLocaleSelect variant="standard">
              <NativeSelect
                disableUnderline
                name="language-select"
                IconComponent={LocaleSelectIcon}
                value={selectedLocaleCode}
                inputProps={{'aria-label': 'Language selection'}}
                onChange={e => onLanguageChange(e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.text}
                  </option>
                ))}
              </NativeSelect>
            </FooterLocaleSelect>
          )}
        </Grid>

        {/* Copyright / trademark line */}
        <Grid size={12}>
          <FooterCopyright component="div">{copyright}</FooterCopyright>
        </Grid>

        {/* Fineprint: credits, legal notices */}
        {fineprint !== undefined && (
          <Grid size={12}>
            <FooterFineprint component="div">{fineprint}</FooterFineprint>
          </Grid>
        )}

        {/* Attribution image (e.g. "Powered by AWS") */}
        {imageLink !== undefined && (
          <Grid size={12}>
            <FooterImageLink
              href={imageLink.href}
              {...(imageLink.external
                ? {rel: 'noopener noreferrer', target: '_blank'}
                : {})}
            >
              <img src={imageLink.src} alt={imageLink.altText} loading="lazy" />
            </FooterImageLink>
          </Grid>
        )}
      </FooterGrid>
    </FooterRoot>
  );
}
