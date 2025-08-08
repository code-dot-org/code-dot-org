import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {alpha, Button, MenuItem} from '@mui/material';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import {useState} from 'react';

import theme from '@/themes/csforall';

import {buttonStyles} from './common/styles';
import {LinkItemProps} from './common/types';

export interface MenuListProps {
  /** Button id that opens menu */
  id: string;
  /** Button label that opens menu */
  buttonLabel: string;
  /** The list of links to display in the menu */
  linkList?: LinkItemProps[];
}

const styles = {
  menu: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.divider}`,
      borderTop: 0,
      borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    },
    '& .MuiList-root': {
      paddingInline: theme.spacing(1.5),
      paddingTop: 0,
      paddingBottom: theme.spacing(1),
      minWidth: '200px',
    },
  },
  menuItem: {
    marginBlock: theme.spacing(0.5),
    fontSize: theme.typography.body3.fontSize,
    transition: 'all 0.2s ease',
    '&:hover, &:focus': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-child': {
      marginTop: 0,
    },
  },
  button: {
    ...buttonStyles.button,
    alignItems: 'center',
    gap: theme.spacing(0.5),
    paddingInlineEnd: theme.spacing(1.5),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  },
};

const DropdownMenu: React.FC<MenuListProps> = ({id, buttonLabel, linkList}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        aria-controls={open ? id : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="text"
        disableElevation
        disableRipple
        sx={styles.button}
      >
        {buttonLabel}
        {open ? (
          <ExpandLessIcon fontSize="medium" />
        ) : (
          <ExpandMoreIcon fontSize="medium" />
        )}
      </Button>
      <Menu
        id={id}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': id,
          },
        }}
        anchorOrigin={{
          vertical: 63,
          horizontal: -12,
        }}
        elevation={0}
        disableAutoFocusItem
        disableScrollLock
        sx={styles.menu}
      >
        {linkList?.map(({label, href}) => (
          <MenuItem
            key={href ? `${href}-${label}` : `nohref-${label}`}
            component="a"
            href={href}
            disableRipple
            sx={styles.menuItem}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default DropdownMenu;
