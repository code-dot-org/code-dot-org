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

import styles from './account-components.module.scss';

const AccountCard: React.FunctionComponent<{
  id: string;
  icon: string;
  title: string;
  content: string;
  buttonText: string;
  buttonType: ButtonType;
  href: string;
  iconList?: string[];
}> = ({id, icon, title, content, buttonText, buttonType, href, iconList}) => (
  <Card data-testid={id}>
    <div className={styles.contentWrapper}>
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
        {iconList && (
          <ul className={styles.iconList}>
            {iconList.map((item, index) => (
              <li key={index}>
                <FontAwesomeV6Icon
                  className={styles.icon}
                  iconName="check-circle"
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </div>
    <div className={styles.buttonWrapper}>
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
    </div>
  </Card>
);

export default AccountCard;
