import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type {FunctionComponent} from 'react';

/** Props for {@link NavLogo}. */
interface NavLogoProps {
  /** URL of the brand logo image. */
  logoImageUrl: string;
  /** Brand name used for aria-label and alt text. */
  brandName?: string;
}

/**
 * Logo is a wide wordmark (≈ 5.9:1 ratio); fix height and let width flow
 * from the image's natural aspect ratio instead of constraining to a square.
 */
const logoBoxSx = {
  height: '22px',
  display: 'flex',
  alignItems: 'center',
  '& img': {
    height: '100%',
    width: 'auto',
    display: 'block',
  },
};

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
    outline: '2px solid var(--text-neutral-inverse)',
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
    aria-label={`${brandName} Home`}
    sx={logoIconButtonSx}
    href="/"
  >
    <Box sx={logoBoxSx}>
      {/* Decorative: the wrapping IconButton already names the link "<brand> Home". */}
      <img src={logoImageUrl} alt="" />
    </Box>
  </IconButton>
);

export default NavLogo;
