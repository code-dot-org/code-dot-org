import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import type {FunctionComponent} from 'react';

import SignedInUserButton, {UserAuthProp} from './SignedInUserButton';
import SignedOutUserButtons from './SignedOutUserButtons';

/** Props for {@link UserAuthArea}. */
interface UserAuthAreaProps {
  /** Current auth status and associated data. */
  userAuth: UserAuthProp;
}

/** MUI sx styles for the right-aligned auth container in the toolbar. */
const containerSx = {
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  paddingRight: 2,
  backgroundColor: 'var(--background-brand-teal-primary)',
};

/**
 * Selects the appropriate auth UI for the current status.
 * Shows a skeleton during loading/error, signed-in button when authenticated,
 * or sign-in/create-account buttons when signed out.
 *
 * @param userAuth - Current auth status and associated data.
 * @returns The matching auth UI element.
 */
function renderUserAuth(userAuth: UserAuthProp) {
  switch (userAuth.status) {
    case 'loading':
    case 'error':
      return (
        <Skeleton
          variant="rectangular"
          width={120}
          height={32}
          sx={{borderRadius: '4px'}}
        />
      );
    case 'signed-in':
      return <SignedInUserButton userAuth={userAuth} />;
    case 'signed-out':
      return <SignedOutUserButtons />;
    default: {
      const _: never = userAuth;
      throw new Error(`Unhandled userAuth status: ${JSON.stringify(_)}`);
    }
  }
}

/** Right-hand auth area of the header toolbar. Switches on auth status exhaustively. */
const UserAuthArea: FunctionComponent<UserAuthAreaProps> = ({userAuth}) => (
  <Box sx={containerSx}>{renderUserAuth(userAuth)}</Box>
);

export default UserAuthArea;
