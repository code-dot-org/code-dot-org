import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {
  PageLabels,
  SectionHeaders,
  TextFields,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import color from '@cdo/apps/util/color';

import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledCheckBoxes} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields,
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';

import {PROGRAM_CSA} from './TeacherApplicationConstants';

const AdditionalDemographicInformation = props => {
  const {data} = props;
  const hasNoProgramSelected = data.program === undefined;

  const renderContents = () => {
    if (hasNoProgramSelected) {
      return (
        <div style={styles.error}>
          <p>
            Please fill out Section 1 and select your program before completing
            this section.
          </p>
        </div>
      );
    } else {
      return (
        <>
          <LabeledRadioButtonsWithAdditionalTextFields
            name="currentRole"
            textFieldMap={{[TextFields.otherPleaseList]: 'other'}}
          />
          <LabeledCheckBoxes name="previousYearlongCdoPd" />

          {data.program === PROGRAM_CSA && (
            <>
              <LabeledRadioButtons name="csaAlreadyKnow" />
              {data.csaAlreadyKnow === 'No' && (
                <p style={styles.error}>
                  We don’t recommend this program for teachers completely new to
                  computer science. Consider starting with CS Principles
                  Professional Learning or plan for additional onboarding in
                  preparation for this program.
                </p>
              )}
              <LabeledRadioButtons name="csaPhoneScreen" />
              {data.csaPhoneScreen === 'No' && (
                <p style={styles.error}>
                  We recommend deepening your content knowledge prior to
                  starting this program. This can be accomplished by completing
                  additional pre-work that will be shared with you once accepted
                  to the program. This pre-work usually takes approx 10 hours.
                </p>
              )}
            </>
          )}

          <p>
            Demographic information is collected and utilized for data purposes
            only, and it is not a factor in the application review process.
          </p>
          <LabeledRadioButtons name="genderIdentity" />
          <LabeledCheckBoxes name="race" />
        </>
      );
    }
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider
        value={PageLabels.additionalDemographicInformation}
      >
        <FormGroup>
          <h3>Section 4: {SectionHeaders.additionalDemographicInformation}</h3>

          {renderContents()}
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};
AdditionalDemographicInformation.propTypes = {
  data: PropTypes.object.isRequired,
};

AdditionalDemographicInformation.associatedFields = [
  ...Object.keys(PageLabels.additionalDemographicInformation),
];

AdditionalDemographicInformation.getDynamicallyRequiredFields = data => {
  const requiredFields = [];

  if (data.program === PROGRAM_CSA) {
    requiredFields.push(['csaAlreadyKnow', 'csaPhoneScreen']);
  }

  return requiredFields;
};

export default AdditionalDemographicInformation;

const styles = {
  error: {
    color: color.red,
  },
};
