import React, {useState} from 'react';
import cookies from 'js-cookie';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {Heading1, Heading3} from '@cdo/apps/componentLibrary/typography';
import experiments from '@cdo/apps/util/experiments';
import style from './hoc-guide-dialogue.module.scss';

function HourOfCodeGuideEmailDialog({isSignedIn}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);

  const onClose = () => {
    cookies.set('HourOfCodeGuideEmailDialogSeen', 'true', {
      expires: 90,
      path: '/',
    });
    setIsOpen(false);
  };

  const sendEmail = () => {
    analyticsReporter.sendEvent(EVENTS.GUIDE_SENT_EVENT, {
      isSignedIn: isSignedIn,
    });
    // TODO: send email to stored address here
  };

  const saveInputs = () => {
    // TODO: store name and email here
  };

  const bodyText = isSignedIn
    ? i18n.weHaveEverything()
    : i18n.signUpToReceiveGuide();

  const emailGuideButtonText = isSignedIn
    ? i18n.emailMeAGuide()
    : i18n.getGuideContinue();

  const continueWithoutEmailButtonText = isSignedIn
    ? i18n.continueToActivity()
    : i18n.continueWithoutGuide();

  return (
    <div>
      {isOpen && experiments.isEnabled(experiments.HOC_TUTORIAL_DIALOG) && (
        <AccessibleDialog styles={style} onClose={onClose}>
          <div tabIndex="0">
            <Heading1>{i18n.welcomeToDanceParty()}</Heading1>
          </div>
          <div className={style.middle}>
            <Heading3>{i18n.learnHowToHost()}</Heading3>
            {bodyText}
            <label className={style.typographyLabel}>
              {i18n.yourNameCaps()}
              <input
                required
                type="text"
                id="uitest-hoc-guide-name"
                className={style.classNameTextField}
                onChange={() => {}}
              />
            </label>
            <label className={style.typographyLabel}>
              {i18n.yourEmailCaps()}
              <input
                required
                type="text"
                id="uitest-hoc-guide-email"
                className={style.classNameTextField}
                onChange={() => {}}
              />
            </label>
            <label className={style.label}>
              <input
                checked={isMarketingChecked}
                className={style.box}
                type="checkbox"
                id="uitest-receive-updates-checkbox"
                onChange={() => {
                  setIsMarketingChecked(!isMarketingChecked);
                }}
              />
              {i18n.receiveFutureUpdates()}
            </label>
          </div>
          <div className={style.buttonsBottom}>
            <Button
              id="uitest-no-email-guide"
              text={continueWithoutEmailButtonText}
              onClick={() => {
                onClose();
              }}
              color={Button.ButtonColor.white}
            />
            <Button
              id="uitest-email-guide"
              text={emailGuideButtonText}
              onClick={() => {
                saveInputs();
                sendEmail();
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
  isSignedIn: PropTypes.bool.isRequired,
};

export const UnconnectedHourOfCodeGuideEmailDialog = HourOfCodeGuideEmailDialog;

export default HourOfCodeGuideEmailDialog;
