import React from 'react';

import AccountBanner from '@cdo/apps/templates/account/AccountBanner';

import AccountCard from '../templates/account/AccountCard';
// import i18n from '@cdo/locale';

import styles from './accountType.module.scss';

// import i18n from '@cdo/locale';

const AccountType: React.FunctionComponent = () => {
  return (
    <main className={styles.wrapper}>
      <div className={styles.contentContainer}>
        <AccountBanner
          heading="Create your free account"
          desc="Start creating your free account by selecting the account type that best matches your needs."
          showLogo={false}
        />
        <div className={styles.cardContainer}>
          <AccountCard
            id={'student-card'}
            icon={'child-reaching'}
            title="I'm a Student"
            content="Explore our courses and activities, plus:"
            buttonText="Sign up as a student"
            buttonType="primary"
            href="#"
          />
          <AccountCard
            id={'teacher-card'}
            icon={'person-chalkboard'}
            title="I'm a Teacher"
            content="All student account features, plus:"
            buttonText="Sign up as a teacher"
            buttonType="primary"
            href="#"
          />
        </div>
      </div>
    </main>
  );
};

export default AccountType;
