import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import {AppName, ExemplarSettings} from '../../types';

import moduleStyles from './exemplar-settings.module.scss';

interface ExemplarValidationProps {
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

const ExemplarValidation: React.FunctionComponent<ExemplarValidationProps> = ({
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
            exemplar sources. If enabled, the student's work will be compared
            against the exemplar's expected output. The validation method may
            vary by app, and all validations must pass for the level to be
            marked complete.
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
