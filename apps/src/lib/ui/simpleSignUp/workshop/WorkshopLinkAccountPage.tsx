import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import i18n from '@cdo/locale';

import WorkshopContinueAccountCard from './WorkshopContinueAccountCard';
import WorkshopExistingAccountCard from './WorkshopExistingAccountCard';
import WorkshopNewAccountCard from './WorkshopNewAccountCard';
import WorkshopWelcomeBanner from './WorkshopWelcomeBanner';

import styles from '../link-account.module.scss';

const WorkshopLinkAccountPage: React.FunctionComponent<{
  newCtaType: string;
  emailAddress: string;
  newAccountUrl: string;
  continueAccountUrl: string;
  existingAccountUrlHref: string;
}> = ({
  newCtaType,
  emailAddress,
  newAccountUrl,
  continueAccountUrl,
  existingAccountUrlHref,
}) => {
  const cancelHref = newCtaType === 'new' ? '/users/cancel' : '/users/sign_out';

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
          <WorkshopExistingAccountCard
            existingAccountUrlHref={existingAccountUrlHref}
          />
        </div>
        <div className={styles.cancelButtonContainer}>
          <Link text={i18n.cancel()} href={cancelHref} />
        </div>
      </div>
    </main>
  );
};

export default WorkshopLinkAccountPage;
