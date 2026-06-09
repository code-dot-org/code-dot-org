import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import menuStyles from './headerMenu.module.scss';
import moduleStyles from './signedInUserButton.module.scss';

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
      user_type: 'student' | 'teacher' | 'admin';
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
function buildMenuItems(userType: 'student' | 'teacher' | 'admin') {
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
        className={moduleStyles.trigger}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disableElevation
        onClick={event => setAnchorEl(event.currentTarget)}
        endIcon={
          <FontAwesomeV6Icon
            iconName={open ? 'chevron-up' : 'chevron-down'}
            iconStyle="solid"
          />
        }
      >
        <span className={moduleStyles.name}>{userAuth.display_name}</span>
      </Button>
      <Menu
        id={menuId}
        className={menuStyles.menu}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{paper: {elevation: 0}, list: {'aria-label': 'Account'}}}
      >
        {menuItems.map(item => (
          <MenuItem
            key={item.label}
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
