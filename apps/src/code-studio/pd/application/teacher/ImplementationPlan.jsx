import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA,
  getProgramInfo,
} from './TeacherApplicationConstants';
import {
  PageLabels,
  SectionHeaders,
  TextFields,
  Year,
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {FormContext} from '../../form_components_func/FormComponent';
import {LabeledCheckBoxes} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields,
} from '../../form_components_func/labeled/LabeledRadioButtons';

const WhichGradesSelector = props => {
  return (
    <>
      <LabeledCheckBoxes name={props.courseName} />
      {props.showScholarshipWarning && (
        <p style={styles.error}>
          Note: This program is designed to work best for teachers who are
          teaching this course in the {Year} school year. Scholarship
          eligibility is often dependent on whether or not you will be teaching
          the course during the {Year} school year.
        </p>
      )}
    </>
  );
};
WhichGradesSelector.propTypes = {
  courseName: PropTypes.string,
  showScholarshipWarning: PropTypes.bool,
};

const ImplementationPlan = props => {
  const {data} = props;
  const programInfo = getProgramInfo(data.program);
  const hasNoProgramSelected = data.program === undefined;

  const notSureTeachPlanOption = `Not sure yet if my school plans to offer ${programInfo.name} in the ${Year} school year`;
  let showScholarshipEligibilityWarning = false;
  if (
    (data.program === PROGRAM_CSD &&
      data.csdWhichGrades &&
      data.csdWhichGrades.includes(notSureTeachPlanOption)) ||
    (data.program === PROGRAM_CSP &&
      data.cspWhichGrades &&
      data.cspWhichGrades.includes(notSureTeachPlanOption)) ||
    (data.program === PROGRAM_CSA &&
      data.csaWhichGrades &&
      data.csaWhichGrades.includes(notSureTeachPlanOption))
  ) {
    showScholarshipEligibilityWarning = true;
  }

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
          {data.program === PROGRAM_CSD && (
            <WhichGradesSelector
              courseName="csdWhichGrades"
              showScholarshipWarning={showScholarshipEligibilityWarning}
            />
          )}
          {data.program === PROGRAM_CSP && (
            <>
              <WhichGradesSelector
                courseName="cspWhichGrades"
                showScholarshipWarning={showScholarshipEligibilityWarning}
              />
              <LabeledRadioButtons name="cspHowOffer" />
            </>
          )}
          {data.program === PROGRAM_CSA && (
            <>
              <WhichGradesSelector
                courseName="csaWhichGrades"
                showScholarshipWarning={showScholarshipEligibilityWarning}
              />
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

          <LabeledRadioButtonsWithAdditionalTextFields
            name="replaceExisting"
            textFieldMap={{
              [TextFields.iDontKnowExplain]: 'other',
            }}
          />
        </>
      );
    }
  };

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.implementationPlan}>
        <FormGroup>
          <h3>Section 6: {SectionHeaders.implementationPlan}</h3>

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
  const requiredFields = [];

  if (data.program) {
    requiredFields.push(...uniqueRequiredFields[data.program]);
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
