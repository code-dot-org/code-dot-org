import React from 'react';

import locale from '@cdo/apps/signup/locale';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';

import AccountCard from '../templates/account/AccountCard';

import style from './accountType.module.scss';

const AccountType: React.FunctionComponent = () => {
  return (
    <main className={style.wrapper}>
      <div className={style.contentContainer}>
        <AccountBanner
          heading={locale.create_your_free_account()}
          desc={locale.create_your_free_account_desc()}
          showLogo={false}
        />
        <div className={style.cardWrapper}>
          <AccountCard
            id={'student-card'}
            icon={'child-reaching'}
            title={locale.im_a_student()}
            content={locale.explore_courses_and_activities()}
            buttonText={locale.sign_up_as_a_student()}
            buttonType="primary"
            href="#"
            iconList={[
              locale.save_projects_and_progress(),
              locale.join_classroom_section(),
            ]}
          />
          <AccountCard
            id={'teacher-card'}
            icon={'person-chalkboard'}
            title={locale.im_a_teacher()}
            content={locale.all_student_account_features()}
            buttonText={locale.sign_up_as_a_teacher()}
            buttonType="primary"
            href="#"
            iconList={[
              locale.create_classroom_sections(),
              locale.track_student_progress(),
              locale.access_assessments(),
              locale.enroll_in_pl(),
            ]}
          />
        </div>
      </div>
    </main>
  );
};

export default AccountType;
