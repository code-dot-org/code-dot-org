import {Button} from '@mui/material';
import {FunctionComponent} from 'react';

import {ErrorPage} from './ErrorPage';

interface AuthErrorPageProps {
  onRetry: () => void;
  eventId?: string;
}

export const AuthErrorPage: FunctionComponent<AuthErrorPageProps> = ({
  onRetry,
  eventId,
}) => (
  <ErrorPage
    title="Something went wrong"
    description="We had trouble loading your account. Check your connection and try again."
    eventId={eventId}
    actions={
      <Button variant="contained" color="primary" onClick={onRetry}>
        Try again
      </Button>
    }
  />
);
