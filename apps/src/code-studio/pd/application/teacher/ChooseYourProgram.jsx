import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {RegionalPartnerMiniContactPopupLink} from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';
import {
  PageLabels,
  SectionHeaders,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledRadioButtons} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';

import {styles, getProgramInfo} from './TeacherApplicationConstants';

const CSD_URL = 'https://code.org/educate/csd';
const CSP_URL = 'https://code.org/educate/csp';
const CSA_URL = 'https://code.org/educate/csa';

const ChooseYourProgram = props => {
  const [programChanged, setProgramChanged] = useState(false);

  const onProgramChange = newProgram => {
    if (props.data.program) {
      setProgramChanged(true);
    }
    props.onChange(newProgram);
    analyticsReporter.sendEvent(EVENTS.PROGRAM_PICKED_EVENT, {
      'professional learning program': getProgramInfo(newProgram.program)
        .shortName,
    });
  };

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
            , and{' '}
            <a href={CSA_URL} target="_blank" rel="noopener noreferrer">
              Computer Science A
            </a>{' '}
            landing pages. For additional questions regarding the program or
            application, please{' '}
            <RegionalPartnerMiniContactPopupLink
              sourcePageId="teacher-application-first-page"
              notes="Please tell me more about the professional learning program for grades 6-12!"
            >
              <span style={styles.linkLike}>contact your Regional Partner</span>
            </RegionalPartnerMiniContactPopupLink>
            .
          </p>
          <h3>Section 1: {SectionHeaders.chooseYourProgram}</h3>
          <LabeledRadioButtons
            name="program"
            onChange={program => onProgramChange(program)}
          />
          {programChanged && (
            <p>
              Note: If you have previously started the application and decide to
              change your program, that will impact which questions you need to
              answer to complete the application. In this case, please check all
              pages to make sure you have answered all questions for this new
              program choice.
            </p>
          )}
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
  onChange: PropTypes.func.isRequired,
};

ChooseYourProgram.associatedFields = [
  ...Object.keys(PageLabels.chooseYourProgram),
];

export default ChooseYourProgram;
