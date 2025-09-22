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
  disabled: boolean;
  type: ButtonType;
  color: ButtonColor;
  iconRight: FontAwesomeV6IconProps | undefined;
  text: string;
  tooltipMessage?: string;
  hidden?: boolean;
  size?: ComponentSizeXSToL;
  className?: string;
}

/**
 * Displays the 'Continue' or 'Finish' button that advances to the next level or finishes the progression unless
 * hidden is true.
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  disabled,
  type,
  color,
  iconRight,
  text,
  tooltipMessage,
  hidden,
  size,
  className,
}) => {
  const dispatch = useAppDispatch();

  // Show tooltip when button is disabled AND we have a message.
  const shouldShowTooltip = disabled && !!tooltipMessage;

  if (hidden) {
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
          {...{disabled, text, type, color, iconRight, size, className}}
        />
      </WithConditionalTooltip>
    </div>
  );
};

export default ContinueButton;
