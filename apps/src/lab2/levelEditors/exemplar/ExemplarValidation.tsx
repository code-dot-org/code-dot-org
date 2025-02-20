import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import {AppName} from '../../types';

import moduleStyles from '../validations/edit-validations.module.scss';

const AppSupport: {[key in AppName]?: boolean} = {
  music: true,
};

interface ExemplarValidation {
  enabled: boolean;
  successMessage?: string;
  failureMessage?: string;
}
interface ExemplarValidationProps {
  initialExemplarValidation: ExemplarValidation;
  exemplarDefined: boolean;
  appName: AppName;
}

const ExemplarValidation: React.FunctionComponent<ExemplarValidationProps> = ({
  initialExemplarValidation,
  exemplarDefined,
  appName,
}) => {
  const [exemplarValidation, setExemplarValidation] =
    useState<ExemplarValidation>(initialExemplarValidation);

  const appSupported = AppSupport[appName];

  if (!appSupported) {
    return (
      <div>
        {`Exemplar validation is not available for ${appName}. Contact the engineering team for further details.`}
      </div>
    );
  }

  return (
    <div>
      <input
        type="hidden"
        id="level_exemplar_validation"
        name="level[exemplar_validation]"
        value={JSON.stringify(exemplarValidation)}
      />

      <div className={moduleStyles.validation}>
        <CollapsibleSection
          initiallyCollapsed={false}
          headerContent="Exemplar Validation"
        >
          <div className={moduleStyles.row}>
            <BodyThreeText>
              An additional layer of validation is available for levels with
              exemplar sources.
              <br />
              This validation and its associated feedback occur <i>after</i> any
              other validations, listed above. If checked, the student's
              timeline must match the exemplar's timeline.
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
              checked={!!exemplarValidation.enabled}
              onChange={newValue => {
                setExemplarValidation({
                  ...exemplarValidation,
                  enabled: newValue.target.checked,
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
              value={exemplarValidation.successMessage ?? ''}
              disabled={!exemplarDefined || !exemplarValidation.enabled}
              onChange={newValue => {
                setExemplarValidation({
                  ...exemplarValidation,
                  successMessage: newValue.target.value,
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
              value={exemplarValidation.failureMessage ?? ''}
              disabled={!exemplarDefined || !exemplarValidation.enabled}
              onChange={newValue => {
                setExemplarValidation({
                  ...exemplarValidation,
                  failureMessage: newValue.target.value,
                });
              }}
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default ExemplarValidation;
