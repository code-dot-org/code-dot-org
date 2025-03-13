import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import {AppName, ExemplarSettings} from '../../types';

import moduleStyles from './exemplar-settings.module.scss';

interface ExemplarSettingsProps {
  exemplarDefined: boolean;
  exemplarSettings: ExemplarSettings;
  onChange: (updatedFields: Partial<ExemplarSettings>) => void;
  appName: AppName;
}

const defaultExemplarPlayerSettings: Partial<ExemplarSettings> = {
  playerTitle: 'Example',
  playerEnabled: false,
};

const ExemplarPlayer: React.FunctionComponent<ExemplarSettingsProps> = ({
  exemplarSettings,
  exemplarDefined,
  appName,
  onChange,
}) => {
  const appPlayerSupported = appName === 'music';

  if (!appPlayerSupported) {
    return (
      <div>
        {`Exemplar player settings are not available for ${appName}. Contact the engineering team for further details.`}
      </div>
    );
  }

  return (
    <div className={moduleStyles.section}>
      <CollapsibleSection
        initiallyCollapsed={false}
        headerContent="Exemplar Player"
      >
        <div className={moduleStyles.row}>
          <BodyThreeText>
            A sound player can be added below the instructions, which will play
            the song that is the exemplar for this level.
          </BodyThreeText>
        </div>
        {!exemplarDefined && (
          <div className={moduleStyles.row}>
            <em>This level does not have an exemplar.</em>
          </div>
        )}
        <div className={moduleStyles.row}>
          <label htmlFor="exemplarPlayer" className={moduleStyles.label}>
            Include sound player?
          </label>
          <input
            type="checkbox"
            id="exemplarPlayer"
            name="exemplarPlayer"
            disabled={!exemplarDefined}
            checked={!!exemplarSettings.playerEnabled}
            onChange={newValue => {
              onChange({
                ...defaultExemplarPlayerSettings,
                ...exemplarSettings,
                playerEnabled: newValue.target.checked,
                // Music Lab's exemplar validation requires the player.
                ...(!newValue.target.checked ? {validationEnabled: false} : {}),
              });
            }}
          />
        </div>
        <div className={moduleStyles.row}>
          <label htmlFor="title" className={moduleStyles.label}>
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={moduleStyles.callout}
            value={exemplarSettings.playerTitle}
            disabled={!exemplarDefined || !exemplarSettings.playerEnabled}
            onChange={newValue => {
              onChange({
                ...defaultExemplarPlayerSettings,
                ...exemplarSettings,
                playerTitle: newValue.target.value,
              });
            }}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ExemplarPlayer;
