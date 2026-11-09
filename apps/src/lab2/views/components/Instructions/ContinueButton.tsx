import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';
import {ButtonColor} from '@cdo/apps/lab2/views/components/buttonColor';

import {instructionsContinueButtonElementId} from './ResourcePanel/constants';

import colorStyles from '@cdo/apps/lab2/views/components/button-color.module.scss';
import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/instructions.module.scss';

type ContinueButtonProps = Omit<MuiButtonProps, 'onClick'> & {
  tooltipMessage?: string;
  hideIfDisabled?: boolean;
  buttonColor?: ButtonColor;
  onContinue: () => void;
};

/**
 * Displays the 'Continue' or 'Finish' button unless hidden is true.
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  tooltipMessage,
  hideIfDisabled,
  buttonColor = 'primary',
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
          id={instructionsContinueButtonElementId}
          className={classNames(
            className,
            buttonColor === 'success' && colorStyles.success
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
