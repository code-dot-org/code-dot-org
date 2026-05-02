import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';

/**
 * Slot components for the Footer.
 * Bodies are intentionally empty — all paint lives in the theme override at
 * `themes/code.org/styleOverrides/footer.ts`.
 */

/** Root `<footer>` landmark element. */
export const FooterRoot = styled('footer', {
  name: 'MuiFooter',
  slot: 'root',
})(() => ({}));

/** Inner MUI Grid container that constrains max-width and row spacing. */
export const FooterGrid = styled(Grid, {
  name: 'MuiFooter',
  slot: 'grid',
})(() => ({}));

/** `<ul>` list wrapping the site navigation links. */
export const FooterLinks = styled(List, {
  name: 'MuiFooter',
  slot: 'links',
})(() => ({}));

/** Individual site navigation anchor rendered inside each `<li>`. */
export const FooterLinkEl = styled(Link, {
  name: 'MuiFooter',
  slot: 'link',
})(() => ({}));

/** `<FormControl>` wrapper around the NativeSelect language picker. */
export const FooterLocaleSelect = styled(FormControl, {
  name: 'MuiFooter',
  slot: 'localeSelect',
})(() => ({}));

/** Typography element that renders the copyright/trademark line. */
export const FooterCopyright = styled(Typography, {
  name: 'MuiFooter',
  slot: 'copyright',
})(() => ({}));

/** Typography element that renders the fineprint block. */
export const FooterFineprint = styled(Typography, {
  name: 'MuiFooter',
  slot: 'fineprint',
})(() => ({}));

/** Anchor wrapping the attribution image (e.g. "Powered by AWS"). */
export const FooterImageLink = styled(Link, {
  name: 'MuiFooter',
  slot: 'imageLink',
})(() => ({}));
