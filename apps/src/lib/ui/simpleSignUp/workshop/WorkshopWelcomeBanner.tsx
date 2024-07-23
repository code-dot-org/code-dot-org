import React from 'react';

import {BodyTwoText, Heading1} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import codeLogo from '../assets/codeLogo.svg';

import styles from '../link-account.module.scss';

const WorkshopWelcomeBanner = () => (
  <div className={styles.welcomeContainer}>
    <div className={styles.welcomeIconContainer}>
      <img src={codeLogo} alt={i18n.codeLogo()} />
    </div>

    <div className={styles.titleContainer}>
      <Heading1>{i18n.accountWelcomeBannerHeaderLabel()}</Heading1>
      <BodyTwoText className={styles.titleDesc}>
        {i18n.accountWelcomeBannerContentWorkshopEnroll()}
      </BodyTwoText>
    </div>
  </div>
);

export default WorkshopWelcomeBanner;
