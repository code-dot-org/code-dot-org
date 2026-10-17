import {Theme} from '@code-dot-org/component-library/common/contexts';
import React, {useEffect, useState} from 'react';

import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import CopyrightButton from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/CopyrightButton';
import ResourcePanelExtraLinks from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/ResourcePanelExtraLinks';
import setFooterVisibility from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/setFooterVisibility';
import SettingsPanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/SettingsPanel';
import {Setting} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/types';
import {useExtraLinksButtonContext} from '@cdo/apps/lab2/views/LabViewsRenderer';
import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface ToolButtonsProps {
  levelId: number;
  appName: string;
  theme: Theme;
  settings: Setting[];
  /** Absent where the project cannot be started over. */
  onStartOver?: () => void;
}

/**
 * The resource rail's buttons, in the scene row instead (?rail=bar): extra
 * links, Start Over, copyright and settings, whose panel drops from its
 * button.
 */
const ToolButtons: React.FunctionComponent<ToolButtonsProps> = ({
  levelId,
  appName,
  theme,
  settings,
  onStartOver,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The page footer's language and copyright are here now, and so are the
  // extra links: hide the footer and the floating Extra Links button while
  // these buttons stand in for the rail, as the rail does.
  const {setShowExtraLinksButton} = useExtraLinksButtonContext();
  useEffect(() => {
    setFooterVisibility(false);
    setShowExtraLinksButton(false);
    return () => {
      setFooterVisibility(true);
      setShowExtraLinksButton(true);
    };
  }, [setShowExtraLinksButton]);
  return (
    <div className={moduleStyles.toolButtons}>
      <ResourcePanelExtraLinks levelId={levelId} theme={theme} />
      {onStartOver && (
        <IconButtonWithTooltip
          id="start-over"
          label="Start Over"
          icon={{iconName: 'refresh', iconStyle: 'solid'}}
          variant="text"
          color="tertiary"
          tooltipDirection="onBottom"
          onClick={onStartOver}
          theme={theme}
          size="small"
        />
      )}
      <CopyrightButton theme={theme} />
      <div className={moduleStyles.toolSettings}>
        <IconButtonWithTooltip
          id="settings"
          label={commonI18n.settings()}
          icon={{iconName: 'gear'}}
          variant="text"
          color="tertiary"
          tooltipDirection="onBottom"
          onClick={() => setSettingsOpen(open => !open)}
          theme={theme}
          size="small"
        />
        {settingsOpen && (
          <div className={moduleStyles.toolSettingsPanel}>
            <SettingsPanel
              settings={settings}
              closePanel={() => setSettingsOpen(false)}
              appName={appName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolButtons;
