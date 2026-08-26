import {Button, Typography} from '@mui/material';
import type {ErrorComponentProps} from '@tanstack/react-router';

import styles from './authoring.module.scss';

/**
 * Route-level fallback for the three /author routes. A throw anywhere in the
 * tree — a lazily-loaded lab, a malformed agent-authored widget render —
 * would otherwise blank the whole app; this keeps the failure local and
 * offers a reload.
 */
export default function AuthorRouteError({error}: ErrorComponentProps) {
  return (
    <div className={styles.coursePage}>
      <Typography variant="h5">Something went wrong in Author Mode.</Typography>
      <Typography variant="body2">
        {error instanceof Error ? error.message : 'Unknown error.'}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={() => window.location.reload()}
      >
        Reload
      </Button>
    </div>
  );
}
