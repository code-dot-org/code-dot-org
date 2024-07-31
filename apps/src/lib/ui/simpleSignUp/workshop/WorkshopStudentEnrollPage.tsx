import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import i18n from '@cdo/locale';

import WorkshopExistingAccountCard from './WorkshopExistingAccountCard';
import WorkshopKeepStudentAccountCard from './WorkshopKeepStudentAccountCard';
import WorkshopWelcomeBanner from './WorkshopWelcomeBanner';

import styles from '../link-account.module.scss';

const WorkshopStudentEnrollPage: React.FunctionComponent<{
  cancelUrl: string;
  switchAccountTypeUrl: string;
}> = ({cancelUrl, switchAccountTypeUrl}) => (
  <main>
    <div className={styles.contentContainer}>
      <WorkshopWelcomeBanner
        heading={i18n.accountNeedTeacherAccountWelcomeBannerHeaderLabel()}
        desc={i18n.accountNeedTeacherAccountWelcomeBannerHeaderDesc()}
      />
      <div className={styles.cardContainer}>
        <WorkshopKeepStudentAccountCard cancelUrl={cancelUrl} />
        <WorkshopExistingAccountCard
          existingAccountUrl={switchAccountTypeUrl}
        />
      </div>
      <div className={styles.cancelButtonContainer}>
        <Link text={i18n.cancel()} href={'/users/cancel'} />
      </div>
    </div>
  </main>
);

export default WorkshopStudentEnrollPage;
