import React, {useContext} from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import {LtiProviderContext} from '@cdo/apps/lib/ui/simpleSignUp/lti/link/LtiLinkAccountPage/context';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import LtiContinueAccountCard from './cards/LtiContinueAccountCard';
import LtiExistingAccountCard from './cards/LtiExistingAccountCard';
import LtiNewAccountCard from './cards/LtiNewAccountCard';
import LtiWelcomeBanner from './LtiWelcomeBanner';

import styles from '../../../link-account.module.scss';

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
        <LtiWelcomeBanner />
        <div className={styles.cardContainer}>
          {newCtaType === 'new' ? (
            <LtiNewAccountCard />
          ) : (
            <LtiContinueAccountCard />
          )}
          <LtiExistingAccountCard />
        </div>
        <div className={styles.cancelButtonContainer}>
          <Link text={i18n.cancel()} href={`#`} onClick={handleCancel} />
        </div>
      </div>
    </main>
  );
};

export default LtiLinkAccountPage;
