import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import PrivacyDialog from '../PrivacyDialog';
import {PrivacyDialogMode} from '../../constants';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledRadioButtons} from '../../form_components_func/labeled/LabeledRadioButtons';
import {
  LabeledCheckBoxes,
  LabeledCheckBoxesWithAdditionalTextFields
} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {LabeledSingleCheckbox} from '../../form_components_func/labeled/LabeledSingleCheckbox';
import {useRegionalPartner} from '../../components/useRegionalPartner';

const AdditionalDemographicInformation = props => {
  const {data} = props;
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [regionalPartner] = useRegionalPartner(data);

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
                {PageLabels.additionalDemographicInformation.agree.replace(
                  'my local Code.org Regional Partner',
                  regionalPartner
                    ? regionalPartner.name
                    : 'my local Code.org Regional Partner'
                )}{' '}
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
AdditionalDemographicInformation.propTypes = {
  options: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorMessages: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

AdditionalDemographicInformation.associatedFields = [
  ...Object.keys(PageLabels.additionalDemographicInformation)
];

export default AdditionalDemographicInformation;
