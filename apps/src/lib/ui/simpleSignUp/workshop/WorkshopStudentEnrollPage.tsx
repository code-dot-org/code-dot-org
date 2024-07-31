import React from 'react';

import i18n from '@cdo/locale';

import WorkshopKeepStudentAccountCard from './WorkshopKeepStudentAccountCard';
import WorkshopSwitchToTeacherAccountCard from './WorkshopSwitchToTeacherAccountCard';
import WorkshopWelcomeBanner from './WorkshopWelcomeBanner';

import styles from '../link-account.module.scss';

const WorkshopStudentEnrollPage: React.FunctionComponent = () => (
  <main>
    <div className={styles.contentContainer}>
      <WorkshopWelcomeBanner
        heading={i18n.accountNeedTeacherAccountWelcomeBannerHeaderLabel()}
        desc={i18n.accountNeedTeacherAccountWelcomeBannerHeaderDesc()}
      />
      <div className={styles.cardContainer}>
        <WorkshopKeepStudentAccountCard />
        <WorkshopSwitchToTeacherAccountCard />
      </div>
    </div>
  </main>
);

export default WorkshopStudentEnrollPage;
