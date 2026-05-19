import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
import React from 'react';

import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/instructions.module.scss';

type ContinueButtonProps = Omit<MuiButtonProps, 'onClick'> & {
  tooltipMessage?: string;
  hideIfDisabled?: boolean;
  onContinue?: () => void;
};

/**
 * Displays the 'Continue' or 'Finish' button that advances to the next level or finishes the progression unless
 * hidden is true.
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  tooltipMessage,
  hideIfDisabled,
  disabled,
  onContinue,
  children,
  ...buttonProps
}) => {
  const dispatch = useAppDispatch();

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
          text: tooltipMessage || '',
          direction: 'onTop',
          tooltipId: 'continue-button-tooltip',
          size: 'xs',
        }}
      >
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          type="button"
          id="instructions-continue-button"
          onClick={() => {
            onContinue?.();
            dispatch(continueOrFinishLesson());
          }}
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
