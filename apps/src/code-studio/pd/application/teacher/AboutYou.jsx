import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup, Row, Col} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {
  PageLabels,
  SectionHeaders,
  TextFields,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';

import UsPhoneNumberInput from '../../form_components/UsPhoneNumberInput';
import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledCheckBoxesWithAdditionalTextFields} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {
  LabeledInput,
  LabeledLargeInput,
} from '../../form_components_func/labeled/LabeledInput';
import {LabeledRadioButtons} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabeledSelect} from '../../form_components_func/labeled/LabeledSelect';
import {LabeledUsPhoneNumberInput} from '../../form_components_func/labeled/LabeledUsPhoneNumberInput';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';

const AboutYou = props => {
  const {accountEmail, data} = props;

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.aboutYou}>
        <FormGroup>
          <h3>Section 3: {SectionHeaders.aboutYou}</h3>

          <LabeledRadioButtons name="completingOnBehalfOfSomeoneElse" />
          {data.completingOnBehalfOfSomeoneElse === 'Yes' && (
            <LabeledLargeInput name="completingOnBehalfOfName" />
          )}

          <Row>
            <Col md={3}>
              <LabeledInput name="firstName" controlWidth={{md: 12}} />
            </Col>
            <Col md={3}>
              <LabeledInput name="lastName" controlWidth={{md: 12}} />
            </Col>
          </Row>
          <LabeledInput name="accountEmail" value={accountEmail} readOnly />
          <LabeledInput name="alternateEmail" required={false} />
          <LabeledUsPhoneNumberInput name="phone" />

          <p>
            Code.org or your Regional Partner may need to ship workshop
            materials to you. Please provide the address where you can receive
            mail when school is not in session.
          </p>
          <LabeledInput name="streetAddress" />
          <LabeledInput name="city" />
          <LabeledSelect name="state" placeholder="Select a state" />
          <LabeledInput name="zipCode" />
          <LabeledCheckBoxesWithAdditionalTextFields
            name="howHeard"
            textFieldMap={{
              [TextFields.otherWithText]: 'other',
            }}
            required={false}
          />
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};
AboutYou.propTypes = {
  data: PropTypes.object.isRequired,
  accountEmail: PropTypes.string.isRequired,
};

AboutYou.associatedFields = [...Object.keys(PageLabels.aboutYou)];

AboutYou.getDynamicallyRequiredFields = data => {
  const requiredFields = [];

  if (data.completingOnBehalfOfSomeoneElse === 'Yes') {
    requiredFields.push('completingOnBehalfOfName');
  }

  return requiredFields;
};

AboutYou.processPageData = data => {
  const changes = {};
  if (data.completingOnBehalfOfSomeoneElse === 'No') {
    changes.completingOnBehalfOfName = undefined;
  }
  return changes;
};

AboutYou.getErrorMessages = data => {
  const formatErrors = {};

  if (data.alternateEmail && !isEmail(data.alternateEmail)) {
    formatErrors.alternateEmail = 'Must be a valid email address';
  }

  if (data.zipCode && !isZipCode(data.zipCode)) {
    formatErrors.zipCode = 'Must be a valid zip code';
  }

  if (!UsPhoneNumberInput.isValid(data.phone)) {
    formatErrors.phone = 'Must be a valid phone number including area code';
  }

  return formatErrors;
};

export default AboutYou;
