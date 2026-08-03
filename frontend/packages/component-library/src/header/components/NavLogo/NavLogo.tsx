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

/** Branded home logo button linking to the site root. */
const NavLogo: FunctionComponent<NavLogoProps> = ({
  logoImageUrl,
  brandName,
}) => (
  <IconButton
    size="large"
    color="inherit"
    aria-label={brandName ? `${brandName} Home` : 'Home'}
    className={moduleStyles.logoIconButton}
    href="/"
  >
    <Box className={moduleStyles.logoBox}>
      {/* Decorative: the wrapping IconButton already names the link "<brand> Home". */}
      <img src={logoImageUrl} alt="" />
    </Box>
  </IconButton>
);

export default NavLogo;
