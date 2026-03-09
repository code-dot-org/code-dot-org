import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
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
    <MuiButton
      variant="contained"
      color="error"
      size="small"
      className={classNames(
        moduleStyles.buttonInstruction,
        moduleStyles.validationButton
      )}
      onClick={onStopValidation}
      type="button"
      startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="square" />}
    >
      {codebridgeI18n.stopValidation()}
    </MuiButton>
  ) : (
    <MuiButton
      variant="contained"
      color="primary"
      size="small"
      disabled={isValidateDisabled}
      className={classNames(
        moduleStyles.buttonInstruction,
        moduleStyles.validationButton
      )}
      id="uitest-validate-button"
      onClick={onValidate}
      type="button"
      startIcon={
        <FontAwesomeV6Icon iconStyle="solid" iconName="clipboard-check" />
      }
    >
      {codebridgeI18n.validate()}
    </MuiButton>
  );
};

export default ValidationButton;
