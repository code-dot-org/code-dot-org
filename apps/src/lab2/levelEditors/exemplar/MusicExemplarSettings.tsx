import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {
  ExemplarValidationMode,
  MusicExemplarSettings,
} from '@cdo/apps/music/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import moduleStyles from './exemplar-settings.module.scss';

interface MusicExemplarSettingsProps {
  exemplarDefined: boolean;
  exemplarSettings: MusicExemplarSettings;
  onChange: (updatedFields: Partial<MusicExemplarSettings>) => void;
}

const defaultMusicExemplarSettings: Partial<MusicExemplarSettings> = {
  validationMode: 'default',
  playerTitle: 'Example',
  playerEnabled: false,
};

const EXEMPLAR_VALIDATION_MODE_OPTIONS = [
  {
    label: 'Compare all sounds by id (Default)',
    value: 'default',
  },
  {
    label: 'Compare all sounds by type only',
    value: 'type',
  },
];

const MusicExemplarSettings: React.FunctionComponent<
  MusicExemplarSettingsProps
> = ({exemplarSettings, exemplarDefined, onChange}) => {
  return (
    <div className={moduleStyles.section}>
      <CollapsibleSection
        initiallyCollapsed={false}
        headerContent="Music Exemplar Settings"
      >
        <div className={moduleStyles.row}>
          <p>
            When exemplar validation is enabled on a Music level, the playback
            events on the student's timeline must match those on the exemplar's
            timeline. Exemplar validation cannot check code organization (such
            as loops or functions) - use condition-based validation in
            combination with exemplar validation to achieve this. You can choose
            between two modes:
          </p>
        </div>
        <div className={moduleStyles.row}>
          <ul>
            <li>
              <strong>Compare all events by type and id (Default):</strong>{' '}
              Everything on the timeline must match the exemplar exactly.
            </li>
            <li>
              <strong>Compare all events by type only:</strong> Only the event
              type (sound, chord, instrument) and sound type (beat, bass, lead,
              fx, vocal) must match, not the specific sound.
            </li>
          </ul>
        </div>
        {!exemplarDefined && (
          <div className={moduleStyles.row}>
            <em>This level does not have an exemplar.</em>
          </div>
        )}
        <div className={moduleStyles.row}>
          <label htmlFor="mode" className={moduleStyles.label}>
            Validation Mode:
          </label>
          <select
            id="mode"
            name="mode"
            className={moduleStyles.callout}
            disabled={!exemplarDefined || !exemplarSettings.validationEnabled}
            value={exemplarSettings.validationMode ?? ''}
            onChange={e => {
              let newMode;
              if (['default', 'type'].includes(e.target.value)) {
                newMode = e.target.value as ExemplarValidationMode;
              }
              onChange({
                ...defaultMusicExemplarSettings,
                ...exemplarSettings,
                validationMode: newMode ? newMode : undefined,
              });
            }}
          >
            {EXEMPLAR_VALIDATION_MODE_OPTIONS.map(({label, value}) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className={moduleStyles.row}>
          <BodyThreeText>
            A sound player can be added below the instructions, which will play
            the song that is the exemplar for this level.
          </BodyThreeText>
        </div>
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
                ...defaultMusicExemplarSettings,
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
                ...defaultMusicExemplarSettings,
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

export default MusicExemplarSettings;
