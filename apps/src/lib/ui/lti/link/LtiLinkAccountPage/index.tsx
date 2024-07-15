import React, {useContext} from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import {LtiProviderContext} from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/context';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import ContinueCard from './cards/ContinueCard';
import ExistingAccountCard from './cards/ExistingAccountCard';
import NewAccountCard from './cards/NewAccountCard';
import WelcomeBanner from './WelcomeBanner';

import styles from './link-account.module.scss';

const LtiLinkAccountPage = () => {
  const {newCtaType} = useContext(LtiProviderContext)!;
  const handleCancel = () => {
    newCtaType === 'new'
      ? navigateToHref(`/users/cancel`)
      : navigateToHref(`/users/sign_out`);
  };

  return (
    <main className={styles.mainContainer}>
      <WelcomeBanner />
      <div className={styles.cardContainer}>
        {newCtaType === 'new' ? <NewAccountCard /> : <ContinueCard />}
        <ExistingAccountCard />
      </div>
      <div className={styles.cancelButtonContainer}>
        <Link text={i18n.cancel()} href={`#`} onClick={handleCancel} />
      </div>
    </main>
  );
};

export default LtiLinkAccountPage;
