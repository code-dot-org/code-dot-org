import React from 'react';

import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import AccountCard from '@cdo/apps/templates/account/AccountCard';
import i18n from '@cdo/locale';

import styles from './style.module.scss';

const StudentUserTypeChangePrompt: React.FunctionComponent<{
  userReturnTo?: string;
}> = ({userReturnTo}) => (
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
          href={`/users/edit${
            userReturnTo
              ? `?user_return_to=${encodeURIComponent(userReturnTo)}`
              : ''
          }#change-user-type-modal-form`}
        />
      </div>
    </div>
  </main>
);

export default StudentUserTypeChangePrompt;
