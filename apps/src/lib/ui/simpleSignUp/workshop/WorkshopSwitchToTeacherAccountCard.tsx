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

const WorkshopSwitchToTeacherAccountCard: React.FunctionComponent = () => (
  <Card data-testid={'switch-to-teacher-account-card'}>
    <CardHeader
      title={i18n.accountSwitchTeacherAccountCardTitle()}
      icon={
        <FontAwesomeV6Icon
          className={classNames(styles.cardIcon, 'fa-2x')}
          iconName={'chalkboard-user'}
        />
      }
    />
    <CardContent className={classNames(styles.cardContent)}>
      {i18n.accountSwitchTeacherAccountCardContent()}
    </CardContent>
    <CardActions>
      <LinkButton
        className={styles.button}
        color={buttonColors.black}
        size="m"
        text={i18n.accountSwitchTeacherAccountCardButton()}
        type="secondary"
        href="/users/edit"
      />
    </CardActions>
  </Card>
);

export default WorkshopSwitchToTeacherAccountCard;
