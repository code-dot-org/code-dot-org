import {Box, Typography} from '@mui/material';
import {useId, type FocusEvent} from 'react';

import Link from '@code-dot-org/component-library/link';
import RadioButton from '@code-dot-org/component-library/radioButton';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import type {EmailOptIn} from '@code-dot-org/core/api';

export const EMAIL_OPT_IN_REQUIRED = 'This field is required.';

interface EmailOptInFieldProps {
  value: EmailOptIn;
  onChange: (value: EmailOptIn) => void;
  /** Shows the required-answer error while unanswered. */
  touched: boolean;
  /** Called when focus leaves the question. */
  onTouched: () => void;
  disabled: boolean;
}

/** The marketing-email question legacy asks teachers, shared by every dialog that records consent. */
export default function EmailOptInField({
  value,
  onChange,
  touched,
  onTouched,
  disabled,
}: EmailOptInFieldProps) {
  const id = useId();
  const questionId = `${id}-question`;
  const errorId = `${id}-error`;
  const showError = touched && value === '';

  // Set touched on blur, except when the blur comes from inside the same tree.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onTouched();
  };

  return (
    // The privacy link follows the group so it is not folded into the
    // radiogroup's accessible name.
    <Box>
      <Typography id={questionId} variant="body2" component="div" sx={{mb: 1}}>
        Can we email you about updates to our courses, local opportunities, or
        other computer science news?
      </Typography>
      <Box
        role="radiogroup"
        aria-labelledby={questionId}
        aria-describedby={showError ? errorId : undefined}
        aria-invalid={showError ? true : undefined}
        onBlur={onBlur}
        sx={{display: 'flex', gap: 3}}
      >
        <RadioButton
          name="email_preference_opt_in"
          value="yes"
          label="Yes"
          checked={value === 'yes'}
          onChange={() => onChange('yes')}
          disabled={disabled}
        />
        <RadioButton
          name="email_preference_opt_in"
          value="no"
          label="No"
          checked={value === 'no'}
          onChange={() => onChange('no')}
          disabled={disabled}
        />
      </Box>
      {showError && (
        <Typography
          id={errorId}
          role="alert"
          variant="body3"
          component="div"
          sx={{color: 'var(--text-error-primary)', mt: 0.5}}
        >
          {EMAIL_OPT_IN_REQUIRED}
        </Typography>
      )}
      <Typography variant="body2" component="div" sx={{mt: 1}}>
        <Link href={siteConfig.marketingUrl('/privacy')} openInNewTab>
          (See our privacy policy)
        </Link>
      </Typography>
    </Box>
  );
}
