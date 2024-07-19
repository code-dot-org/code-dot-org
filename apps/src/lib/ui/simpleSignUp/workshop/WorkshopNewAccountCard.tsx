import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import classNames from 'classnames';
import styles from '../link-account.module.scss';
import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import React, {useRef} from 'react';
import i18n from '@cdo/locale';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {navigateToHref} from '@cdo/apps/utils';

const WorkshopNewAccountCard: React.FunctionComponent<{
  emailAddress: string;
  newAccountUrl: string;
}> = ({emailAddress, newAccountUrl}) => {
  const finishSignupFormRef = useRef<HTMLFormElement>(null);

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
        {i18n.accountNewAccountCardContentWorkshopEnroll()}

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
          text={i18n.createAccount()}
          onClick={() => navigateToHref(newAccountUrl)}
        />
      </CardActions>
    </Card>
  );
};

export default WorkshopNewAccountCard;
