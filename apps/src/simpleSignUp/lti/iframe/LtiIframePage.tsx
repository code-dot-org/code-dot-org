import {Typography, Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import i18n from '@cdo/locale';

import styles from './styles.module.scss';

export const LTI_IFRAME_TIMEOUT_MILLISECONDS = 300_000; // Time out after 5 minutes

interface LtiIframePageProps {
  logoUrl: string;
  authUrl: string;
}

export const LtiIframePage = ({logoUrl, authUrl}: LtiIframePageProps) => {
  const [callToActionDisabled, setCallToActionDisabled] =
    useState<boolean>(false);
  const [textContent, setTextContent] = useState(i18n.ltiIframeDescription());

  const handleCallToAction = () => {
    window.open(authUrl, '_blank');
    setCallToActionDisabled(true);
    setTextContent(i18n.ltiIframeRefresh());
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!callToActionDisabled) {
        setCallToActionDisabled(true);
        setTextContent(i18n.ltiIframeTimedOut());
      }
    }, LTI_IFRAME_TIMEOUT_MILLISECONDS);

    return () => clearTimeout(timer);
  }, [callToActionDisabled]);

  return (
    <main className={styles.mainContentContainer}>
      <div className={styles.mainContent}>
        <img className={styles.logo} src={logoUrl} alt={i18n.codeLogo()} />
        <Typography className={styles.description} variant="body1" gutterBottom>
          {textContent}
        </Typography>
        <div>
          <MuiButton
            variant="contained"
            color="primary"
            size="large"
            disabled={callToActionDisabled}
            className={styles.callToAction}
            onClick={handleCallToAction}
            type="button"
          >
            {i18n.ltiIframeCallToAction()}
          </MuiButton>
        </div>
      </div>
    </main>
  );
};

export default LtiIframePage;
