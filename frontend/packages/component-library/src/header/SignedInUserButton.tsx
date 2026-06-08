import type {FunctionComponent} from 'react';

import {useDropdownContext} from '@/common/contexts/DropdownContext';
import CustomDropdown from '@/dropdown/CustomDropdown';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import Link from '@/link/Link';

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

/**
 * Chevron icon that reflects the open/closed state of the signed-in dropdown.
 * Defined at module scope — inlining inside SignedInUserButton would create a
 * new component type on every render, causing remounts.
 */
const ChevronIcon = () => {
  const {activeDropdownName} = useDropdownContext();
  const icon =
    activeDropdownName === 'signed-in-user' ? 'chevron-up' : 'chevron-down';
  return <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />;
};

/**
 * MUI sx styles for the dropdown trigger button.
 * Uses `&&` double-class specificity to beat MUI's per-variant/per-color
 * overrides which sit at single-class specificity.
 */
const triggerSx = {
  '&&': {
    backgroundColor: 'var(--background-brand-teal-primary)',
    color: 'var(--neutral-base-white)',
    border: '1px solid var(--neutral-base-white)',
    borderRadius: '4px',
    boxShadow: 'none',
    textTransform: 'none' as const,
    columnGap: '8.46875px',
    minWidth: 0,
    height: '35px',
    marginTop: '-1px',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '6.5px',
    paddingBottom: '6.5px',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'var(--background-brand-teal-primary)',
    color: 'var(--neutral-base-white)',
    boxShadow: 'none',
  },
  '&& .MuiButton-endIcon, && .MuiButton-endIcon i': {
    color: 'var(--neutral-base-white)',
    fontSize: '14px',
    width: 'auto',
  },
};

/** Dropdown button showing the signed-in user's display name with an account menu. */
const SignedInUserButton: FunctionComponent<SignedInUserButtonProps> = ({
  userAuth,
}) => {
  const menuItems = buildMenuItems(userAuth.user_type);
  return (
    <CustomDropdown
      name="signed-in-user"
      labelText={userAuth.display_name}
      size="m"
      menuPlacement="right"
      aria-label="Account menu"
      useMuiButtonAsTrigger
      triggerButtonProps={{
        'aria-label': 'Account menu',
        disableElevation: true,
        sx: triggerSx,
        endIcon: <ChevronIcon />,
        children: (
          <span
            style={{
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {userAuth.display_name}
          </span>
        ),
      }}
    >
      <ul className={moduleStyles.list}>
        {menuItems.map(item => (
          <li key={item.label}>
            <Link
              text={item.label}
              href={item.href}
              className={moduleStyles.menuItem}
            />
          </li>
        ))}
      </ul>
    </CustomDropdown>
  );
};

export default SignedInUserButton;
