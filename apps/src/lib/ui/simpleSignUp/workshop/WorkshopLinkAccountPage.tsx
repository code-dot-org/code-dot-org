import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import i18n from '@cdo/locale';

import WorkshopExistingAccountCard from './WorkshopExistingAccountCard';
import WorkshopNewAccountCard from './WorkshopNewAccountCard';
import WorkshopWelcomeBanner from './WorkshopWelcomeBanner';

import styles from '../link-account.module.scss';

const WorkshopLinkAccountPage: React.FunctionComponent<{
  newAccountUrl: string;
  existingAccountUrl: string;
}> = ({newAccountUrl, existingAccountUrl}) => (
  <main>
    <div className={styles.contentContainer}>
      <WorkshopWelcomeBanner />
      <div className={styles.cardContainer}>
        <WorkshopNewAccountCard newAccountUrl={newAccountUrl} />
        <WorkshopExistingAccountCard existingAccountUrl={existingAccountUrl} />
      </div>
      <div className={styles.cancelButtonContainer}>
        <Link text={i18n.cancel()} href={'/users/cancel'} />
      </div>
    </div>
  </main>
);

export default WorkshopLinkAccountPage;
