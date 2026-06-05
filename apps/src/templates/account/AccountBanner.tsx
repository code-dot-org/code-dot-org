import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import i18n from '@cdo/locale';

import codeLogo from '../images/codeLogo.png';

import styles from './account-components.module.scss';

const AccountBanner: React.FunctionComponent<{
  heading: string;
  desc: string;
  showLogo: boolean;
  className?: string;
}> = ({heading, desc, showLogo, className}) => (
  <div className={styles.bannerContainer}>
    {showLogo && (
      <div className={styles.iconContainer}>
        <img src={codeLogo} alt={i18n.codeLogo()} />
      </div>
    )}

    <div className={classNames(className, styles.titleContainer)}>
      <Typography variant="h1" gutterBottom>
        {heading}
      </Typography>
      <Typography className={styles.titleDesc} variant="body2" gutterBottom>
        {desc}
      </Typography>
    </div>
  </div>
);

export default AccountBanner;
