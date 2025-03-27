import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import {AppName, ExemplarSettings} from '../../types';

import moduleStyles from './exemplar-settings.module.scss';

interface ExemplarSettingsProps {
  exemplarDefined: boolean;
  exemplarSettings: ExemplarSettings;
  onChange: (updatedFields: ExemplarSettings) => void;
  appName: AppName;
}

const defaultExemplarValidationSettings: ExemplarSettings = {
  validationSuccessMessage: '',
  validationFailureMessage: '',
  validationEnabled: false,
};

const ExemplarValidation: React.FunctionComponent<ExemplarSettingsProps> = ({
  exemplarDefined,
  exemplarSettings,
  onChange,
  appName,
}) => {
  return (
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
            If checked, the playback events on the student’s timeline must match
            those on the exemplar’s timeline. If condition-based validations are
            defined (in the section above), they will be checked first. Exemplar
            validation cannot check code organization (such as loops or
            functions) - use condition-based validation in combination with
            exemplar validation to achieve this. The student cannot pass the
            level unless all timeline events match exactly, even if they have
            satisfied all other condition-based validations.
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
              onChange({
                ...defaultExemplarValidationSettings,
                ...exemplarSettings,
                validationEnabled: newValue.target.checked,
                // Music Lab's exemplar validation requires the player.
                ...(newValue.target.checked && appName === 'music'
                  ? {playerEnabled: true}
                  : {}),
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
              onChange({
                ...defaultExemplarValidationSettings,
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
              onChange({
                ...defaultExemplarValidationSettings,
                ...exemplarSettings,
                validationFailureMessage: newValue.target.value,
              });
            }}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ExemplarValidation;
