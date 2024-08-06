import classNames from 'classnames';
import React, {useContext, useRef, useState} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import DCDO from '@cdo/apps/dcdo';
import {PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import RailsAuthenticityToken from '@cdo/apps/util/RailsAuthenticityToken';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {LtiProviderContext} from '../../context';

import styles from '../../../../../link-account.module.scss';

const LtiNewAccountCard = () => {
  const {ltiProviderName, newAccountUrl, emailAddress, userType} =
    useContext(LtiProviderContext)!;
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
            className={classNames(styles.cardIcon, 'fa-2x')}
            iconName={'user-plus'}
          />
        }
      />
      <CardContent className={classNames(styles.cardContent)}>
        {i18n.ltiLinkAccountNewAccountCardContent({
          providerName: ltiProviderName,
        })}

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
      <CardActions>
        <Button
          className={classNames(styles.button, styles.cardSecondaryButton)}
          color={buttonColors.white}
          size="m"
          text={i18n.ltiLinkAccountNewAccountCardActionLabel()}
          isPending={isSaving}
          disabled={isSaving}
          onClick={handleNewAccountSubmit}
        />
      </CardActions>
    </Card>
  );
};

export default LtiNewAccountCard;
