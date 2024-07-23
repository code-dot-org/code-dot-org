import classNames from 'classnames';
import React, {useRef} from 'react';

import {LinkButton, buttonColors} from '@cdo/apps/componentLibrary/button';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import i18n from '@cdo/locale';

import styles from '../link-account.module.scss';

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
        <LinkButton
          className={styles.button}
          color={buttonColors.black}
          size="m"
          text={i18n.createAccount()}
          type="secondary"
          href={newAccountUrl}
        />
      </CardActions>
    </Card>
  );
};

export default WorkshopNewAccountCard;
