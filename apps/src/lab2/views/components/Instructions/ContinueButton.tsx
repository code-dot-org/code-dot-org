import {
  Button,
  ButtonType,
  ButtonColor,
} from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/instructions.module.scss';

interface ContinueButtonProps {
  isDisabled: boolean;
  type: ButtonType;
  color: ButtonColor;
  iconRight: FontAwesomeV6IconProps | undefined;
  text: string;
  tooltipMessage?: string;
  isLabHidesContinueButton?: boolean;
  showContinueButton?: boolean;
}

/**
 * Displays the 'Continue' or 'Finish' button that advances to the next level or finishes the progression.
 * This button is always displayed, but is disabled if the user has not met the conditions for the next level.
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  isDisabled,
  type,
  color,
  iconRight,
  text,
  tooltipMessage,
  isLabHidesContinueButton,
  showContinueButton,
}) => {
  // Currently, music lab is only lab that does not always show the continue button so that alwaysShowContinueButton
  // is false for music lab and we need condition logic to know when to return button and when to return null.
  const dispatch = useAppDispatch();

  // Show tooltip when button is disabled AND we have a message
  const shouldShowTooltip = isDisabled && !!tooltipMessage;
  console.log('inside ContinueButton');
  console.log('isLabHidesContinueButton', isLabHidesContinueButton);
  console.log('showContinueButton', showContinueButton);

  if (isLabHidesContinueButton && !showContinueButton) {
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
          disabled={isDisabled}
          {...{text, type, color, iconRight}}
        />
      </WithConditionalTooltip>
    </div>
  );
};

export default ContinueButton;
