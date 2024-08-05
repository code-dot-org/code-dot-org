import React from 'react';

import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import AccountCard from '@cdo/apps/templates/account/AccountCard';
import i18n from '@cdo/locale';

import styles from '../link-account.module.scss';

const WorkshopStudentEnrollPage: React.FunctionComponent = () => (
  <main>
    <div className={styles.contentContainer}>
      <AccountBanner
        heading={i18n.accountNeedTeacherAccountWelcomeBannerHeaderLabel()}
        desc={i18n.accountNeedTeacherAccountWelcomeBannerHeaderDesc()}
      />
      <div className={styles.cardContainer}>
        <AccountCard
          id={'keep-student-account-card'}
          icon={'child'}
          title={i18n.accountKeepStudentAccountCardTitle()}
          content={i18n.accountKeepStudentAccountCardContent()}
          buttonText={i18n.accountKeepStudentAccountCardButton()}
          buttonType="secondary"
          href="/home"
        />
        <AccountCard
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
