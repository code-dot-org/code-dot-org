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
  marginLeft: 0,
  p: 0,
  paddingLeft: '14px',
  paddingRight: '14px',
};

/** Branded home logo button linking to the site root. */
const NavLogo: FunctionComponent<NavLogoProps> = ({
  logoImageUrl,
  brandName,
}) => (
  <IconButton
    size="large"
    edge="start"
    color="inherit"
    aria-label={`${brandName} Home`}
    sx={logoIconButtonSx}
    href="/"
  >
    <Box sx={logoBoxSx}>
      <img src={logoImageUrl} alt={`${brandName} Logo`} />
    </Box>
  </IconButton>
);

export default NavLogo;
