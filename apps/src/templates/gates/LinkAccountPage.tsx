import React, {useEffect} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import AccountCard from '@cdo/apps/templates/account/AccountCard';
import i18n from '@cdo/locale';

import {processAccountUrlParams} from './processAccountUrlParams';

import styles from './gate-pages.module.scss';

const SOURCE_PAGE_TEXT: {
  [key: string]: {
    headerDesc: string;
    newAccountDesc: string;
    existingAccountDesc: string;
  };
} = {
  default: {
    headerDesc: i18n.accountWelcomeBannerDefaultDescription(),
    newAccountDesc: i18n.accountNewAccountCardDefaultDescription(),
    existingAccountDesc: i18n.accountExistingAccountCardDefaultDescription(),
  },
  'workshop enroll': {
    headerDesc: i18n.accountWelcomeBannerContentWorkshopEnroll(),
    newAccountDesc: i18n.accountNewAccountCardContentWorkshopEnroll(),
    existingAccountDesc: i18n.accountExistingAccountCardContentWorkshopEnroll(),
  },
  'join section': {
    headerDesc: i18n.accountNeededJoinSectionWithoutCodeBannerLabel(),
    newAccountDesc: i18n.accountNeededJoinSectionCreateAccountCardContent(),
    existingAccountDesc: i18n.accountNeededJoinSectionSignInCardContent(),
  },
};

const LinkAccountPage: React.FunctionComponent = () => {
  const {sourcePage, returnToUrlParam} = processAccountUrlParams();
  const sourcePageTextKey = Object.keys(SOURCE_PAGE_TEXT).includes(sourcePage)
    ? sourcePage
    : 'default';

  useEffect(() => {
    analyticsReporter.sendEvent(
      EVENTS.LINK_ACCOUNT_PAGE_VISITED_EVENT,
      {source: sourcePage},
      PLATFORMS.BOTH
    );
  }, [sourcePage]);

  return (
    <main>
      <div className={styles.contentContainer}>
        <AccountBanner
          heading={i18n.accountWelcomeBannerHeaderLabel()}
          desc={SOURCE_PAGE_TEXT[sourcePageTextKey].headerDesc}
          showLogo={true}
        />
        <div className={styles.cardContainer}>
          <AccountCard
            id={'new-account-card'}
            icon={'user-plus'}
            title={i18n.ltiLinkAccountNewAccountCardHeaderLabel()}
            content={SOURCE_PAGE_TEXT[sourcePageTextKey].newAccountDesc}
            buttonText={i18n.createAccount()}
            buttonType="secondary"
            href={`/users/sign_up/account_type${returnToUrlParam}`}
          />
          <AccountCard
            id={'existing-account-card'}
            icon={'user-check'}
            title={i18n.ltiLinkAccountExistingAccountCardHeaderLabel()}
            content={SOURCE_PAGE_TEXT[sourcePageTextKey].existingAccountDesc}
            buttonText={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
            buttonType="primary"
            href={`/users/sign_in${returnToUrlParam}`}
          />
        </div>
      </div>
    </main>
  );
};

export default LinkAccountPage;
