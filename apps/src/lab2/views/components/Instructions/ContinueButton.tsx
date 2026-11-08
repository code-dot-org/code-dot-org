import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';

import toneStyles from '@cdo/apps/lab2/views/components/button-tone.module.scss';
import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/instructions.module.scss';

/** The button's element id, for anything that points at it. */
export const CONTINUE_BUTTON_ID = 'instructions-continue-button';

type ContinueButtonProps = Omit<MuiButtonProps, 'onClick'> & {
  tooltipMessage?: string;
  hideIfDisabled?: boolean;
  /** Green, matching the header's finish button. */
  tone?: 'primary' | 'success';
  onContinue: () => void;
};

/**
 * Displays the 'Continue' or 'Finish' button unless hidden is true.
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  tooltipMessage,
  hideIfDisabled,
  tone = 'primary',
  disabled,
  onContinue,
  children,
  className,
  ...buttonProps
}) => {
  // Show tooltip when button is disabled AND we have a message.
  const shouldShowTooltip = !!disabled && !!tooltipMessage;

  if (hideIfDisabled && disabled) {
    return null;
  }

  return (
    <div className={moduleStyles.buttonInstructionTooltipOverlay}>
      <WithConditionalTooltip
        showTooltip={shouldShowTooltip}
        tooltipProps={{
          title: tooltipMessage || '',
          id: 'continue-button-tooltip',
        }}
      >
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          type="button"
          id={CONTINUE_BUTTON_ID}
          className={classNames(
            className,
            tone === 'success' && toneStyles.success
          )}
          onClick={onContinue}
          disabled={disabled}
          {...buttonProps}
        >
          <span>{children}</span>
        </MuiButton>
      </WithConditionalTooltip>
    </div>
  );
};

export default ContinueButton;
