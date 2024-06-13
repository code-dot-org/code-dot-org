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
import React, {useContext, useRef} from 'react';
import i18n from '@cdo/locale';
import {LtiProviderContext} from '../../context';
import DCDO from '@cdo/apps/dcdo';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {navigateToHref} from '@cdo/apps/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

const NewAccountCard = () => {
  const {ltiProviderName, newAccountUrl, emailAddress} =
    useContext(LtiProviderContext)!;
  const finishSignupFormRef = useRef<HTMLFormElement>(null);
  const isStudentEmailPostEnabled = DCDO.get(
    'student-email-post-enabled',
    false
  );

  const handleNewAccountSubmit = () => {
    const eventPayload = {
      lms_name: ltiProviderName,
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

  return (
    <Card data-testid={'new-account-card'}>
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
          size="l"
          text={i18n.ltiLinkAccountNewAccountCardActionLabel()}
          onClick={handleNewAccountSubmit}
        />
      </CardActions>
    </Card>
  );
};

export default NewAccountCard;
