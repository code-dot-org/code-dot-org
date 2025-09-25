import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';

import theme from '@/themes/csforall';

import {DRAWER_BREAKPOINT} from './common/constants';

export interface HamburgerButtonProps {
  /** Click handler for the menu button */
  onClick: () => void;
}

const styles = {
  hamburgerButton: {
    display: 'none',
    [`@media (max-width: ${DRAWER_BREAKPOINT}px)`]: {
      display: 'flex',
    },
    '& svg': {
      color: theme.palette.common.black,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
};

const HamburgerButton = ({onClick}: HamburgerButtonProps) => {
  return (
    <IconButton
      aria-label="Open menu"
      edge="end"
      onClick={onClick}
      sx={styles.hamburgerButton}
      disableRipple
    >
      <MenuIcon fontSize="large" />
    </IconButton>
  );
};

export default HamburgerButton;
