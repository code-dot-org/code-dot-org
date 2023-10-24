import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {Heading1, Heading3} from '@cdo/apps/componentLibrary/typography';
import experiments from '@cdo/apps/util/experiments';
import style from './accessible-dialogue.module.scss';

function HourOfCodeGuideEmailDialog(signedIn) {
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => {
    setIsOpen(false);
  };

  const bodyText = () =>
    signedIn === true ? i18n.weHaveEverything() : i18n.signUpToReceiveGuide();

  const emailGuideButtonText = () =>
    signedIn === true ? i18n.emailMeAGuide() : i18n.getGuideContinue();

  const continueWithoutEmailButtonText = () =>
    signedIn === true ? i18n.continueToActivity() : i18n.continueWithoutGuide();

  return (
    <div>
      {isOpen && experiments.isEnabled(experiments.HOC_TUTORIAL_DIALOG) && (
        <AccessibleDialog onClose={onClose}>
          <div tabIndex="0">
            <Heading1>{i18n.welcomeToDanceParty()}</Heading1>
          </div>
          <div className={style.middle}>
            <Heading3>{i18n.learnHowToHost()}</Heading3>
            {bodyText()}
          </div>
          <div className={style.buttonsBottom}>
            <Button
              id="uitest-no-email-guide"
              text={continueWithoutEmailButtonText()}
              onClick={() => {
                onClose();
              }}
              color={Button.ButtonColor.white}
            />
            <Button
              id="uitest-email-guide"
              text={emailGuideButtonText()}
              onClick={() => {
                onClose();
              }}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          </div>
        </AccessibleDialog>
      )}
    </div>
  );
}

HourOfCodeGuideEmailDialog.propTypes = {
  // Provided by redux
  signedIn: PropTypes.bool,
};

export const UnconnectedHourOfCodeGuideEmailDialog = HourOfCodeGuideEmailDialog;

export default connect(state => ({
  signedIn: state.currentUser.signInState === SignInState.SignedIn,
}))(HourOfCodeGuideEmailDialog);
