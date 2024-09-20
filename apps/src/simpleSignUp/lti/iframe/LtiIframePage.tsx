import React, {useEffect, useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import Typography from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import styles from './styles.module.scss';

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
    }, 300000); // Time out after 5 minutes

    return () => clearTimeout(timer);
  }, [callToActionDisabled]);

  return (
    <main className={styles.mainContentContainer}>
      <div className={styles.mainContent}>
        <img className={styles.logo} src={logoUrl} alt={i18n.codeLogo()} />
        <Typography
          semanticTag="p"
          visualAppearance="body-one"
          className={styles.description}
        >
          {textContent}
        </Typography>
        <div>
          <Button
            disabled={callToActionDisabled}
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
