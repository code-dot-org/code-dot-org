import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type {FunctionComponent} from 'react';

import moduleStyles from './NavLogo.module.scss';

/** Props for {@link NavLogo}. */
interface NavLogoProps {
  /** URL of the brand logo image. */
  logoImageUrl: string;
  /** Brand name used for aria-label and alt text. */
  brandName?: string;
}

/** MUI sx styles for the icon button wrapping the logo. */
const logoIconButtonSx = {
  // Size to the wordmark, not the 50px bar: release the theme's 48px min-height and
  // don't stretch. The 14px insets are non-clickable margin (prod's logo padding is
  // inert), so the click target hugs the wordmark at prod's x=14; ~26px height keeps
  // it >=24px (WCAG 2.5.8).
  alignSelf: 'center',
  minHeight: 0,
  mx: '14px',
  px: 0,
  py: '2px',
  // Brand-inverse ring; the theme's default teal IconButton ring is invisible on the teal bar.
  '&:focus-visible, a&:focus-visible': {
    outline: '2px solid var(--text-neutral-white-fixed)',
    outlineOffset: '2px',
  },
};

/** Branded home logo button linking to the site root. */
const NavLogo: FunctionComponent<NavLogoProps> = ({
  logoImageUrl,
  brandName,
}) => (
  <IconButton
    size="large"
    color="inherit"
    aria-label={brandName ? `${brandName} Home` : 'Home'}
    sx={logoIconButtonSx}
    href="/"
  >
    <Box className={moduleStyles.logoBox}>
      {/* Decorative: the wrapping IconButton already names the link "<brand> Home". */}
      <img src={logoImageUrl} alt="" />
    </Box>
  </IconButton>
);

export default NavLogo;
