import {Typography} from '@mui/material';

/** A modal's form-level (non-field) error message; renders nothing when absent. */
export default function FormError({message}: {message: string | null}) {
  if (!message) return null;
  return (
    <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
      {message}
    </Typography>
  );
}
