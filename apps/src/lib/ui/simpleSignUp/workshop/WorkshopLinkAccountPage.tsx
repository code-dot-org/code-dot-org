import React from 'react';

import styles from '../link-account.module.scss';

import WorkshopNewAccountCard from './WorkshopNewAccountCard';
// import LtiExistingAccountCard from './LtiExistingAccountCard';
import WorkshopContinueAccountCard from './WorkshopContinueAccountCard';
import WorkshopWelcomeBanner from './WorkshopWelcomeBanner';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';
import Link from '@cdo/apps/componentLibrary/link';

const WorkshopLinkAccountPage: React.FunctionComponent<{
  newCtaType: string;
  emailAddress: string;
  newAccountUrl: string;
  continueAccountUrl: string;
}> = ({newCtaType, emailAddress, newAccountUrl, continueAccountUrl}) => {
  const handleCancel = () => {
    newCtaType === 'new'
      ? navigateToHref(`/users/cancel`)
      : navigateToHref(`/users/sign_out`);
  };

  return (
    <main>
      <div className={styles.contentContainer}>
        <WorkshopWelcomeBanner />
        <div className={styles.cardContainer}>
          {newCtaType === 'new' ? (
            <WorkshopNewAccountCard
              emailAddress={emailAddress}
              newAccountUrl={newAccountUrl}
            />
          ) : (
            <WorkshopContinueAccountCard
              continueAccountUrl={continueAccountUrl}
            />
          )}
          {/* <LtiExistingAccountCard /> */}
        </div>
        <div className={styles.cancelButtonContainer}>
          <Link text={i18n.cancel()} href={`#`} onClick={handleCancel} />
        </div>
      </div>
    </main>
  );
};

export default WorkshopLinkAccountPage;
