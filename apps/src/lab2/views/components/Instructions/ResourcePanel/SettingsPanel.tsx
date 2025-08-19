import React from 'react';

import {getLocaleOptions} from '@cdo/apps/lab2/projects/utils';
import {Setting} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';

interface SettingsPanelProps {
  settings: Setting[];
}

const SettingsPanel: React.FunctionComponent<SettingsPanelProps> = ({
  settings,
}) => {
  const localeOptions = getLocaleOptions();
  console.log({localeOptions});

  return <div>Settings</div>;
};

export default SettingsPanel;
