import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {
  PageLabels,
  SectionHeaders,
  Year,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import color from '@cdo/apps/util/color';

import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledCheckBoxes} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {LabeledRadioButtons} from '../../form_components_func/labeled/LabeledRadioButtons';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';

import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA,
  getProgramInfo,
} from './TeacherApplicationConstants';

const ImplementationPlan = props => {
  const {data} = props;
  const programInfo = getProgramInfo(data.program);
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
    } else if (data.willTeach === 'Yes') {
      return (
        <>
          {data.program === PROGRAM_CSD && (
            <LabeledCheckBoxes name="csdWhichGrades" />
          )}
          {data.program === PROGRAM_CSP && (
            <>
              <LabeledCheckBoxes name="cspWhichGrades" />
              <LabeledRadioButtons name="cspHowOffer" />
            </>
          )}
          {data.program === PROGRAM_CSA && (
            <>
              <LabeledCheckBoxes name="csaWhichGrades" />
              <LabeledRadioButtons name="csaHowOffer" />
            </>
          )}

          <p>
            We recommend {programInfo.minCourseHours} hours or more of
            instructional time per {programInfo.name} section. You can calculate
            your per section hours following formula:
          </p>
          <p>
            <strong>Per section hours =</strong> (number of minutes of one
            class) <strong> X </strong> (number of days per week the class will
            be offered) <strong> X </strong> (number of weeks with the class)
          </p>
          <LabeledRadioButtons
            name="enoughCourseHours"
            label={PageLabels.implementationPlan.enoughCourseHours
              .replace('{{CS program}}', programInfo.name)
              .replace('{{min hours}}', programInfo.minCourseHours)}
          />
        </>
      );
    } else if (!!data.willTeach) {
      return (
        <p style={styles.error}>
          Note: This program is designed to work best for teachers who are
          teaching this course in the {Year} school year. Scholarship
          eligibility is often dependent on whether or not you will be teaching
          the course during the {Year} school year.
        </p>
      );
    }
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.implementationPlan}>
        <FormGroup>
          <h3>Section 6: {SectionHeaders.implementationPlan}</h3>
          <LabeledRadioButtons name="willTeach" />
          {renderContents()}
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};
ImplementationPlan.propTypes = {
  data: PropTypes.object.isRequired,
};

ImplementationPlan.associatedFields = [
  ...Object.keys(PageLabels.implementationPlan),
];

const uniqueRequiredFields = {
  [PROGRAM_CSD]: ['csdWhichGrades'],
  [PROGRAM_CSP]: ['cspWhichGrades', 'cspHowOffer'],
  [PROGRAM_CSA]: ['csaWhichGrades', 'csaHowOffer'],
};

ImplementationPlan.getDynamicallyRequiredFields = data => {
  const requiredFields = ['willTeach'];

  if (data.willTeach === 'Yes') {
    requiredFields.push('enoughCourseHours');
    if (data.program) {
      requiredFields.push(...uniqueRequiredFields[data.program]);
    }
  }

  return requiredFields;
};

ImplementationPlan.processPageData = data => {
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

export default ImplementationPlan;

const styles = {
  error: {
    color: color.red,
  },
};
