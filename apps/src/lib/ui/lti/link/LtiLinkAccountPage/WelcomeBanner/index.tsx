import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import React, {useCallback, useContext} from 'react';
import i18n from '@cdo/locale';

import canvas from '../../../assets/canvas.svg';
import schoology from '../../../assets/schoology.svg';
import codeLogo from '../../../assets/codeLogo.svg';
import {LtiProviderContext} from '../context';

const WelcomeBanner = () => {
  const {ltiProvider} = useContext(LtiProviderContext)!;

  const getLtiProviderIcon = useCallback(() => {
    switch (ltiProvider) {
      case 'Canvas':
        return canvas;
      case 'Schoology':
        return schoology;
      default:
        return undefined;
    }
  }, [ltiProvider]);

  const ltiProviderIcon = getLtiProviderIcon();

  return (
    <div className={styles.welcomeContainer}>
      {ltiProviderIcon && (
        <div className={styles.welcomeBannerContainer}>
          <img src={ltiProviderIcon} alt={ltiProvider} />
          <FontAwesomeV6Icon
            className={styles.exchangeIcon}
            iconName={'exchange'}
          />
          <img src={codeLogo} alt={i18n.codeLogo()} />
        </div>
      )}

      <Typography semanticTag={'h1'} visualAppearance={'heading-xxl'}>
        {i18n.ltiLinkAccountWelcomeBannerHeaderLabel()}
      </Typography>

      <Typography semanticTag={'p'} visualAppearance={'body-two'}>
        {i18n.ltiLinkAccountWelcomeBannerContent({providerName: ltiProvider})}
      </Typography>
    </div>
  );
};

export default WelcomeBanner;
