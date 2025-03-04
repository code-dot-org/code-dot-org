import React, {useEffect} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import AccountCard from '@cdo/apps/templates/account/AccountCard';
import i18n from '@cdo/locale';

import styles from './join-section-link-account-page.module.scss';

const JoinSectionLinkAccountPage: React.FunctionComponent<{
  sectionCode: string;
}> = ({sectionCode}) => {
  const bannerDesc = sectionCode
    ? i18n.accountNeededJoinSectionWithCodeBannerLabel({sectionCode})
    : i18n.accountNeededJoinSectionWithoutCodeBannerLabel();
  const joinSectionCodeUrlParam = sectionCode ? `/${sectionCode}` : '';
  const signUpJoinSectionUrl = `/users/sign_up/login_type?user_type=student&user_return_to=/join${joinSectionCodeUrlParam}`;
  const signInJoinSectionUrl = `/users/sign_in?user_return_to=/join${joinSectionCodeUrlParam}`;

  useEffect(() => {
    analyticsReporter.sendEvent(
      EVENTS.LINK_ACCOUNT_PAGE_VISITED_EVENT,
      {source: 'join section'},
      PLATFORMS.BOTH
    );
  }, []);

  return (
    <main>
      <div className={styles.contentContainer}>
        <AccountBanner
          heading={i18n.accountWelcomeBannerHeaderLabel()}
          desc={bannerDesc}
          showLogo={true}
        />
        <div className={styles.cardContainer}>
          <AccountCard
            id={'new-account-card'}
            icon={'user-plus'}
            title={i18n.ltiLinkAccountNewAccountCardHeaderLabel()}
            content={i18n.accountNeededJoinSectionCreateAccountCardContent()}
            buttonText={i18n.createAccount()}
            buttonType="secondary"
            href={signUpJoinSectionUrl}
          />
          <AccountCard
            id={'existing-account-card'}
            icon={'user-check'}
            title={i18n.ltiLinkAccountExistingAccountCardHeaderLabel()}
            content={i18n.accountNeededJoinSectionSignInCardContent()}
            buttonText={i18n.ltiLinkAccountExistingAccountCardActionLabel()}
            buttonType="primary"
            href={signInJoinSectionUrl}
          />
        </div>
      </div>
    </main>
  );
};

export default JoinSectionLinkAccountPage;
