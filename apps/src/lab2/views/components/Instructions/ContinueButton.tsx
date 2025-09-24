import {Button, ButtonProps} from '@code-dot-org/component-library/button';
import React from 'react';

import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/instructions.module.scss';

interface ContinueButtonProps extends ButtonProps {
  tooltipMessage?: string;
  hideIfDisabled?: boolean;
}

/**
 * Displays the 'Continue' or 'Finish' button that advances to the next level or finishes the progression unless
 * hidden is true.
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  tooltipMessage,
  hideIfDisabled,
  disabled,
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
        <Button
          id="instructions-continue-button"
          onClick={() => dispatch(continueOrFinishLesson())}
          disabled={disabled}
          size={'s'}
          {...buttonProps}
        />
      </WithConditionalTooltip>
    </div>
  );
};

export default ContinueButton;
