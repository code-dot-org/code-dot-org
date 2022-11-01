import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup} from 'react-bootstrap';
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA,
  styles
} from './TeacherApplicationConstants';
import {RegionalPartnerMiniContactPopupLink} from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {LabeledRadioButtons} from '../../form_components_func/labeled/LabeledRadioButtons';
import {FormContext} from '../../form_components_func/FormComponent';

const CSD_URL = 'https://code.org/educate/csd';
const CSP_URL = 'https://code.org/educate/csp';
const CSA_URL = 'https://code.org/educate/csa';

const ChooseYourProgram = props => {
  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.chooseYourProgram}>
        <FormGroup>
          <p>
            Thanks for your interest in the Code.org Professional Learning
            Program! This application should take 10 - 15 minutes to complete.
            Fields marked with a <span style={{color: 'red'}}>*</span> are
            required.
          </p>

          <h3>Need more information? </h3>
          <p>
            If you need more information about the program before you apply,
            please visit the{' '}
            <a href={CSD_URL} target="_blank" rel="noopener noreferrer">
              CS Discoveries
            </a>
            ,{' '}
            <a href={CSP_URL} target="_blank" rel="noopener noreferrer">
              CS Principles
            </a>
            , and <a href={CSA_URL}>CSA</a> landing pages. For additional
            questions regarding the program or application, please{' '}
            <RegionalPartnerMiniContactPopupLink
              sourcePageId="teacher-application-first-page"
              notes="Please tell me more about the professional learning program for grades 6-12!"
            >
              <span style={styles.linkLike}>contact your Regional Partner</span>
            </RegionalPartnerMiniContactPopupLink>
            .
          </p>
          <h3>Section 1: {SectionHeaders.chooseYourProgram}</h3>
          <LabeledRadioButtons name="program" />
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};
ChooseYourProgram.propTypes = {
  options: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorMessages: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

ChooseYourProgram.associatedFields = [
  ...Object.keys(PageLabels.chooseYourProgram)
];

const uniqueRequiredFields = {
  [PROGRAM_CSD]: ['csdWhichGrades'],
  [PROGRAM_CSP]: ['cspWhichGrades', 'cspHowOffer'],
  [PROGRAM_CSA]: [
    'csaWhichGrades',
    'csaHowOffer',
    'csaAlreadyKnow',
    'csaPhoneScreen'
  ]
};

ChooseYourProgram.getDynamicallyRequiredFields = data => {
  const requiredFields = [];

  if (data.program) {
    requiredFields.push(...uniqueRequiredFields[data.program]);
  }

  return requiredFields;
};

ChooseYourProgram.processPageData = data => {
  const changes = {};

  if (data.program) {
    const otherPrograms = Object.keys(uniqueRequiredFields).filter(
      program => program !== data.program
    );
    otherPrograms.forEach(otherProgram => {
      uniqueRequiredFields[otherProgram].forEach(field => {
        changes[field] = undefined;
      });
    });
  }

  return changes;
};

export default ChooseYourProgram;
