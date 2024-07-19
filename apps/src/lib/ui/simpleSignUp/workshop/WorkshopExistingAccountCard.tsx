import classNames from 'classnames';
import React from 'react';

import {buttonColors, Button} from '@cdo/apps/componentLibrary/button';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import styles from '../link-account.module.scss';

const WorkshopExistingAccountCard: React.FunctionComponent<{
  existingAccountUrlHref: string;
}> = ({existingAccountUrlHref}) => (
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
      <Button
        className={styles.button}
        color={buttonColors.purple}
        type={'primary'}
        size="m"
        onClick={() => navigateToHref(existingAccountUrlHref)}
        text={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
      />
    </CardActions>
  </Card>
);

export default WorkshopExistingAccountCard;
