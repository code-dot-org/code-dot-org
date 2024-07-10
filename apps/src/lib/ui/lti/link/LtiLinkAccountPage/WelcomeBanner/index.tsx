import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import React, {useContext} from 'react';
import i18n from '@cdo/locale';

import codeLogo from '../../../assets/codeLogo.svg';
import {LtiProviderContext} from '../context';

const WelcomeBanner = () => {
  const {ltiProviderName} = useContext(LtiProviderContext)!;
  const isLMS = true;

  return (
    <div className={styles.welcomeContainer}>
      <img className={styles.cdoLogo} src={codeLogo} alt={i18n.codeLogo()} />

      <div className={styles.titleContainer}>
        <Typography semanticTag={'h1'} visualAppearance={'heading-xxl'}>
          {isLMS
            ? i18n.ltiLinkAccountWelcomeBannerHeaderLabel()
            : i18n.nonLMSLinkAccountWelcomeBannerHeaderLabel()}
        </Typography>
        <Typography
          className={styles.titleDesc}
          semanticTag={'p'}
          visualAppearance={'body-two'}
        >
          {isLMS
            ? i18n.ltiLinkAccountWelcomeBannerContent({
                providerName: ltiProviderName,
              })
            : i18n.nonLMSLinkAccountWelcomeBannerContentWorkshopEnroll()}
        </Typography>
      </div>
    </div>
  );
};

export default WelcomeBanner;
