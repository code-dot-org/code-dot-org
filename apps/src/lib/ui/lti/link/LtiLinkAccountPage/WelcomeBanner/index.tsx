import React, {useCallback, useContext} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import i18n from '@cdo/locale';

import canvas from '../../../assets/canvas.svg';
import codeLogo from '../../../assets/codeLogo.svg';
import schoology from '../../../assets/schoology.svg';
import {LtiProviderContext} from '../context';

import styles from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/link-account.module.scss';

const WelcomeBanner = () => {
  const {ltiProvider, ltiProviderName} = useContext(LtiProviderContext)!;

  const getLtiProviderIcon = useCallback(() => {
    switch (ltiProvider) {
      case 'canvas_cloud':
      case 'canvas_beta_cloud':
      case 'canvas_test_cloud':
        return canvas;
      case 'schoology':
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
          <img src={ltiProviderIcon} alt={ltiProviderName} />
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
        {i18n.ltiLinkAccountWelcomeBannerContent({
          providerName: ltiProviderName,
        })}
      </Typography>
    </div>
  );
};

export default WelcomeBanner;
