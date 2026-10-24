import {Button} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {ErrorPage} from '@/modules/errors';

import AppHeader from './AppHeader';

import styles from './offline.module.scss';
import screen from './screen.module.scss';

interface OfflineProps {
  onTryAgain: () => void;
  onBack: () => void;
}

/** Shown in place of a studio.code.org page the app could not fetch. */
export default function Offline({onTryAgain, onBack}: OfflineProps) {
  return (
    <div className={screen.page}>
      <AppHeader logoIsHeading />
      <main className={screen.main}>
        <FontAwesomeV6Icon
          iconName="wifi-slash"
          className={styles.icon}
          aria-hidden
        />
        <ErrorPage
          title="No internet connection"
          description="Check that Wi-Fi is on, or ask a grown-up for help."
          actions={
            <div className={screen.actions}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  <FontAwesomeV6Icon
                    iconName="arrow-rotate-right"
                    aria-hidden
                  />
                }
                onClick={onTryAgain}
              >
                Try again
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={<FontAwesomeV6Icon iconName="house" aria-hidden />}
                onClick={onBack}
              >
                Back to curricula
              </Button>
            </div>
          }
        />
      </main>
    </div>
  );
}
