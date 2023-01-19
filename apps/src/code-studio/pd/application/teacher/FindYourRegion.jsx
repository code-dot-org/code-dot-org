import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  Modal,
  Button,
  Row,
  Col
} from 'react-bootstrap';
import {styles} from './TeacherApplicationConstants';
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {LabeledInput} from '../../form_components_func/labeled/LabeledInput';
import {LabeledSelect} from '../../form_components_func/labeled/LabeledSelect';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {LabeledRadioButtons} from '../../form_components_func/labeled/LabeledRadioButtons';
import {
  FormContext,
  getValidationState
} from '../../form_components_func/FormComponent';
import {isZipCode} from '@cdo/apps/util/formatValidation';
import {useRegionalPartner} from '../../components/useRegionalPartner';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import analyticsReporter, {EVENTS} from '@cdo/apps/lib/util/AnalyticsReporter';

const PD_RESOURCES_URL =
  'https://support.code.org/hc/en-us/articles/115003865532';
const CS_TEACHERS_URL = 'https://code.org/educate/community';
const INTERNATIONAL = 'Other country';
const US = 'United States';

const FindYourRegion = props => {
  const {onChange, errors, data} = props;
  const hasNoProgramSelected = data.program === undefined;
  const resetCountry = () => onChange({country: US});
  const [regionalPartner] = useRegionalPartner(data);
  const [lastRPLogged, setLastRPLogged] = useState(regionalPartner?.name);

  useEffect(() => {
    onChange({
      regionalPartnerId: regionalPartner?.id,
      regionalPartnerGroup: regionalPartner?.group,
      regionalPartnerWorkshopIds: (regionalPartner?.workshops || []).map(
        workshop => workshop.id
      )
    });
    if (regionalPartner?.name !== lastRPLogged) {
      setLastRPLogged(regionalPartner?.name);
      analyticsReporter.sendEvent(EVENTS.RP_FOUND_EVENT, {
        'regional partner': regionalPartner?.name || 'No Partner'
      });
    }
  }, [regionalPartner, data, lastRPLogged, onChange]);

  const renderInternationalModal = () => {
    return (
      <Modal show={data.country === INTERNATIONAL}>
        <Modal.Header>
          <Modal.Title>
            Thank you for your interest in Code.org’s Professional Learning
            Program.
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          At this time, we are only able to provide this program to teachers in
          the United States. Please visit our website for additional Code.org{' '}
          <a href={PD_RESOURCES_URL} target="_blank" rel="noopener noreferrer">
            professional development resources
          </a>{' '}
          and opportunities to connect with other{' '}
          <a href={CS_TEACHERS_URL} target="_blank" rel="noopener noreferrer">
            computer science teachers
          </a>
          .
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={resetCountry} bsStyle="primary">
            Continue as United States Teacher
          </Button>
          <Button href={PD_RESOURCES_URL}>Exit Application</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const handleSchoolChange = selectedSchool => {
    onChange({
      school: selectedSchool?.value,
      schoolZipCode: selectedSchool?.school?.zip
    });
  };

  const renderRegionalPartnerInfo = () => {
    let content;
    if (regionalPartner?.name) {
      content = (
        <>
          <p>
            Your Regional Partner will host the full professional learning
            program and provide ongoing support as you implement what you’ve
            learned in the classroom!
          </p>
          <p>
            <strong>Your Regional Partner is: {regionalPartner.name}</strong>
          </p>
        </>
      );
    } else {
      content = (
        <>
          <p>
            <strong>
              There is no Regional Partner in your region at this time
            </strong>
          </p>
          <p>
            Code.org will review your application and contact you with options
            for joining the program hosted by a Regional Partner from a
            different region. Please note that we are not able to guarantee a
            space for you with another Regional Partner, and you will be
            responsible for the costs associated with traveling to that location
            if a virtual option is not available.
          </p>
        </>
      );
    }
    return (
      <>
        <p>
          Participants are assigned to a program hosted by one of our Regional
          Partners based on their school's geographic location.
        </p>
        {data.school && content}
      </>
    );
  };

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
          <LabeledRadioButtons name="country" />
          {renderInternationalModal()}

          <p>
            Please provide your school’s information below. If your school is
            not listed please select from the drop-down “Other school not listed
            below” and provide the school details below.
          </p>
          <FormGroup
            id="school"
            controlId="school"
            validationState={getValidationState('school', errors)}
          >
            <Row>
              <Col md={6}>
                <ControlLabel>
                  School
                  <span style={{color: 'red'}}> *</span>
                </ControlLabel>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <SchoolAutocompleteDropdown
                  value={data.school}
                  onChange={handleSchoolChange}
                />
              </Col>
            </Row>
          </FormGroup>

          {/* if we have a school but it doesn't exist in our database */}
          {data.school && data.school === '-1' && (
            <div style={styles.indented}>
              <LabeledInput name="schoolName" />
              <LabeledInput name="schoolDistrictName" required={false} />
              <LabeledInput name="schoolAddress" required={false} />
              <LabeledInput name="schoolCity" required={false} />
              <LabeledSelect name="schoolState" placeholder="Select a state" />
              <LabeledInput name="schoolZipCode" />
              <LabeledRadioButtons name="schoolType" />
            </div>
          )}

          {renderRegionalPartnerInfo()}
        </>
      );
    }
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.findYourRegion}>
        <FormGroup>
          <h3>Section 2: {SectionHeaders.findYourRegion}</h3>

          {renderContents()}
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};
FindYourRegion.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

FindYourRegion.associatedFields = [...Object.keys(PageLabels.findYourRegion)];

FindYourRegion.getDynamicallyRequiredFields = data => {
  const requiredFields = [];

  if (data.school === '-1') {
    requiredFields.push('schoolName');
    requiredFields.push('schoolState');
    requiredFields.push('schoolZipCode');
    requiredFields.push('schoolType');
  }

  return requiredFields;
};

FindYourRegion.getErrorMessages = data => {
  const formatErrors = {};

  if (data.schoolZipCode && !isZipCode(data.schoolZipCode)) {
    formatErrors.schoolZipCode = 'Must be a valid zip code';
  }

  return formatErrors;
};

export default FindYourRegion;
