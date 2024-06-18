import styles from './link-account.module.scss';
import React from 'react';

import NewAccountCard from './cards/NewAccountCard';
import ExistingAccountCard from './cards/ExistingAccountCard';
import WelcomeBanner from './WelcomeBanner';
import {buttonColors, Button} from '@cdo/apps/componentLibrary/button';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';

const LtiLinkAccountPage = () => {
  const handleCancel = () => {
    navigateToHref(`/users/cancel`);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.cancelButtonContainer}>
        <Button
          className={styles.cardSecondaryButton}
          color={buttonColors.white}
          size="l"
          text={i18n.cancel()}
          onClick={handleCancel}
        />
      </div>
      <WelcomeBanner />
      <div className={styles.cardContainer}>
        <NewAccountCard />
        <ExistingAccountCard />
      </div>
    </main>
  );
};

export default LtiLinkAccountPage;
