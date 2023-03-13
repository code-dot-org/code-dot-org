import React from 'react';
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledInput} from '../../form_components_func/labeled/LabeledInput';
import UsPhoneNumberInput from '../../form_components/UsPhoneNumberInput';
import {LabeledUsPhoneNumberInput} from '../../form_components_func/labeled/LabeledUsPhoneNumberInput';
import {isEmail} from '@cdo/apps/util/formatValidation';

const AdministratorInformation = props => {
  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.administratorInformation}>
        <FormGroup>
          <h3>Section 5: {SectionHeaders.administratorInformation}</h3>

          <p style={{margin: '10px 0'}}>
            Please provide information for an Administrator/School Leader (i.e.
            Principal, Vice Principal, STEM Program Director, etc) who can
            certify that the course will be offered at your school. Upon your
            submission of this application, we will contact the
            Administrator/School Leader that you listed via email in order to
            obtain their approval. Note that your application cannot be fully
            reviewed until there is approval from your administrator/school
            leader. Therefore, we encourage you to follow up with them directly
            to let them know about your application and to expect an email
            seeking their approval.
          </p>
          {
            // Disable auto complete for principal fields, so they are not filled with the teacher's details.
            // Using a custom unmatched string "never" instead of "off" for wider browser compatibility.
            // See https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#Disabling_autocompletion
          }
          <LabeledInput name="principalRole" autoComplete="never" />
          <LabeledInput name="principalFirstName" autoComplete="never" />
          <LabeledInput name="principalLastName" autoComplete="never" />
          <LabeledInput name="principalEmail" autoComplete="never" />
          <LabeledInput name="principalConfirmEmail" autoComplete="never" />
          <LabeledUsPhoneNumberInput
            name="principalPhoneNumber"
            autoComplete="never"
          />
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};

AdministratorInformation.associatedFields = [
  ...Object.keys(PageLabels.administratorInformation)
];

AdministratorInformation.getErrorMessages = data => {
  const formatErrors = {};

  if (!UsPhoneNumberInput.isValid(data.principalPhoneNumber)) {
    formatErrors.principalPhoneNumber =
      'Must be a valid phone number including area code';
  }

  if (!isEmail(data.principalEmail)) {
    formatErrors.principalEmail = 'Must be a valid email address';
  }

  if (data.principalEmail !== data.principalConfirmEmail) {
    formatErrors.principalConfirmEmail = 'Must match above email';
  }

  return formatErrors;
};

export default AdministratorInformation;
