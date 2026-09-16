import {Box, Button, Typography} from '@mui/material';
import type {ButtonOwnProps} from '@mui/material';
import classNames from 'classnames';

import type {ComponentSizeXSToL} from '@/common/types';

import {useFormOptions, useFormState} from './FormContext';

import moduleStyles from './saveBar.module.scss';

// The form kit's control size vocabulary (xs/s/m/l) maps onto MUI's button
// sizes so the save button matches the form's other controls.
const BUTTON_SIZE: Record<ComponentSizeXSToL, ButtonOwnProps['size']> = {
  xs: 'extraSmall',
  s: 'small',
  m: 'medium',
  l: 'large',
};

export interface SaveBarLabels {
  /** Shown when the form is dirty. */
  dirty?: string;
  /** The save button, idle. */
  save?: string;
  /** The save button, in flight (also disables it). */
  saving?: string;
  /** Accessible name for the bar's live region. */
  region?: string;
}

const DEFAULT_LABELS: Required<SaveBarLabels> = {
  dirty: 'You’ve made some changes.',
  save: 'Save changes',
  saving: 'Saving…',
  region: 'Save status',
};

export interface SaveBarProps {
  /** Fired when the user presses save. */
  onSave: () => void;
  /** Override any of the bar's copy. */
  labels?: SaveBarLabels;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/SaveBar.test.tsx)
 * * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: SaveBar Component.
 * Sticky unsaved-changes bar driven by the form kit's save state. One
 * always-present polite live region (no nested live region) announces
 * dirty/saving/error changes; it clears on success (a toast confirms the save).
 * Save is a plain button — the surrounding page is not a `<form>` — disabled
 * while saving. Must be rendered within a {@link FormProvider}.
 */
export default function SaveBar({onSave, labels}: SaveBarProps) {
  const {save} = useFormState();
  const {size} = useFormOptions();
  const copy = {...DEFAULT_LABELS, ...labels};
  const hasContent = save.status !== 'idle';

  return (
    <Box
      role="region"
      aria-live="polite"
      aria-label={copy.region}
      className={classNames(moduleStyles.saveBar, {
        [moduleStyles.hasContent]: hasContent,
      })}
    >
      {hasContent && (
        <>
          <Typography variant="body2" className={moduleStyles.grow}>
            {copy.dirty}
          </Typography>
          {save.status === 'error' && (
            // No role here: the bar is already a polite live region, and an
            // assertive role="alert" nested in it has contradictory politeness.
            <Box className={moduleStyles.grow}>
              {save.formErrors.map(message => (
                <Typography
                  key={message}
                  variant="body2"
                  className={moduleStyles.errorText}
                >
                  {message}
                </Typography>
              ))}
            </Box>
          )}
          <Button
            type="button"
            variant="contained"
            color="primary"
            size={BUTTON_SIZE[size]}
            onClick={onSave}
            disabled={save.status === 'saving'}
          >
            {save.status === 'saving' ? copy.saving : copy.save}
          </Button>
        </>
      )}
    </Box>
  );
}
