import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';

import theme from '@/themes/csforall';

import {mobileBreakpoint} from './common/constants';

export interface MenuButtonProps {
  /** Click handler for the menu button */
  onClick: () => void;
}

const styles = {
  menuButton: {
    display: 'none',
    [`@media (max-width: ${mobileBreakpoint}px)`]: {
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

const MenuButton = ({onClick}: MenuButtonProps) => {
  return (
    <IconButton
      aria-label="Open drawer"
      edge="end"
      onClick={onClick}
      sx={styles.menuButton}
      disableRipple
    >
      <MenuIcon fontSize="large" />
    </IconButton>
  );
};

export default MenuButton;
