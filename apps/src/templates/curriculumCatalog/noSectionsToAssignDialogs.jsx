import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Typography from '@cdo/apps/componentLibrary/typography';
import style from './no_sections_to_assign_dialog.module.scss';

export const SignInToAssignSectionsDialog = ({onClose}) => (
  <NoSectionsToAssignBaseDialog
    headerText={i18n.signInToAssign()}
    helpText={i18n.signInToAssignHelpText()}
    onClose={onClose}
    buttonText={i18n.signInOrCreateAccount()}
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
    <AccessibleDialog onClose={onClose} className={style.dialogueContainer}>
      <Typography semanticTag="h3" tabIndex="0">
        {headerText}
      </Typography>
      <hr />
      <Typography semanticTag="span" visualAppearance="body-one">
        {helpText}
      </Typography>
      <div className={style.lowerContainer}>
        <hr />
        <div className={style.buttonContainer}>
          <Button
            text={i18n.dialogCancel()}
            onClick={onClose}
            color={Button.ButtonColor.neutralDark}
          />
          <Button
            __useDeprecatedTag
            href={href}
            text={buttonText}
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </div>
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
