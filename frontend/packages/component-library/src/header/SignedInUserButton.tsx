import {Box, Button, Menu, MenuItem} from '@mui/material';
import {FunctionComponent, MouseEvent, useState} from 'react';

import FontAwesomeV6Icon from '../fontAwesomeV6Icon';

export type UserAuthProp =
  | {isSignedIn: false}
  | {isSignedIn: true; firstName: string};

export interface SignedInUserButtonProps {
  userAuth: UserAuthProp;
}

const menuId = 'signed-in-user-menu';

const SUB_MENU_ITEMS = [
  {label: 'My projects', href: '/projects'},
  // TODO: wire up pair programming URL
  {label: 'Pair programming', href: '#'},
  {label: 'Account settings', href: '/users/edit'},
  {label: 'Sign out', href: '/users/sign_out'},
] as const;

const styles = {
  button: {
    // Use && to generate .cls.cls specificity, beating MUI's internal
    // per-variant/per-color overrides which sit at single-class specificity.
    '&&': {
      typography: 'body3',
      backgroundColor: 'var(--background-brand-teal-primary)',
      color: 'white',
      border: '1px solid white',
      borderRadius: '4px',
      boxShadow: 'none',
      textTransform: 'none' as const,
      maxWidth: '120px',
      minWidth: 0,
      paddingLeft: '1rem',
      paddingRight: '0.5rem',
    },
    '&&:hover, &&:active, &&:focus-visible': {
      backgroundColor: 'var(--background-brand-teal-primary)',
      color: 'white',
      boxShadow: 'none',
    },
    '&& .MuiButton-endIcon': {color: 'white'},
  },
  firstName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    minWidth: 0,
    flex: '1 1 auto',
  },
} as const;

const SignedInUserButton: FunctionComponent<SignedInUserButtonProps> = ({
  userAuth,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl !== null;

  if (!userAuth.isSignedIn) {
    return null;
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        disableElevation
        aria-label="Account menu"
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={styles.button}
        endIcon={
          <FontAwesomeV6Icon iconName={open ? 'chevron-up' : 'chevron-down'} />
        }
      >
        <Box component="span" sx={styles.firstName}>
          {userAuth.firstName}
        </Box>
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        {SUB_MENU_ITEMS.map(item => (
          <MenuItem
            key={item.label}
            component="a"
            href={item.href}
            onClick={handleClose}
            sx={{typography: 'body3'}}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SignedInUserButton;
