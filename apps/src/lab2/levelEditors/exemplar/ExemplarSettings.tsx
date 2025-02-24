import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import {AppName} from '../../types';

import moduleStyles from './exemplar-settings.module.scss';

const AppSupport: {[key in AppName]?: boolean} = {
  music: true,
};

interface ExemplarSettings {
  playerEnabled: boolean;
  playerTitle?: string;
  validationEnabled: boolean;
  validationSuccessMessage?: string;
  validationFailureMessage?: string;
}

interface ExemplarSettingsProps {
  initialExemplarSettings: ExemplarSettings;
  exemplarDefined: boolean;
  appName: AppName;
}

const ExemplarSettings: React.FunctionComponent<ExemplarSettingsProps> = ({
  initialExemplarSettings,
  exemplarDefined,
  appName,
}) => {
  const [exemplarSettings, setExemplarSettings] = useState<ExemplarSettings>(
    initialExemplarSettings
  );

  const appSupported = AppSupport[appName];

  if (!appSupported) {
    return (
      <div>
        {`Exemplar settings are not available for ${appName}. Contact the engineering team for further details.`}
      </div>
    );
  }

  return (
    <div>
      <input
        type="hidden"
        id="level_exemplar_settings"
        name="level[exemplar_settings]"
        value={JSON.stringify(exemplarSettings)}
      />
      <div className={moduleStyles.section}>
        <CollapsibleSection
          initiallyCollapsed={false}
          headerContent="Exemplar Validation"
        >
          <div className={moduleStyles.row}>
            <BodyThreeText>
              An additional layer of validation is available for levels with
              exemplar sources.
              <br />
              If checked, the playback events on the student’s timeline must
              match those on the exemplar’s timeline. If condition-based
              validations are defined (in the section above), they will be
              checked first. Exemplar validation cannot check code organization
              (such as loops or functions) - use condition-based validation in
              combination with exemplar validation to achieve this. The student
              cannot pass the level unless all timeline events match exactly,
              even if they have satisfied all other condition-based validations.
            </BodyThreeText>
          </div>
          {!exemplarDefined && (
            <div className={moduleStyles.row}>
              <em>This level does not have an exemplar.</em>
            </div>
          )}
          <div className={moduleStyles.row}>
            <label htmlFor="validateExemplar" className={moduleStyles.label}>
              Validate against exemplar?
            </label>
            <input
              type="checkbox"
              id="validateExemplar"
              name="validateExemplar"
              disabled={!exemplarDefined}
              checked={!!exemplarSettings.validationEnabled}
              onChange={newValue => {
                setExemplarSettings({
                  ...exemplarSettings,
                  validationEnabled: newValue.target.checked,
                  // Validation requires the player.
                  ...(newValue.target.checked ? {playerEnabled: true} : {}),
                });
              }}
            />
          </div>
          <div className={moduleStyles.row}>
            <label htmlFor="successMessage" className={moduleStyles.label}>
              Success message:
            </label>
            <input
              type="text"
              id="successMessage"
              name="successMessage"
              className={moduleStyles.callout}
              value={exemplarSettings.validationSuccessMessage ?? ''}
              disabled={!exemplarDefined || !exemplarSettings.validationEnabled}
              onChange={newValue => {
                setExemplarSettings({
                  ...exemplarSettings,
                  validationSuccessMessage: newValue.target.value,
                });
              }}
            />
          </div>
          <div className={moduleStyles.row}>
            <label htmlFor="failureMessage" className={moduleStyles.label}>
              Failure message:
            </label>
            <input
              type="text"
              id="failureMessage"
              name="failureMessage"
              className={moduleStyles.callout}
              value={exemplarSettings.validationFailureMessage ?? ''}
              disabled={!exemplarDefined || !exemplarSettings.validationEnabled}
              onChange={newValue => {
                setExemplarSettings({
                  ...exemplarSettings,
                  validationFailureMessage: newValue.target.value,
                });
              }}
            />
          </div>
        </CollapsibleSection>
      </div>
      <div className={moduleStyles.section}>
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
              checked={!!exemplarSettings.playerEnabled}
              onChange={newValue => {
                setExemplarSettings({
                  ...exemplarSettings,
                  playerEnabled: newValue.target.checked,
                  // Validation requires the player.
                  ...(!newValue.target.checked
                    ? {validationEnabled: false}
                    : {}),
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
              value={exemplarSettings.playerTitle ?? 'Example'}
              disabled={!exemplarDefined || !exemplarSettings.playerEnabled}
              onChange={newValue => {
                setExemplarSettings({
                  ...exemplarSettings,
                  playerTitle: newValue.target.value,
                });
              }}
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default ExemplarSettings;
