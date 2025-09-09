import {Button, buttonColors} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useContext, useState} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/sharedComponents/card';
import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {LtiProviderContext} from '../../context';

import styles from '../../../../../link-account.module.scss';

const LtiNewAccountCard = () => {
  const {
    ltiProviderName,
    finishSignUpUrl,
    emailAddress,
    userType,
    newAccountUrl,
  } = useContext(LtiProviderContext)!;

  const [isSaving, setIsSaving] = useState(false);

  const handleNewAccountSaved = () => {
    const eventPayload = {
      lms_name: ltiProviderName,
      user_type: userType,
    };
    analyticsReporter.sendEvent(
      EVENTS.SIGN_UP_STARTED_EVENT,
      {source: 'LTI'},
      PLATFORMS.BOTH
    );
    analyticsReporter.sendEvent(
      EVENTS.LTI_NEW_ACCOUNT_CLICK,
      eventPayload,
      PLATFORMS.STATSIG
    );

    sessionStorage.setItem(ACCOUNT_TYPE_SESSION_KEY, userType);
    sessionStorage.setItem(EMAIL_SESSION_KEY, emailAddress);
    navigateToHref(finishSignUpUrl);
  };

  const handleNewAccountSubmit = async () => {
    setIsSaving(true);
    fetch(newAccountUrl.href, {
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
    // eslint-disable-next-line react/forbid-component-props
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
