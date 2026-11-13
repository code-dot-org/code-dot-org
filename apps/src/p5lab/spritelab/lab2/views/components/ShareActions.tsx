import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import commonI18n from '@cdo/locale';

type Destination = 'view' | 'remix';

/** What a visitor to a shared project can do besides play it: see how it
    was made, or start a copy of their own. */
const ShareActions: React.FunctionComponent = () => {
  // Making the copy can take the server a few seconds before the page
  // changes, so the pressed button shows it is working.
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
        projectManager.redirectToRemix();
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
          'remix',
          <FontAwesomeV6Icon iconStyle="regular" iconName="pen-to-square" />
        )}
        onClick={() => leaveFor('remix')}
      >
        {commonI18n.makeMyOwn()}
      </MuiButton>
    </>
  );
};

export default ShareActions;
