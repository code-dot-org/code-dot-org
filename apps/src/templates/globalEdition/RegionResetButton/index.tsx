import React from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import './style.scss';

const RegionResetButton: React.FC = () => {
  const reportEvent = (eventName: string) => {
    analyticsReporter.sendEvent(eventName, {}, PLATFORMS.STATSIG);
  };

  const handleClick = () => {
    reportEvent(EVENTS.GLOBAL_EDITION_REGION_RESET_BUTTON_CLICKED);
  };

  return (
    <form action={window.location.href} method="post" acceptCharset="UTF-8">
      <input type="hidden" name="ge_region" />
      <Button
        id="global-edition-region-reset"
        className="no-mc"
        text={i18n.globalEdition_regionResetButton_text()}
        buttonTagTypeAttribute="submit"
        type="secondary"
        color="white"
        size="s"
        onClick={handleClick}
      />
    </form>
  );
};

export default RegionResetButton;
