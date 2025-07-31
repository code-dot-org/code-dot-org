import {alpha, Button, MenuItem} from '@mui/material';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import {useState} from 'react';

import theme from '@/themes/csforall';

import LinkItem, {LinkItemProps} from './LinkItem';

export interface MenuListProps {
  /** The id of the button that opens the menu */
  id: string;
  /** The label of the button that opens the menu */
  label: string;
  /** The list of links to display in the menu */
  linkList?: LinkItemProps[];
}

const styles = {
  button: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.body3.fontSize,
    textDecoration: 'none',
    marginBottom: 0,
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  },
  menu: {
    '& .MuiList-root': {
      paddingBlock: theme.spacing(1.5),
      paddingInline: theme.spacing(1),
      minWidth: '200px',
    },
  },
  menuItem: {
    '&:hover, &:focus': {
      backgroundColor: 'transparent',
      '& a': {
        color: theme.palette.secondary.main,
      },
    },
  },
};

const DropdownMenu: React.FC<MenuListProps> = ({id, label, linkList}) => {
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
        {label}
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
        elevation={2}
        disableAutoFocusItem
        sx={styles.menu}
      >
        {linkList?.map(({label, href, typography = 'body3', ...linkProps}) => (
          <MenuItem
            key={href ?? label}
            onClick={handleClose}
            disableRipple
            sx={styles.menuItem}
          >
            <LinkItem
              label={label}
              href={href}
              typography={typography}
              {...linkProps}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default DropdownMenu;
