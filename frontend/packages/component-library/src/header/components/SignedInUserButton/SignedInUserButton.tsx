import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type {SxProps} from '@mui/material/styles';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {
  headerMenuItemSx,
  headerMenuListSx,
  headerMenuPaperSx,
  headerTriggerBase,
} from '../../shared/headerMenu';
import type {UserType} from '../../shared/types';

/**
 * Account-menu trigger (teal pill with the display name + chevron).
 */
const accountTriggerSx: SxProps = {
  ...headerTriggerBase,
  minWidth: 0,
  height: '35px',
  padding: '6.5px 1rem',
  columnGap: '8px',
  border: '1px solid var(--neutral-base-white)',
  borderRadius: '4px',
  backgroundColor: 'var(--background-brand-teal-primary)',
  boxShadow: 'none',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: 1.5,
  textTransform: 'none',
  '&:hover, &:active, &:focus-visible': {
    backgroundColor: 'var(--background-brand-teal-primary)',
    boxShadow: 'none',
    color: 'var(--neutral-base-white)',
    // Re-pin the white outline; the theme's Button :active rule recolors it otherwise.
    border: '1px solid var(--neutral-base-white)',
  },
  '& .MuiButton-endIcon, & .MuiButton-endIcon i': {
    width: 'auto',
    color: 'var(--neutral-base-white)',
    fontSize: '14px',
  },
};

/** Display name: truncate to 120px so the button auto-sizes to prod's ~176px. */
const accountNameSx = {
  maxWidth: '120px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

/**
 * Discriminated union of auth states consumed by header auth components.
 * Matches the `status` field of `AuthOutcome` from `@code-dot-org/studio`.
 * `loading` covers the window before auth resolves in consumers that render
 * before `beforeLoad` completes.
 */
export type UserAuthProp =
  | {
      status: 'signed-in';
      display_name: string;
      user_type: UserType;
    }
  | {status: 'signed-out'}
  | {status: 'loading'}
  | {status: 'error'};

/** Props for {@link SignedInUserButton}. */
export interface SignedInUserButtonProps {
  /** Must be the signed-in variant of {@link UserAuthProp}. */
  userAuth: Extract<UserAuthProp, {status: 'signed-in'}>;
}

/** Pair programming is student-only; teachers and admins don't see it. */
function buildMenuItems(userType: UserType) {
  return [
    {label: 'My projects', href: '/projects'},
    ...(userType === 'student' ? [{label: 'Pair programming', href: '#'}] : []),
    {label: 'Account settings', href: '/users/edit'},
    {label: 'Sign out', href: '/users/sign_out'},
  ];
}

/** Dropdown button showing the signed-in user's display name with an account menu. */
const SignedInUserButton: FunctionComponent<SignedInUserButtonProps> = ({
  userAuth,
}) => {
  const menuItems = buildMenuItems(userAuth.user_type);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();

  return (
    <>
      <Button
        sx={accountTriggerSx}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        color="inherit"
        disableElevation
        onClick={event => setAnchorEl(event.currentTarget)}
        endIcon={
          <FontAwesomeV6Icon
            iconName={open ? 'chevron-up' : 'chevron-down'}
            iconStyle="solid"
          />
        }
      >
        <Box component="span" sx={accountNameSx}>
          {userAuth.display_name}
        </Box>
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        marginThreshold={0}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{
          paper: {elevation: 0, sx: headerMenuPaperSx},
          list: {sx: headerMenuListSx, 'aria-label': 'Account'},
        }}
      >
        {menuItems.map(item => (
          <MenuItem
            key={item.label}
            sx={headerMenuItemSx}
            component="a"
            href={item.href}
            onClick={() => setAnchorEl(null)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SignedInUserButton;
