import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import React, {useContext} from 'react';
import i18n from '@cdo/locale';

import codeLogo from '../../../assets/codeLogo.svg';
import {LtiProviderContext} from '../context';

const WelcomeBanner = () => {
  const {ltiProviderName} = useContext(LtiProviderContext)!;

  return (
    <div className={styles.welcomeContainer}>
      <img className={styles.cdoLogo} src={codeLogo} alt={i18n.codeLogo()} />

      <div className={styles.titleContainer}>
        <Typography semanticTag={'h1'} visualAppearance={'heading-xxl'}>
          {i18n.ltiLinkAccountWelcomeBannerHeaderLabel()}
        </Typography>
        <Typography
          className={styles.titleDesc}
          semanticTag={'p'}
          visualAppearance={'body-two'}
        >
          {i18n.ltiLinkAccountWelcomeBannerContent({
            providerName: ltiProviderName,
          })}
        </Typography>
      </div>
    </div>
  );
};

export default WelcomeBanner;
