import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';

export const SignInToAssignSectionsDialog = ({onClose}) => (
  <NoSectionsToAssignBaseDialog
    headerText={'Sign in or create account to create curriculum'}
    helpText={'You need to be signed in and have class sections'}
    onClose={onClose}
    buttonText={'Sign in or create account'}
    href={`/users/sign_in?user_return_to=${location.pathname}`}
  />
);

SignInToAssignSectionsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

const NoSectionsToAssignBaseDialog = ({
  headerText,
  helpText,
  onClose,
  buttonText,
  href,
}) => {
  return (
    <AccessibleDialog onClose={onClose}>
      <div tabIndex="0">{headerText}</div>
      <hr />
      <div>{helpText}</div>
      <hr />
      <div>
        <Button
          text={i18n.dialogCancel()}
          onClick={onClose}
          color={Button.ButtonColor.white}
        />
        <Button
          __useDeprecatedTag
          href={href}
          text={buttonText}
          color={Button.ButtonColor.gray}
        />
      </div>
    </AccessibleDialog>
  );
};

NoSectionsToAssignBaseDialog.propTypes = {
  headerText: PropTypes.string.isRequired,
  helpText: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};
