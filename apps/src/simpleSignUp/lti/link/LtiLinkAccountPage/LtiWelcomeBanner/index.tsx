import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useCallback, useContext} from 'react';

import codeLogo from '@cdo/apps/templates/images/codeLogo.png';
import i18n from '@cdo/locale';

import canvas from '../../../assets/canvas.svg';
import classlink from '../../../assets/classlink.png';
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
      case 'classlink':
        return classlink;
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
        <Typography variant="h1" gutterBottom>
          {i18n.ltiLinkAccountWelcomeBannerHeaderLabel()}
        </Typography>
        <Typography className={styles.titleDesc} variant="body2" gutterBottom>
          {i18n.ltiLinkAccountWelcomeBannerContent({
            providerName: ltiProviderName,
          })}
        </Typography>
      </div>
    </div>
  );
};

export default LtiWelcomeBanner;
