import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import classNames from 'classnames';
import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';
import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import React, {useContext, useRef, useState} from 'react';
import i18n from '@cdo/locale';
import {LtiProviderContext} from '../../context';
import DCDO from '@cdo/apps/dcdo';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {navigateToHref} from '@cdo/apps/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

const NewAccountCard = () => {
  const {ltiProviderName, newAccountUrl, emailAddress, userType} =
    useContext(LtiProviderContext)!;
  const isLMS = true;
  const finishSignupFormRef = useRef<HTMLFormElement>(null);
  const isStudentEmailPostEnabled = DCDO.get(
    'student-email-post-enabled',
    false
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleNewAccountSaved = () => {
    const eventPayload = {
      lms_name: ltiProviderName,
      user_type: userType,
    };
    analyticsReporter.sendEvent(
      'lti_new_account_click',
      eventPayload,
      PLATFORMS.STATSIG
    );
    if (isStudentEmailPostEnabled) {
      finishSignupFormRef.current?.submit();
    } else {
      navigateToHref(newAccountUrl);
    }
  };

  const handleNewAccountSubmit = async () => {
    setIsSaving(true);

    fetch('/lti/v1/account_linking/new_account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
    }).then(response => {
      if (response.ok) {
        handleNewAccountSaved();
      }
    });
  };

  return (
    <Card data-testid={'new-account-card'}>
      <CardHeader
        title={i18n.ltiLinkAccountNewAccountCardHeaderLabel()}
        icon={
          <FontAwesomeV6Icon
            className={classNames(styles.icon, 'fa-2x')}
            iconName={'user-plus'}
          />
        }
      />
      <div className={classNames(styles.cardContentContainer)}>
        <CardContent>
          {isLMS
            ? i18n.ltiLinkAccountNewAccountCardContent({
                providerName: ltiProviderName,
              })
            : i18n.nonLMSAccountNewAccountCardContentWorkshopEnroll()}

          <form
            data-testid={'new-account-form'}
            action={newAccountUrl}
            ref={finishSignupFormRef}
            method="post"
            className={styles.newAccountForm}
          >
            <RailsAuthenticityToken />
            <input type="hidden" value={emailAddress} name={'user[email]'} />
          </form>
        </CardContent>
      </div>
      <CardActions>
        <Button
          className={classNames(styles.button, styles.cardSecondaryButton)}
          color={buttonColors.white}
          size="m"
          text={
            isLMS
              ? i18n.ltiLinkAccountNewAccountCardActionLabel()
              : i18n.nonLMSAccountNewAccountCardActionLabel()
          }
          isPending={isSaving}
          disabled={isSaving}
          onClick={handleNewAccountSubmit}
        />
      </CardActions>
    </Card>
  );
};

export default NewAccountCard;
