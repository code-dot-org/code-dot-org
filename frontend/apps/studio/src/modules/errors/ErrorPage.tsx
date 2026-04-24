import {Box, Typography} from '@mui/material';
import {FunctionComponent, ReactNode} from 'react';

export interface ErrorPageProps {
  title: string;
  description: string;
  /** Sentry event ID, when available. Shown so users can reference it in support requests. */
  eventId?: string;
  actions?: ReactNode;
}

export const ErrorPage: FunctionComponent<ErrorPageProps> = ({
  title,
  description,
  eventId,
  actions,
}) => (
  <Box
    role="alert"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      padding: 4,
      textAlign: 'center',
    }}
  >
    <Typography variant="h5" component="h2">
      {title}
    </Typography>
    <Typography variant="body1">{description}</Typography>
    {actions}
    {eventId && (
      <Typography variant="body2" color="text.secondary">
        Event ID: {eventId}
      </Typography>
    )}
  </Box>
);
