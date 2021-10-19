import React from 'react';
import PropTypes from 'prop-types';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup, Row, Col} from 'react-bootstrap';
import {PROGRAM_CSD, PROGRAM_CSP, YEAR} from './TeacherApplicationConstants';
import color from '@cdo/apps/util/color';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {LabeledCheckBoxes} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {LabeledNumberInput} from '../../form_components_func/labeled/LabeledInput';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {FormContext} from '../../form_components_func/FormComponent';

const MIN_CSD_HOURS = 50;
const MIN_CSP_HOURS = 100;

const ChooseYourProgram = props => {
  const {data} = props;

  const getNameForSelectedProgram = () => {
    if (data.program === PROGRAM_CSD) {
      return 'Discoveries';
    } else if (data.program === PROGRAM_CSP) {
      return 'Principles';
    } else {
      return 'Program';
    }
  };
  // This should be kept consistent with the calculation logic in
  // dashboard/app/models/pd/application/teacher2122_application.rb.
  const csHowManyMinutes = parseInt(data.csHowManyMinutes, 10);
  const csHowManyDaysPerWeek = parseInt(data.csHowManyDaysPerWeek, 10);
  const csHowManyWeeksPerYear = parseInt(data.csHowManyWeeksPerYear, 10);
  let courseHours = null;
  if (
    !isNaN(csHowManyMinutes) &&
    !isNaN(csHowManyDaysPerWeek) &&
    !isNaN(csHowManyWeeksPerYear)
  ) {
    courseHours =
      (csHowManyMinutes * csHowManyDaysPerWeek * csHowManyWeeksPerYear) / 60;
  }

  let belowMinCourseHours = false;
  let program = data.program;
  let minCourseHours =
    program && program.includes('Discoveries') ? MIN_CSD_HOURS : MIN_CSP_HOURS;
  if (program) {
    if (program.includes('Discoveries')) {
      minCourseHours = MIN_CSD_HOURS;
    }
    if (
      (program.includes('Discoveries') || program.includes('Principles')) &&
      courseHours !== null
    ) {
      if (courseHours < minCourseHours) {
        belowMinCourseHours = true;
      }
    }
  }

  let showTeachingPlansNote = false;
  if (
    data.planToTeach &&
    !data.planToTeach.includes('Yes, I plan to teach this course this year')
  ) {
    showTeachingPlansNote = true;
  }

  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.chooseYourProgram}>
        <FormGroup>
          <h3>Section 3: {SectionHeaders.chooseYourProgram}</h3>
          <LabeledRadioButtons name="program" />
          {data.program === PROGRAM_CSD && (
            <LabeledCheckBoxes name="csdWhichGrades" />
          )}

          {data.program === PROGRAM_CSP && (
            <div>
              <LabeledCheckBoxes name="cspWhichGrades" />
              <LabeledRadioButtons name="cspHowOffer" />
            </div>
          )}
          <p>
            <strong>Course hours =</strong> (number of minutes of one class){' '}
            <strong> X </strong> (number of days per week the class will be
            offered) <strong> X </strong> (number of weeks with the class)
          </p>
          <br />
          <LabeledNumberInput
            name="csHowManyMinutes"
            style={{
              width: '100px'
            }}
            label={PageLabels.chooseYourProgram.csHowManyMinutes.replace(
              'program',
              getNameForSelectedProgram()
            )}
            labelWidth={{md: 8}}
            controlWidth={{md: 4}}
            inlineControl={true}
          />
          <LabeledNumberInput
            name="csHowManyDaysPerWeek"
            style={{
              width: '100px'
            }}
            label={PageLabels.chooseYourProgram.csHowManyDaysPerWeek.replace(
              'program',
              getNameForSelectedProgram()
            )}
            labelWidth={{md: 8}}
            controlWidth={{md: 4}}
            inlineControl={true}
          />
          <LabeledNumberInput
            name="csHowManyWeeksPerYear"
            style={{
              width: '100px'
            }}
            label={PageLabels.chooseYourProgram.csHowManyWeeksPerYear.replace(
              'program',
              getNameForSelectedProgram()
            )}
            labelWidth={{md: 8}}
            controlWidth={{md: 4}}
            inlineControl={true}
          />
          {courseHours && (
            <div style={{marginBottom: 30}}>
              <Row>
                <Col md={8}>
                  <div style={{textAlign: 'right'}}>
                    <strong>Course hours</strong>
                  </div>
                </Col>
                <Col md={4}>
                  <strong>{courseHours.toFixed(2)}</strong>
                </Col>
              </Row>
            </div>
          )}
          {belowMinCourseHours && (
            <p style={{color: 'red'}}>
              Note: {minCourseHours} or more hours of instruction per CS{' '}
              {getNameForSelectedProgram()} section are strongly recommended. We
              suggest checking with your school administration to see if
              additional time can be allotted for this course in {YEAR}.
            </p>
          )}

          {data.program === PROGRAM_CSD && (
            <LabeledCheckBoxes name="csdWhichUnits" />
          )}
          {data.program === PROGRAM_CSP && (
            <LabeledCheckBoxes name="cspWhichUnits" />
          )}
          <LabeledRadioButtonsWithAdditionalTextFields
            name="planToTeach"
            textFieldMap={{
              [TextFields.dontKnowIfIWillTeachExplain]: 'other'
            }}
          />

          {showTeachingPlansNote && (
            <p style={styles.error}>
              Note: This program is designed to work best for teachers who are
              teaching this course in the {YEAR} school year. Scholarship
              eligibility is dependent on whether or not you will be teaching
              the course during the {YEAR} school year.
            </p>
          )}
          <LabeledRadioButtonsWithAdditionalTextFields
            name="replaceExisting"
            textFieldMap={{
              [TextFields.iDontKnowExplain]: 'other'
            }}
          />
          {data.replaceExisting === 'Yes' && (
            <LabeledRadioButtonsWithAdditionalTextFields
              name="replaceWhichCourse"
              textFieldMap={{
                [TextFields.iDontKnowExplain]: 'other'
              }}
            />
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
  onChange: PropTypes.func.isRequired
};

ChooseYourProgram.associatedFields = [
  ...Object.keys(PageLabels.chooseYourProgram)
];

ChooseYourProgram.getDynamicallyRequiredFields = data => {
  const requiredFields = [];

  if (data.program === PROGRAM_CSD) {
    requiredFields.push('csdWhichGrades', 'csdWhichUnits');
  }

  if (data.program === PROGRAM_CSP) {
    requiredFields.push('cspWhichGrades', 'cspWhichUnits', 'cspHowOffer');
  }

  if (data.replaceExisting === 'Yes') {
    requiredFields.push('replaceWhichCourse');
  }

  return requiredFields;
};

ChooseYourProgram.processPageData = data => {
  const changes = {};

  if (data.program === PROGRAM_CSD) {
    changes.cspWhichGrades = undefined;
    changes.cspWhichUnits = undefined;
    changes.cspHowOffer = undefined;
  }

  if (data.program === PROGRAM_CSP) {
    changes.csdWhichGrades = undefined;
    changes.csdWhichUnits = undefined;
  }

  if (data.replaceExisting !== 'Yes') {
    changes.replaceWhichCourse = undefined;
  }

  return changes;
};

ChooseYourProgram.getErrorMessages = data => {
  let formatErrors = {};
  if (
    data.csHowManyMinutes &&
    (data.csHowManyMinutes < 1 || data.csHowManyMinutes > 480)
  ) {
    formatErrors.csHowManyMinutes =
      'Class section minutes per day must be between 1 and 480';
  }

  if (
    data.csHowManyDaysPerWeek &&
    (data.csHowManyDaysPerWeek < 1 || data.csHowManyDaysPerWeek > 7)
  ) {
    formatErrors.csHowManyDaysPerWeek =
      'Class section days per week must be between 1 and 7';
  }

  if (
    data.csHowManyWeeksPerYear &&
    (data.csHowManyWeeksPerYear < 1 || data.csHowManyWeeksPerYear > 52)
  ) {
    formatErrors.csHowManyWeeksPerYear =
      'Class section weeks per year must be between 1 and 52';
  }

  return formatErrors;
};

const styles = {
  error: {
    color: color.red
  }
};

export default ChooseYourProgram;
