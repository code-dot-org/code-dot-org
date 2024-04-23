import Typography from '@cdo/apps/componentLibrary/typography';
import React from 'react';
import {Button} from '@cdo/apps/componentLibrary/button';
import i18n from '@cdo/locale';
import styles from './styles.module.scss';

interface LtiIframePageProps {
  logoUrl: string;
  authUrl: string;
}

export const LtiIframePage = ({logoUrl, authUrl}: LtiIframePageProps) => {
  const handleCallToAction = () => {
    window.open(authUrl, '_blank');
  };

  return (
    <main className={styles.mainContentContainer}>
      <div className={styles.mainContent}>
        <img className={styles.logo} src={logoUrl} alt={i18n.codeLogo()} />
        <div className={styles.description}>
          <Typography semanticTag="h1" visualAppearance="heading-xxl">
            {i18n.ltiIframeDescription()}
          </Typography>
        </div>
        <div>
          <Button
            className={styles.callToAction}
            onClick={handleCallToAction}
            size="l"
            text={i18n.ltiIframeCallToAction()}
          />
        </div>
      </div>
    </main>
  );
};

export default LtiIframePage;
