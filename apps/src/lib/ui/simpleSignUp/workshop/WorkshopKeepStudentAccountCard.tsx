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

const WorkshopKeepStudentAccountCard: React.FunctionComponent<{
  cancelUrl: string;
}> = ({cancelUrl}) => (
  <Card data-testid={'new-account-card'}>
    <CardHeader
      title={i18n.accountKeepStudentAccountCardTitle()}
      icon={
        <FontAwesomeV6Icon
          className={classNames(styles.cardIcon, 'fa-2x')}
          iconName={'child'}
        />
      }
    />
    <CardContent className={classNames(styles.cardContent)}>
      {i18n.accountKeepStudentAccountCardContent()}
    </CardContent>
    <CardActions>
      <LinkButton
        className={styles.button}
        color={buttonColors.black}
        size="m"
        text={i18n.accountKeepStudentAccountCardButton()}
        type="secondary"
        href={cancelUrl}
      />
    </CardActions>
  </Card>
);

export default WorkshopKeepStudentAccountCard;
