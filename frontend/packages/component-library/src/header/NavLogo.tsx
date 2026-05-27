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

/** MUI sx styles for the logo image container. */
const logoBoxSx = {
  width: '2.375rem',
  height: '2.375rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
};

/** MUI sx styles for the icon button wrapping the logo. */
const logoIconButtonSx = {
  marginLeft: 0,
  p: 0,
  paddingLeft: 1.5,
  paddingRight: 1.5,
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
