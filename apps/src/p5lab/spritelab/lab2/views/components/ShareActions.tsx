import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {navigateToHref} from '@cdo/apps/utils';
import commonI18n from '@cdo/locale';

type Destination = 'view' | 'new';

/** The buttons under a shared project's game. */
const ShareActions: React.FunctionComponent = () => {
  // The next page can take a moment to arrive, so the pressed button shows
  // it is working.
  const [leavingFor, setLeavingFor] = useState<Destination | null>(null);
  // The browser's Back button can bring this page back as it was left.
  useEffect(() => {
    const reset = () => setLeavingFor(null);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const leaveFor = (destination: Destination) => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (!projectManager) {
      return;
    }
    setLeavingFor(destination);
    try {
      if (destination === 'view') {
        projectManager.redirectToView();
      } else {
        // A new, empty project, not a remix of this one.
        navigateToHref(`/projects/${projectManager.getProjectType()}/new`);
      }
    } catch (e) {
      console.error('Leaving the share page failed:', e);
      setLeavingFor(null);
    }
  };
  const iconFor = (
    destination: Destination,
    icon: React.ReactElement
  ): React.ReactElement =>
    leavingFor === destination ? (
      <FontAwesomeV6Icon
        iconStyle="solid"
        iconName="spinner"
        animationType="spin"
      />
    ) : (
      icon
    );

  return (
    <>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        disabled={!!leavingFor}
        startIcon={iconFor(
          'view',
          <FontAwesomeV6Icon iconStyle="solid" iconName="code" />
        )}
        onClick={() => leaveFor('view')}
      >
        {commonI18n.viewCode()}
      </MuiButton>
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        disabled={!!leavingFor}
        startIcon={iconFor(
          'new',
          <FontAwesomeV6Icon iconStyle="regular" iconName="pen-to-square" />
        )}
        onClick={() => leaveFor('new')}
      >
        {commonI18n.makeMyOwn()}
      </MuiButton>
      <MuiButton
        variant="text"
        color="secondary"
        size="small"
        startIcon={
          <FontAwesomeV6Icon
            iconStyle="regular"
            iconName="message-exclamation"
          />
        }
        onClick={() => window.open('/report_abuse', '_blank')}
      >
        Report abuse
      </MuiButton>
    </>
  );
};

export default ShareActions;
