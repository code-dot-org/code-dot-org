import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import commonI18n from '@cdo/locale';

/** What a visitor to a shared project can do besides play it: see how it
    was made, or start a copy of their own. */
const ShareActions: React.FunctionComponent = () => {
  const projectManager = () => Lab2Registry.getInstance().getProjectManager();
  return (
    <>
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="code" />}
        onClick={() => projectManager()?.redirectToView()}
      >
        {commonI18n.viewCode()}
      </MuiButton>
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        startIcon={
          <FontAwesomeV6Icon iconStyle="regular" iconName="pen-to-square" />
        }
        onClick={() => projectManager()?.redirectToRemix()}
      >
        {commonI18n.makeMyOwn()}
      </MuiButton>
    </>
  );
};

export default ShareActions;
