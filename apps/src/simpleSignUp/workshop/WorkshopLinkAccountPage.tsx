import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import AccountCard from '@cdo/apps/templates/account/AccountCard';
import i18n from '@cdo/locale';

import styles from '../link-account.module.scss';

const WorkshopLinkAccountPage: React.FunctionComponent<{
  newAccountUrl: string;
  existingAccountUrl: string;
}> = ({newAccountUrl, existingAccountUrl}) => (
  <main>
    <div className={styles.contentContainer}>
      <AccountBanner
        heading={i18n.accountWelcomeBannerHeaderLabel()}
        desc={i18n.accountWelcomeBannerContentWorkshopEnroll()}
        showLogo={true}
      />
      <div className={styles.cardContainer}>
        <AccountCard
          id={'new-account-card'}
          icon={'user-plus'}
          title={i18n.ltiLinkAccountNewAccountCardHeaderLabel()}
          content={i18n.accountNewAccountCardContentWorkshopEnroll()}
          buttonText={i18n.createAccount()}
          buttonType="secondary"
          href={newAccountUrl}
        />
        <AccountCard
          id={'existing-account-card'}
          icon={'user-check'}
          title={i18n.ltiLinkAccountExistingAccountCardHeaderLabel()}
          content={i18n.accountExistingAccountCardContentWorkshopEnroll()}
          buttonText={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
          buttonType="primary"
          href={existingAccountUrl}
        />
      </div>
      <div className={styles.cancelButtonContainer}>
        <Link text={i18n.cancel()} href={'/users/cancel'} />
      </div>
    </div>
  </main>
);

export default WorkshopLinkAccountPage;
