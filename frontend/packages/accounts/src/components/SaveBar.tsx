import {Box, Button, Typography} from '@mui/material';

import {useFormState} from '../state/FormContext';

/**
 * Sticky save bar. The region is always present with `aria-live="polite"` (its
 * content toggles on dirty state — never injected on demand, per the a11y
 * spec), sits last in the form's DOM order, and is sticky for visual position
 * only. The Save control is a submit button (Enter-to-submit) disabled while
 * saving (double-submit guard).
 */
export default function SaveBar() {
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
            {save.status === 'saved'
              ? 'Your changes have been saved!'
              : 'You’ve made some changes.'}
          </Typography>
          {save.status === 'error' && (
            <Box role="alert" sx={{flex: 1}}>
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
          {save.status !== 'saved' && (
            <Button
              type="submit"
              variant="contained"
              disabled={save.status === 'saving'}
            >
              {save.status === 'saving' ? 'Saving…' : 'Save changes'}
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
