import classNames from 'classnames';
import React from 'react';

import {LinkButton, buttonColors} from '@cdo/apps/componentLibrary/button';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import i18n from '@cdo/locale';

import styles from '../link-account.module.scss';

const WorkshopNewAccountCard: React.FunctionComponent<{
  newAccountUrl: string;
}> = ({newAccountUrl}) => (
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

export default WorkshopNewAccountCard;
