import React from 'react';

import i18n from '@cdo/locale';

import WorkshopAccountBanner from './WorkshopAccountBanner';
import WorkshopAccountCard from './WorkshopAccountCard';

import styles from '../link-account.module.scss';

const WorkshopStudentEnrollPage: React.FunctionComponent = () => (
  <main>
    <div className={styles.contentContainer}>
      <WorkshopAccountBanner
        heading={i18n.accountNeedTeacherAccountWelcomeBannerHeaderLabel()}
        desc={i18n.accountNeedTeacherAccountWelcomeBannerHeaderDesc()}
      />
      <div className={styles.cardContainer}>
        <WorkshopAccountCard
          id={'keep-student-account-card'}
          icon={'child'}
          title={i18n.accountKeepStudentAccountCardTitle()}
          content={i18n.accountKeepStudentAccountCardContent()}
          buttonText={i18n.accountKeepStudentAccountCardButton()}
          buttonType="secondary"
          href="/home"
        />
        <WorkshopAccountCard
          id={'switch-to-teacher-account-card'}
          icon={'chalkboard-user'}
          title={i18n.accountSwitchTeacherAccountCardTitle()}
          content={i18n.accountSwitchTeacherAccountCardContent()}
          buttonText={i18n.accountSwitchTeacherAccountCardButton()}
          buttonType="primary"
          href="/users/edit"
        />
      </div>
    </div>
  </main>
);

export default WorkshopStudentEnrollPage;
