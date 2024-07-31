import classNames from 'classnames';
import React from 'react';

import {
  ButtonType,
  LinkButton,
  buttonColors,
} from '@cdo/apps/componentLibrary/button';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/componentLibrary/card';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import styles from '../link-account.module.scss';

const WorkshopAccountCard: React.FunctionComponent<{
  id: string;
  icon: string;
  title: string;
  content: string;
  buttonText: string;
  buttonType: ButtonType;
  href: string;
}> = ({id, icon, title, content, buttonText, buttonType, href}) => (
  <Card data-testid={id}>
    <CardHeader
      title={title}
      icon={
        <FontAwesomeV6Icon
          className={classNames(styles.cardIcon, 'fa-2x')}
          iconName={icon}
        />
      }
    />
    <CardContent className={classNames(styles.cardContent)}>
      {content}
    </CardContent>
    <CardActions>
      <LinkButton
        className={styles.button}
        color={
          buttonType === 'primary' ? buttonColors.purple : buttonColors.black
        }
        size="m"
        text={buttonText}
        type={buttonType}
        href={href}
      />
    </CardActions>
  </Card>
);

export default WorkshopAccountCard;
