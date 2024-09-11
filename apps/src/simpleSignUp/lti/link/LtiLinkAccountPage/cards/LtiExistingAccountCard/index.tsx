import classNames from 'classnames';
import React, {useContext} from 'react';

import {buttonColors, Button} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/sharedComponents/card';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {LtiProviderContext} from '../../context';

import styles from '../../../../../link-account.module.scss';

const LtiExistingAccountCard = () => {
  const {
    ltiProvider,
    ltiProviderName,
    existingAccountUrl,
    emailAddress,
    userType,
  } = useContext(LtiProviderContext)!;
  const urlParams = new URLSearchParams({
    lms_name: ltiProviderName,
    lti_provider: ltiProvider,
    email: emailAddress,
  });
  existingAccountUrl.search = urlParams.toString();

  const handleExistingAccountSubmit = () => {
    const eventPayload = {
      lms_name: ltiProvider,
      user_type: userType,
    };
    analyticsReporter.sendEvent(
      'lti_existing_account_click',
      eventPayload,
      PLATFORMS.STATSIG
    );

    navigateToHref(existingAccountUrl.href);
  };

  return (
    <Card data-testid={'existing-account-card'}>
      <CardHeader
        title={i18n.ltiLinkAccountExistingAccountCardHeaderLabel()}
        icon={
          <FontAwesomeV6Icon
            className={classNames(styles.cardIcon, 'fa-2x')}
            iconName={'user-check'}
          />
        }
      />
      <CardContent className={classNames(styles.cardContent)}>
        {i18n.ltiLinkAccountExistingAccountCardContent({
          providerName: ltiProviderName,
        })}
      </CardContent>
      <CardActions>
        <Button
          className={styles.button}
          color={buttonColors.purple}
          type={'primary'}
          size="m"
          onClick={handleExistingAccountSubmit}
          text={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
        />
      </CardActions>
    </Card>
  );
};

export default LtiExistingAccountCard;
