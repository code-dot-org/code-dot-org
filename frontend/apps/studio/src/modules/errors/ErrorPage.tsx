import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {FunctionComponent, ReactNode} from 'react';

/** Props for {@link ErrorPage}. */
export interface ErrorPageProps {
  /** Heading text displayed as the primary error title. */
  title: string;
  /** Body text describing the error and suggested action. */
  description: string;
  /** Observability event ID, when available. Shown so users can reference it in support requests. */
  eventId?: string;
  /** Optional action slot — buttons or links rendered below the description. */
  actions?: ReactNode;
}

/**
 * Generic full-page error display. Suitable for any terminal error state
 * (auth failure, 500, network outage). Extend via the actions slot.
 */
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
    {eventId ? (
      <Typography variant="body2" color="text.secondary">
        Event ID: {eventId}
      </Typography>
    ) : null}
  </Box>
);
