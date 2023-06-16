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
    href={`/users/sign_in?user_return_to=${
      location.pathname + location.search
    }`}
  />
);

SignInToAssignSectionsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export const UpgradeAccountToAssignSectionsDialog = ({onClose}) => (
  <NoSectionsToAssignBaseDialog
    openInNewTab
    headerText={i18n.upgradeAccountToAssign()}
    helpText={i18n.upgradeAccountToAssignHelpText()}
    onClose={onClose}
    buttonText={i18n.upgradeAccountToAssignButtonText()}
    href={
      'https://support.code.org/hc/en-us/articles/360023222371-How-can-I-change-my-account-type-from-student-to-teacher-or-vice-versa'
    }
  />
);

UpgradeAccountToAssignSectionsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export const CreateSectionsToAssignSectionsDialog = ({onClose, onClick}) => (
  <NoSectionsToAssignBaseDialog
    headerText={i18n.createClassSectionsToAssign()}
    helpText={i18n.createClassSectionsToAssignHelpText()}
    onClose={onClose}
    buttonText={i18n.createClassSectionToAssignButton()}
    onClick={onClick}
  />
);

CreateSectionsToAssignSectionsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

const NoSectionsToAssignBaseDialog = ({
  headerText,
  helpText,
  onClose,
  buttonText,
  href,
  onClick,
  openInNewTab,
}) => {
  if (onClick ^ href) {
    throw new Error('Expect exactly one of onClick or href');
  }

  // the Button component adds 'noopener noreferrer' if opening in a new tab
  const targetValue = openInNewTab ? '_blank' : null;

  return (
    <AccessibleDialog onClose={onClose} className={style.dialogContainer}>
      <Typography semanticTag="h3" tabIndex="0">
        {headerText}
      </Typography>
      <hr />
      <Typography semanticTag="p" visualAppearance="body-one">
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
          {href && (
            <Button
              __useDeprecatedTag
              target={targetValue}
              href={href}
              text={buttonText}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          )}
          {onClick && (
            <Button
              onClick={onClick}
              text={buttonText}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          )}
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
  href: PropTypes.string,
  onClick: PropTypes.func,
  openInNewTab: PropTypes.bool,
};
