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

import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/Instructions.module.scss';

interface ContinueButtonActionNeededProps {
  isDisabled: boolean;
  type: ButtonType;
  color: ButtonColor;
  iconRight: FontAwesomeV6IconProps | undefined;
  text: string;
  tooltipMessage?: string;
}

/**
 * Displays the 'Continue' or 'Finish' button that advances to the next level or finishes the progression.
 * This button is always displayed, but is disabled if the user has not met the conditions for the next level.
 */
const ContinueButtonActionNeeded: React.FC<ContinueButtonActionNeededProps> = ({
  isDisabled,
  type,
  color,
  iconRight,
  text,
  tooltipMessage,
}) => {
  const dispatch = useAppDispatch();

  // Show tooltip when button is disabled AND we have a message
  const shouldShowTooltip = isDisabled && !!tooltipMessage;

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
          id="instructions-continue-action-needed-button"
          onClick={() => dispatch(continueOrFinishLesson())}
          disabled={isDisabled}
          {...{text, type, color, iconRight}}
        />
      </WithConditionalTooltip>
    </div>
  );
};

export default ContinueButtonActionNeeded;
