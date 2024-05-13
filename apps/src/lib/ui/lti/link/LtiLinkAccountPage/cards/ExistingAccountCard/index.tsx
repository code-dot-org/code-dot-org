import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import classNames from 'classnames';
import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';
import cardStyles from '@cdo/apps/componentLibrary/card/Card/card.module.scss';
import {buttonColors, LinkButton} from '@cdo/apps/componentLibrary/button';
import React, {useContext} from 'react';
import i18n from '@cdo/locale';
import {LtiProviderContext} from '../../context';

const ExistingAccountCard = () => {
  const {ltiProvider, existingAccountUrl} = useContext(LtiProviderContext)!;

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
          providerName: ltiProvider,
        })}
      </CardContent>
      <CardActions>
        <LinkButton
          className={styles.button}
          color={buttonColors.purple}
          type={'primary'}
          size="l"
          href={existingAccountUrl}
          text={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
        />
      </CardActions>
    </Card>
  );
};

export default ExistingAccountCard;
