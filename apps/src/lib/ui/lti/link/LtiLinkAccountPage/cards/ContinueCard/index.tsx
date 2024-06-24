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
import React, {useContext, useState} from 'react';
import i18n from '@cdo/locale';
import {LtiProviderContext} from '../../context';
import {navigateToHref} from '@cdo/apps/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

const ContinueAccountCard = () => {
  const {ltiProviderName, continueAccountUrl} = useContext(LtiProviderContext)!;
  const [isSaving, setIsSaving] = useState(false);

  const handleNewAccountSaved = () => {
    const eventPayload = {
      lms_name: ltiProviderName,
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

    fetch('/lti/v1/account_linking/new_account', {
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
    <Card data-testid={'continue-account-card'}>
      <CardHeader
        title={i18n.ltiLinkAccountNewAccountCardHeaderLabel()}
        icon={
          <FontAwesomeV6Icon
            className={classNames(styles.icon, 'fa-3x')}
            iconName={'user-plus'}
          />
        }
      />
      <CardContent>
        {i18n.ltiLinkAccountContinueAccountCardContent()}
      </CardContent>
      <CardActions>
        <Button
          className={classNames(styles.button, styles.cardSecondaryButton)}
          color={buttonColors.white}
          size="l"
          isPending={isSaving}
          disabled={isSaving}
          text={i18n.ltiIframeCallToAction()}
          onClick={handleSubmit}
        />
      </CardActions>
    </Card>
  );
};

export default ContinueAccountCard;
