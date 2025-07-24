import React, {useEffect} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import AccountCard from '@cdo/apps/templates/account/AccountCard';
import i18n from '@cdo/locale';

import {processAccountUrlParams} from './processAccountUrlParams';

import styles from './gate-pages.module.scss';

const TeacherAccountRequiredPage: React.FunctionComponent = () => {
  const {sourcePage, returnToUrlParam} = processAccountUrlParams();

  useEffect(() => {
    analyticsReporter.sendEvent(
      EVENTS.UPGRADE_TO_TEACHER_ACCOUNT_PAGE_VISITED_EVENT,
      {source: sourcePage},
      PLATFORMS.BOTH
    );
  }, [sourcePage]);

  return (
    <main>
      <div className={styles.contentContainer}>
        <AccountBanner
          heading={i18n.accountNeedTeacherAccountWelcomeBannerHeaderLabel()}
          desc={i18n.accountNeedTeacherAccountWelcomeBannerHeaderDescGeneric()}
          showLogo={true}
        />
        <div className={styles.cardContainer}>
          <AccountCard
            id={'keep-student-account-card'}
            icon={'child'}
            title={i18n.accountKeepStudentAccountCardTitle()}
            content={i18n.accountKeepStudentAccountCardContentGeneric()}
            buttonText={i18n.accountKeepStudentAccountCardButton()}
            buttonType="secondary"
            href="/home"
          />
          <AccountCard
            id={'switch-to-teacher-account-card'}
            icon={'chalkboard-user'}
            title={i18n.accountSwitchTeacherAccountCardTitle()}
            content={i18n.accountSwitchTeacherAccountCardContentGeneric()}
            buttonText={i18n.accountSwitchTeacherAccountCardButton()}
            buttonType="primary"
            href={`/users/edit${returnToUrlParam}#change-user-type-modal-form`}
          />
        </div>
      </div>
    </main>
  );
};

export default TeacherAccountRequiredPage;
