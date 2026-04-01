import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';
import './style.scss';

const RegionResetButton: React.FC = () => {
  const reportEvent = (eventName: string) => {
    analyticsReporter.sendEvent(eventName, {});
  };

  const handleClick = () => {
    reportEvent(EVENTS.GLOBAL_EDITION_REGION_RESET_BUTTON_CLICKED);
  };

  return (
    <form action={window.location.href} method="post" acceptCharset="UTF-8">
      <input type="hidden" name="ge_region" />
      <MuiButton
        variant="outlined"
        color="white"
        size="small"
        className="no-mc"
        id="global-edition-region-reset"
        onClick={handleClick}
        type="submit"
      >
        {i18n.globalEdition_regionResetButton_text()}
      </MuiButton>
    </form>
  );
};

export default RegionResetButton;
