import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import React from 'react';
import i18n from '@cdo/locale';

import styles from '../link-account.module.scss';
import codeLogo from '../assets/codeLogo.svg';

const WorkshopWelcomeBanner = () => {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeIconContainer}>
        <img src={codeLogo} alt={i18n.codeLogo()} />
      </div>

      <div className={styles.titleContainer}>
        <Typography semanticTag={'h1'} visualAppearance={'heading-xxl'}>
          {i18n.accountWelcomeBannerHeaderLabel()}
        </Typography>
        <Typography
          className={styles.titleDesc}
          semanticTag={'p'}
          visualAppearance={'body-two'}
        >
          {i18n.accountWelcomeBannerContentWorkshopEnroll()}
        </Typography>
      </div>
    </div>
  );
};

export default WorkshopWelcomeBanner;
