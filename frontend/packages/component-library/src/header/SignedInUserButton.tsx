import Typography from '@mui/material/Typography';
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
  | {status: 'signed-in'; display_name: string}
  | {status: 'signed-out'}
  | {status: 'loading'}
  | {status: 'error'};

/** Props for {@link SignedInUserButton}. */
export interface SignedInUserButtonProps {
  /** Must be the signed-in variant of {@link UserAuthProp}. */
  userAuth: Extract<UserAuthProp, {status: 'signed-in'}>;
}

/** Navigation links shown inside the signed-in account dropdown. */
const SUB_MENU_ITEMS = [
  {label: 'My projects', href: '/projects'},
  // TODO: wire up pair programming URL
  {label: 'Pair programming', href: '#'},
  {label: 'Account settings', href: '/users/edit'},
  {label: 'Sign out', href: '/users/sign_out'},
] as const;

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
    maxWidth: '120px',
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '0.5rem',
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'var(--background-brand-teal-primary)',
    color: 'var(--neutral-base-white)',
    boxShadow: 'none',
  },
  '&& .MuiButton-endIcon': {color: 'var(--neutral-base-white)'},
};

/** Dropdown button showing the signed-in user's display name with an account menu. */
const SignedInUserButton: FunctionComponent<SignedInUserButtonProps> = ({
  userAuth,
}) => {
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
          <Typography
            variant="body3"
            component="span"
            color="inherit"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: '1 1 auto',
            }}
          >
            {userAuth.display_name}
          </Typography>
        ),
      }}
    >
      <ul>
        {SUB_MENU_ITEMS.map(item => (
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
