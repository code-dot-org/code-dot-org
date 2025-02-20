import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import {AppName} from '../../types';

import moduleStyles from '../validations/edit-validations.module.scss';

const AppSupport: {[key in AppName]?: boolean} = {
  music: true,
};

interface ExemplarPlayerSettings {
  enabled: boolean;
  title?: string;
}
interface ExemplarPlayerSettingsProps {
  initialExemplarPlayer: ExemplarPlayerSettings;
  exemplarDefined: boolean;
  appName: AppName;
}

const ExemplarPlayerSettings: React.FunctionComponent<
  ExemplarPlayerSettingsProps
> = ({initialExemplarPlayer, exemplarDefined, appName}) => {
  const [exemplarPlayerSettings, setExemplarPlayerSettings] =
    useState<ExemplarPlayerSettings>(initialExemplarPlayer);

  const appSupported = AppSupport[appName];

  if (!appSupported) {
    return (
      <div>
        {`Exemplar player is not available for ${appName}. Contact the engineering team for further details.`}
      </div>
    );
  }

  return (
    <div>
      <input
        type="hidden"
        id="level_exemplar_player"
        name="level[exemplar_player]"
        value={JSON.stringify(exemplarPlayerSettings)}
      />

      <div className={moduleStyles.validation}>
        <CollapsibleSection
          initiallyCollapsed={false}
          headerContent="Exemplar Player"
        >
          <div className={moduleStyles.row}>
            <BodyThreeText>
              A sound player can be added below the instructions, which will
              play the song that is the exemplar for this level.
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
              checked={!!exemplarPlayerSettings.enabled}
              onChange={newValue => {
                setExemplarPlayerSettings({
                  ...exemplarPlayerSettings,
                  enabled: newValue.target.checked,
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
              value={exemplarPlayerSettings.title ?? 'Example'}
              disabled={!exemplarDefined || !exemplarPlayerSettings.enabled}
              onChange={newValue => {
                setExemplarPlayerSettings({
                  ...exemplarPlayerSettings,
                  title: newValue.target.value,
                });
              }}
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default ExemplarPlayerSettings;
