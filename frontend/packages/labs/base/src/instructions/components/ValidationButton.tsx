import classNames from 'classnames';
import type {FunctionComponent} from 'react';

import Button from '@code-dot-org/component-library/button';
import type {
  ButtonColor,
  ButtonType,
} from '@code-dot-org/component-library/button';

import {useAppSelector} from '../../redux/store';

import moduleStyles from './validation-results.module.scss';

interface ValidationButtonProps {
  onValidate: () => void;
  onStopValidation: () => void;
  isValidating: boolean;
  isValidateDisabled: boolean;
  buttonColor?: ButtonColor;
  buttonType?: ButtonType;
}

const ValidationButton: FunctionComponent<ValidationButtonProps> = ({
  onValidate,
  onStopValidation,
  isValidating,
  isValidateDisabled = false,
  buttonColor = 'black',
  buttonType = 'secondary',
}) => {
  const hasConditions = useAppSelector(
    state => state.lab.validationState?.hasConditions,
  );
  if (!hasConditions) {
    return null;
  }

  return isValidating ? (
    <Button
      text="Stop validation"
      onClick={onStopValidation}
      color={'destructive'}
      iconLeft={{iconStyle: 'solid', iconName: 'square'}}
      className={classNames(
        moduleStyles.buttonInstruction,
        moduleStyles.validationButton,
      )}
      size={'s'}
    />
  ) : (
    <Button
      text="Validate"
      onClick={onValidate}
      type={buttonType}
      disabled={isValidateDisabled}
      iconLeft={{iconStyle: 'solid', iconName: 'clipboard-check'}}
      className={classNames(
        moduleStyles.buttonInstruction,
        moduleStyles.validationButton,
      )}
      color={buttonColor}
      size={'s'}
      id={'uitest-validate-button'}
    />
  );
};

export default ValidationButton;
