import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import i18n from '@cdo/locale';

import codeaiLogo from '../images/codeaiLogo.svg';

import styles from './account-components.module.scss';

const AccountBanner: React.FunctionComponent<{
  heading: string;
  desc: string;
  showLogo: boolean;
  className?: string;
  headingComponent?: 'h1' | 'h2';
}> = ({heading, desc, showLogo, className, headingComponent = 'h1'}) => (
  <div className={styles.bannerContainer}>
    {showLogo && (
      <div className={styles.iconContainer}>
        <img src={codeaiLogo} alt={i18n.codeLogo()} />
      </div>
    )}

    <div className={classNames(className, styles.titleContainer)}>
      <Typography component={headingComponent} variant="h1" gutterBottom>
        {heading}
      </Typography>
      <Typography className={styles.titleDesc} variant="body2" gutterBottom>
        {desc}
      </Typography>
    </div>
  </div>
);

export default AccountBanner;
