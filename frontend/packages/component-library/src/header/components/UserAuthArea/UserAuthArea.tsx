import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import {visuallyHidden} from '@mui/utils';
import type {FunctionComponent} from 'react';

import SignedInUserButton, {
  UserAuthProp,
} from '../SignedInUserButton/SignedInUserButton';
import SignedOutUserButtons from '../SignedOutUserButtons/SignedOutUserButtons';

/** Props for {@link UserAuthArea}. */
interface UserAuthAreaProps {
  /** Current auth status and associated data. */
  userAuth: UserAuthProp;
}

/** Auth container — layout (margin, padding) is owned by the Header toolbar. */
const containerSx = {
  display: 'flex',
  alignItems: 'center',
};

/**
 * Selects the appropriate auth UI for the current status.
 * Shows a skeleton while loading or on error, the signed-in button when
 * authenticated, or sign-in/create-account buttons when signed out.
 *
 * @param userAuth - Current auth status and associated data.
 * @returns The matching auth UI element.
 */
function renderUserAuth(userAuth: UserAuthProp) {
  switch (userAuth.status) {
    case 'loading':
      return (
        <Skeleton
          variant="rectangular"
          width={238}
          height={32}
          sx={{borderRadius: '4px'}}
          role="status"
          aria-label="Loading your account"
        />
      );
    case 'error':
      return (
        <>
          <Skeleton
            variant="rectangular"
            width={238}
            height={32}
            sx={{borderRadius: '4px'}}
            aria-hidden
          />
          <Box component="span" role="status" sx={visuallyHidden}>
            Unable to load your account
          </Box>
        </>
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
