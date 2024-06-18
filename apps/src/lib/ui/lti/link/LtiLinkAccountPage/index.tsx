import styles from './link-account.module.scss';
import React from 'react';

import NewAccountCard from './cards/NewAccountCard';
import ExistingAccountCard from './cards/ExistingAccountCard';
import WelcomeBanner from './WelcomeBanner';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';
import Link from '@cdo/apps/componentLibrary/link';

const LtiLinkAccountPage = () => {
  const handleCancel = () => {
    navigateToHref(`/users/cancel`);
  };

  return (
    <main className={styles.mainContainer}>
      <WelcomeBanner />
      <div className={styles.cardContainer}>
        <NewAccountCard />
        <ExistingAccountCard />
      </div>
      <div className={styles.cancelButtonContainer}>
        <Link text={i18n.cancel()} href={`#`} onClick={handleCancel} />
      </div>
    </main>
  );
};

export default LtiLinkAccountPage;
