import {Button, buttonColors} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useContext, useState} from 'react';

import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/sharedComponents/card';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {LtiProviderContext} from '../../context';

import styles from '../../../../../link-account.module.scss';

const LtiContinueAccountCard = () => {
  const {ltiProviderName, continueAccountUrl, userType, newAccountUrl} =
    useContext(LtiProviderContext)!;
  const [isSaving, setIsSaving] = useState(false);

  const handleNewAccountSaved = () => {
    const eventPayload = {
      lms_name: ltiProviderName,
      user_type: userType,
    };
    analyticsReporter.sendEvent(
      'lti_continue_account_click',
      eventPayload,
      PLATFORMS.STATSIG
    );

    navigateToHref(continueAccountUrl);
  };
  const handleSubmit = async () => {
    setIsSaving(true);

    fetch(newAccountUrl.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
    }).then(response => {
      if (response.ok) {
        setIsSaving(false);
        handleNewAccountSaved();
      }
    });
  };

  return (
    // eslint-disable-next-line react/forbid-component-props
    <Card data-testid={'continue-account-card'}>
      <CardHeader
        title={i18n.ltiLinkAccountNewAccountCardHeaderLabel()}
        icon={
          <FontAwesomeV6Icon
            className={classNames(styles.cardIcon, 'fa-2x')}
            iconName={'user-plus'}
          />
        }
      />
      <CardContent className={styles.cardContent}>
        {i18n.ltiLinkAccountContinueAccountCardContent()}
      </CardContent>
      <CardActions>
        <Button
          className={classNames(styles.button, styles.cardSecondaryButton)}
          color={buttonColors.white}
          size="m"
          isPending={isSaving}
          disabled={isSaving}
          text={i18n.ltiIframeCallToAction()}
          onClick={handleSubmit}
        />
      </CardActions>
    </Card>
  );
};

export default LtiContinueAccountCard;
