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

const WorkshopExistingAccountCard: React.FunctionComponent<{
  existingAccountUrl: string;
}> = ({existingAccountUrl}) => (
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
      {i18n.accountExistingAccountCardContentWorkshopEnroll()}
    </CardContent>
    <CardActions>
      <LinkButton
        className={styles.button}
        color={buttonColors.purple}
        size="m"
        text={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
        type="primary"
        href={existingAccountUrl}
      />
    </CardActions>
  </Card>
);

export default WorkshopExistingAccountCard;
