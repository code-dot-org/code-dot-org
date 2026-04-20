import {Box} from '@mui/material';
import {FunctionComponent} from 'react';

import {useDropdownContext} from '@/common/contexts/DropdownContext';
import CustomDropdown from '@/dropdown/CustomDropdown';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import Link from '@/link/Link';

import moduleStyles from './signedInUserButton.module.scss';

export type UserAuthProp =
  | {isSignedIn: false}
  | {isSignedIn: true; firstName: string};

export interface SignedInUserButtonProps {
  userAuth: UserAuthProp;
}

const SUB_MENU_ITEMS = [
  {label: 'My projects', href: '/projects'},
  // TODO: wire up pair programming URL
  {label: 'Pair programming', href: '#'},
  {label: 'Account settings', href: '/users/edit'},
  {label: 'Sign out', href: '/users/sign_out'},
] as const;

// Rendered inside DropdownProviderWrapper so useDropdownContext resolves.
// Must be at module scope — inlining creates a new component type per render (remounts).
const ChevronIcon = () => {
  const {activeDropdownName} = useDropdownContext();
  const icon =
    activeDropdownName === 'signed-in-user' ? 'chevron-up' : 'chevron-down';
  return <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />;
};

// Use && to generate .cls.cls specificity, beating MUI's internal
// per-variant/per-color overrides which sit at single-class specificity.
const triggerSx = {
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
};

const SignedInUserButton: FunctionComponent<SignedInUserButtonProps> = ({
  userAuth,
}) => {
  if (!userAuth.isSignedIn) {
    return null;
  }

  return (
    <CustomDropdown
      name="signed-in-user"
      labelText={userAuth.firstName}
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
          <Box
            component="span"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: '1 1 auto',
            }}
          >
            {userAuth.firstName}
          </Box>
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
