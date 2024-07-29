import React, {useCallback, useContext} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import i18n from '@cdo/locale';

import codeLogo from '../../../../assets/codeLogo.svg';
import canvas from '../../../assets/canvas.svg';
import schoology from '../../../assets/schoology.svg';
import {LtiProviderContext} from '../context';

import styles from '../../../../link-account.module.scss';

const LtiWelcomeBanner = () => {
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
        <div className={styles.welcomeIconContainer}>
          <img src={ltiProviderIcon} alt={ltiProviderName} />
          <FontAwesomeV6Icon
            className={styles.exchangeIcon}
            iconName={'exchange'}
          />
          <img src={codeLogo} alt={i18n.codeLogo()} />
        </div>
      )}

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

export default LtiWelcomeBanner;
