import classNames from 'classnames';
import React, {useContext} from 'react';

import {buttonColors, Button} from '@cdo/apps/componentLibrary/button';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {LtiProviderContext} from '../../context';

import cardStyles from '@cdo/apps/componentLibrary/card/Card/card.module.scss';
import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';

const ExistingAccountCard = () => {
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
            className={classNames(styles.icon, 'fa-3x')}
            iconName={'user-check'}
          />
        }
      />
      <CardContent className={cardStyles.cardContent}>
        {i18n.ltiLinkAccountExistingAccountCardContent({
          providerName: ltiProviderName,
        })}
      </CardContent>
      <CardActions>
        <Button
          className={styles.button}
          color={buttonColors.purple}
          type={'primary'}
          size="l"
          onClick={handleExistingAccountSubmit}
          text={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
        />
      </CardActions>
    </Card>
  );
};

export default ExistingAccountCard;
