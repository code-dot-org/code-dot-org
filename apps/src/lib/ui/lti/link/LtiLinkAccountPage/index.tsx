import styles from './link-account.module.scss';
import React from 'react';

import NewAccountCard from './cards/NewAccountCard';
import ExistingAccountCard from './cards/ExistingAccountCard';
import WelcomeBanner from './WelcomeBanner';

const LtiLinkAccountPage = () => {
  return (
    <main className={styles.mainContainer}>
      <WelcomeBanner />
      <div className={styles.cardContainer}>
        <NewAccountCard />
        <ExistingAccountCard />
      </div>
    </main>
  );
};

export default LtiLinkAccountPage;
