import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {FunctionComponent} from 'react';

import {ErrorPage} from './ErrorPage';

/** Props for {@link AuthErrorPage}. */
interface AuthErrorPageProps {
  /** Called when the user clicks the retry button. */
  onRetry: () => void;
  /** Observability event ID from the auth failure, when available. */
  observabilityEventId?: string;
}

/**
 * Full-page error state shown when auth bootstrap fails.
 * Provides a retry action and surfaces the event ID for support reference.
 */
export const AuthErrorPage: FunctionComponent<AuthErrorPageProps> = ({
  onRetry,
  observabilityEventId,
}) => (
  <ErrorPage
    title="Something went wrong"
    description="We had trouble loading your account. Check your connection and try again."
    eventId={observabilityEventId}
    actions={
      <Button variant="contained" color="primary" onClick={onRetry}>
        <Typography variant="body3" component="span" color="inherit">
          Try again
        </Typography>
      </Button>
    }
  />
);
