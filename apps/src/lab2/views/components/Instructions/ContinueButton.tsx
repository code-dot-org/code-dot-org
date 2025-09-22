import {
  Button,
  ButtonType,
  ButtonColor,
} from '@code-dot-org/component-library/button';
import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
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
  size?: ComponentSizeXSToL;
  className?: string;
}

/**
 * Displays the 'Continue' or 'Finish' button that advances to the next level or finishes the progression.
 * If the button is always displayed, it is disabled if the user has not met the conditions for the next level.
 * If isLabHidesContinueButton is true, the button is hidden until user has met the conditions for the next level.
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
  size,
  className,
}) => {
  const dispatch = useAppDispatch();

  // Show tooltip when button is disabled AND we have a message.
  const shouldShowTooltip = isDisabled && !!tooltipMessage;

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
          {...{text, type, color, iconRight, size, className}}
        />
      </WithConditionalTooltip>
    </div>
  );
};

export default ContinueButton;
