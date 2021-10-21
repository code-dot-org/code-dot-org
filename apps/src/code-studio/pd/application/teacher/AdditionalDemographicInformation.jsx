import React, {useState} from 'react';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import PrivacyDialog from '../PrivacyDialog';
import {PrivacyDialogMode} from '../../constants';
import {
  labelFor,
  LabelsContext
} from '../../form_components_func/LabeledFormComponent';
import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledRadioButtons} from '../../form_components_func/labeled/LabeledRadioButtons';
import {
  LabeledCheckBoxes,
  LabeledCheckBoxesWithAdditionalTextFields
} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {LabeledSingleCheckbox} from '../../form_components_func/labeled/LabeledSingleCheckbox';

const AdditionalDemographicInformation = props => {
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);

  const openPrivacyDialog = event => {
    // preventDefault so clicking this link inside the label doesn't
    // also check the checkbox.
    event.preventDefault();
    setIsPrivacyDialogOpen(true);
  };

  const handleClosePrivacyDialog = () => {
    setIsPrivacyDialogOpen(false);
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider
        value={PageLabels.additionalDemographicInformation}
      >
        <FormGroup>
          <h3>Section 4: {SectionHeaders.additionalDemographicInformation}</h3>
          <LabeledRadioButtons name="genderIdentity" />
          <LabeledCheckBoxes name="race" />
          <LabeledCheckBoxesWithAdditionalTextFields
            name="howHeard"
            textFieldMap={{
              [TextFields.otherWithText]: 'other'
            }}
            required={false}
          />
          <label className="control-label">Submit your application</label>
          <LabeledSingleCheckbox
            name="agree"
            label={
              <span>
                {labelFor('agree')}{' '}
                <a onClick={openPrivacyDialog}>Learn more.</a>
              </span>
            }
          />
          <PrivacyDialog
            show={isPrivacyDialogOpen}
            onHide={handleClosePrivacyDialog}
            mode={PrivacyDialogMode.TEACHER_APPLICATION}
          />
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};

AdditionalDemographicInformation.associatedFields = [
  ...Object.keys(PageLabels.additionalDemographicInformation)
];

export default AdditionalDemographicInformation;
