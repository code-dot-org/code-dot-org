import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {
  Heading3,
  Heading5,
  BodyTwoText,
} from '@cdo/apps/componentLibrary/typography';

function HourOfCodeGuideEmailDialog(signedIn) {
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => {
    setIsOpen(false);
  };

  const bodyText = () => {
    return signedIn ? i18n.weHaveEverything() : i18n.signUpToReceiveGuide();
  };

  const emailGuideButtonText = () => {
    return signedIn ? i18n.emailMeAGuide() : i18n.getGuideContinue();
  };

  const continueWithoutEmailButtonText = () => {
    return signedIn ? i18n.continueToActivity() : i18n.continueWithoutGuide();
  };

  return (
    <div>
      {isOpen && (
        <AccessibleDialog onClose={onClose}>
          <div tabIndex="0">
            <Heading3>{i18n.welcomeToDanceParty()}</Heading3>
          </div>
          <div>
            <BodyTwoText>{i18n.learnHowToHost()}</BodyTwoText>
          </div>
          <div>
            <Heading5>{bodyText}</Heading5>
            <Button
              id="uitest-no-email-guide"
              text={continueWithoutEmailButtonText}
              onClick={() => {}}
              styleAsText
              color={Button.ButtonColor.brandSecondaryDefault}
            />
            <Button
              id="uitest-email-guide"
              text={emailGuideButtonText}
              onClick={() => {}}
              styleAsText
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
