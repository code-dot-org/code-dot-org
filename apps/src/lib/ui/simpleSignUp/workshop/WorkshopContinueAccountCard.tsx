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
import React from 'react';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';

const WorkshopContinueAccountCard: React.FunctionComponent<{
  continueAccountUrl: string;
}> = ({continueAccountUrl}) => (
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
        text={i18n.ltiIframeCallToAction()}
        onClick={() => navigateToHref(continueAccountUrl)}
      />
    </CardActions>
  </Card>
);

export default WorkshopContinueAccountCard;
