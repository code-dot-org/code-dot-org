import styles from '../../../link-account.module.scss';
import React, {useContext} from 'react';

import NewAccountCard from './cards/NewAccountCard';
import ExistingAccountCard from './cards/ExistingAccountCard';
import ContinueCard from './cards/ContinueCard';
import WelcomeBanner from './WelcomeBanner';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';
import Link from '@cdo/apps/componentLibrary/link';
import {LtiProviderContext} from '@cdo/apps/lib/ui/simpleSignUp/lti/link/LtiLinkAccountPage/context';

const LtiLinkAccountPage = () => {
  const {newCtaType} = useContext(LtiProviderContext)!;
  const handleCancel = () => {
    newCtaType === 'new'
      ? navigateToHref(`/users/cancel`)
      : navigateToHref(`/users/sign_out`);
  };

  return (
    <main>
      <div className={styles.contentContainer}>
        <WelcomeBanner />
        <div className={styles.cardContainer}>
          {newCtaType === 'new' ? <NewAccountCard /> : <ContinueCard />}
          <ExistingAccountCard />
        </div>
        <div className={styles.cancelButtonContainer}>
          <Link text={i18n.cancel()} href={`#`} onClick={handleCancel} />
        </div>
      </div>
    </main>
  );
};

export default LtiLinkAccountPage;
