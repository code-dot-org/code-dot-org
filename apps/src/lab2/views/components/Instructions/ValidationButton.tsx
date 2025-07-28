import Button from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './validation-results.module.scss';

interface ValidationButtonProps {
  onValidate: () => void;
  onStopValidation: () => void;
  isValidating: boolean;
  isValidateDisabled: boolean;
}

const ValidationButton: React.FunctionComponent<ValidationButtonProps> = ({
  onValidate,
  onStopValidation,
  isValidating,
  isValidateDisabled = false,
}) => {
  const hasConditions = useAppSelector(
    state => state.lab.validationState?.hasConditions
  );
  if (!hasConditions) {
    return null;
  }

  return isValidating ? (
    <Button
      text={codebridgeI18n.stopValidation()}
      onClick={onStopValidation}
      color={'destructive'}
      iconLeft={{iconStyle: 'solid', iconName: 'square'}}
      className={classNames(
        moduleStyles.buttonInstruction,
        moduleStyles.validationButton
      )}
      size={'s'}
    />
  ) : (
    <Button
      text={codebridgeI18n.validate()}
      onClick={onValidate}
      type={'secondary'}
      disabled={isValidateDisabled}
      iconLeft={{iconStyle: 'solid', iconName: 'clipboard-check'}}
      className={classNames(
        moduleStyles.buttonInstruction,
        moduleStyles.validationButton
      )}
      color={'black'}
      size={'s'}
      id={'uitest-validate-button'}
    />
  );
};

export default ValidationButton;
