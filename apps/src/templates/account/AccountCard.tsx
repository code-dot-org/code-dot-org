import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, ButtonProps} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@cdo/apps/sharedComponents/card';

import styles from './account-components.module.scss';

const AccountCard: React.FunctionComponent<{
  id: string;
  icon: string;
  title: string;
  content: string;
  buttonText: string;
  variant?: ButtonProps['variant'];
  href?: string;
  onClick?: () => void;
  iconList?: string[];
}> = ({
  id,
  icon,
  title,
  content,
  buttonText,
  variant = 'contained',
  href,
  onClick,
  iconList,
}) => (
  // eslint-disable-next-line react/forbid-component-props
  <Card data-testid={id}>
    <div className={styles.contentWrapper}>
      <CardHeader
        title={title}
        icon={
          <FontAwesomeV6Icon
            className={classNames(styles.cardIcon, 'fa-2x')}
            iconName={icon}
            aria-hidden
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
                  aria-hidden
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
        {href ? (
          <MuiButton
            variant={variant}
            color={variant === 'contained' ? 'primary' : 'secondary'}
            size="medium"
            className={styles.button}
            href={href}
          >
            {buttonText}
          </MuiButton>
        ) : (
          <MuiButton
            variant={variant}
            color={variant === 'contained' ? 'primary' : 'secondary'}
            size="medium"
            className={styles.button}
            onClick={onClick}
            type="button"
          >
            {buttonText}
          </MuiButton>
        )}
      </CardActions>
    </div>
  </Card>
);

export default AccountCard;
