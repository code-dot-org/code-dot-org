import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Typography from '@cdo/apps/componentLibrary/typography';
import style from './no_sections_to_assign_dialog.module.scss';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const signInURL = `/users/sign_in?user_return_to=${location.pathname}`;
const upgradeAccountArticleURL =
  'https://support.code.org/hc/en-us/articles/360023222371-How-can-I-change-my-account-type-from-student-to-teacher-or-vice-versa';
const setUpStudentSectionsURL =
  window.location.origin +
  '/home?openAddSectionDialog=true&participantType=student';
const handleSignInOrCreateAccountClick = () => {
  analyticsReporter.sendEvent(
    EVENTS.CURRICULUM_CATALOG_SIGN_IN_CLICKED_IN_ASSIGN_DIALOG
  );
  window.location.href = signInURL;
};

export const SignInToAssignSectionsDialog = ({onClose}) => (
  <NoSectionsToAssignBaseDialog
    headerText={i18n.signInToAssign()}
    helpText={i18n.signInToAssignHelpText()}
    onClose={onClose}
    buttonText={i18n.signInOrCreateAccount()}
    onClick={handleSignInOrCreateAccountClick}
  />
);

SignInToAssignSectionsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export const UpgradeAccountToAssignSectionsDialog = ({onClose}) => (
  <NoSectionsToAssignBaseDialog
    headerText={i18n.upgradeAccountToAssign()}
    helpText={i18n.upgradeAccountToAssignHelpText()}
    onClose={onClose}
    buttonText={i18n.upgradeAccountToAssignButtonText()}
    href={upgradeAccountArticleURL}
  />
);

UpgradeAccountToAssignSectionsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export const CreateSectionsToAssignSectionsDialog = ({onClose}) => (
  <NoSectionsToAssignBaseDialog
    headerText={i18n.createClassSectionsToAssign()}
    helpText={i18n.createClassSectionsToAssignHelpText()}
    onClose={onClose}
    buttonText={i18n.createClassSectionToAssignButton()}
    href={setUpStudentSectionsURL}
  />
);

CreateSectionsToAssignSectionsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

const NoSectionsToAssignBaseDialog = ({
  headerText,
  helpText,
  onClose,
  buttonText,
  href,
  onClick,
}) => {
  if (!(Boolean(onClick) ^ Boolean(href))) {
    throw new Error('Expect exactly one of onClick or href');
  }

  return (
    <AccessibleDialog onClose={onClose} className={style.dialogContainer}>
      <Typography semanticTag="h3" visualAppearance="heading-lg" tabIndex="0">
        {headerText}
      </Typography>
      <hr />
      <Typography semanticTag="p" visualAppearance="body-two">
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
