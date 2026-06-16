import {Box, Button, Typography} from '@mui/material';

import {useFormState} from '../state/FormContext';

/**
 * Sticky save bar: one always-present polite live region (no nested live region)
 * so dirty/saving/error changes announce; cleared on success (the toast confirms).
 * Save is a plain button — the page is not a <form> — disabled while saving.
 */
export default function SaveBar({onSave}: {onSave: () => void}) {
  const {save} = useFormState();
  const hasContent = save.status !== 'idle';

  return (
    <Box
      role="region"
      aria-live="polite"
      aria-label="Save status"
      sx={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mt: 2,
        py: hasContent ? 2 : 0,
        borderTop: hasContent
          ? '1px solid var(--borders-neutral-light)'
          : 'none',
        background: 'var(--background-neutral-primary)',
      }}
    >
      {hasContent && (
        <>
          <Typography variant="body2" sx={{flex: 1}}>
            You’ve made some changes.
          </Typography>
          {save.status === 'error' && (
            // No role here: the bar is already a polite live region, and an
            // assertive role="alert" nested in it has contradictory politeness.
            <Box sx={{flex: 1}}>
              {save.formErrors.map(message => (
                <Typography
                  key={message}
                  variant="body2"
                  sx={{color: 'var(--text-error-primary)'}}
                >
                  {message}
                </Typography>
              ))}
            </Box>
          )}
          <Button
            type="button"
            variant="contained"
            onClick={onSave}
            disabled={save.status === 'saving'}
          >
            {save.status === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      )}
    </Box>
  );
}
