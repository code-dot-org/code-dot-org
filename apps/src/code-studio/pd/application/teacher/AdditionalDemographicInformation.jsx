import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {
  PageLabels,
  SectionHeaders,
  TextFields,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {PROGRAM_CSA} from './TeacherApplicationConstants';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {FormContext} from '../../form_components_func/FormComponent';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields,
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabeledCheckBoxes} from '../../form_components_func/labeled/LabeledCheckBoxes';

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
                  CS. If possible, consider teaching CS Principles in the
                  upcoming school year and applying for our CS Principles
                  Professional Learning program. If this is not possible, plan
                  to spend at least 40 hours learning foundational CS concepts
                  prior to attending our professional learning for CSA.
                </p>
              )}
              <LabeledRadioButtons name="csaPhoneScreen" />
              {data.csaPhoneScreen === 'No' && (
                <p style={styles.error}>
                  We recommend deepening your content knowledge prior to
                  starting this program. This can be accomplished by completing
                  some additional onboarding prior to attending the CSA
                  Professional Learning program. Your regional partner will
                  share this with you after you have been accepted into the
                  program.
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
