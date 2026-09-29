import type {FunctionComponent} from 'react';

import {Button, type ButtonProps} from '@code-dot-org/component-library/button';
import {continueOrFinishLesson} from '@code-dot-org/progress/redux';

import {useAppDispatch, useAppSelector} from '../../redux/store';

import WithConditionalTooltip from './WithConditionalTooltip';

import moduleStyles from './instructions.module.scss';

interface ContinueButtonProps extends ButtonProps {
  tooltipMessage?: string;
  hideIfDisabled?: boolean;
  onContinue?: () => void;
}

/**
 * Displays the 'Continue' or 'Finish' button that advances to the next level or finishes the progression unless
 * hidden is true.
 */
const ContinueButton: FunctionComponent<ContinueButtonProps> = ({
  tooltipMessage,
  hideIfDisabled,
  disabled,
  onContinue,
  ...buttonProps
}) => {
  const dispatch = useAppDispatch();
  const levelProperties = useAppSelector(state => state.lab.levelProperties);

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
        <Button
          id="instructions-continue-button"
          onClick={() => {
            onContinue?.();
            if (levelProperties) {
              dispatch(continueOrFinishLesson(levelProperties));
            }
          }}
          disabled={disabled}
          size={'s'}
          {...buttonProps}
        />
      </WithConditionalTooltip>
    </div>
  );
};

export default ContinueButton;
