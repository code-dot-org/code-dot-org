import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import classNames from 'classnames';
import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';
import {buttonColors, LinkButton} from '@cdo/apps/componentLibrary/button';
import React, {useContext} from 'react';
import i18n from '@cdo/locale';
import {LtiProviderContext} from '../../context';

const NewAccountCard = () => {
  const {ltiProvider, newAccountUrl} = useContext(LtiProviderContext)!;
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
        {i18n.ltiLinkAccountNewAccountCardContent({providerName: ltiProvider})}
      </CardContent>
      <CardActions>
        <LinkButton
          className={classNames(styles.button, styles.cardSecondaryButton)}
          color={buttonColors.white}
          size="l"
          href={newAccountUrl}
          text={i18n.ltiLinkAccountNewAccountCardActionLabel()}
        />
      </CardActions>
    </Card>
  );
};

export default NewAccountCard;
