import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Row, Col} from 'react-bootstrap';
import {
  PageLabels,
  SectionHeaders,
  TextFields,
  Year
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA
} from './TeacherApplicationConstants';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {LabeledCheckBoxes} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {LabeledNumberInput} from '../../form_components_func/labeled/LabeledInput';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {FormContext} from '../../form_components_func/FormComponent';
import {useRegionalPartner} from '../../components/useRegionalPartner';

const getProgramInfo = program => {
  switch (program) {
    case PROGRAM_CSD:
      return {name: 'CS Discoveries', shortName: 'CSD', minCourseHours: 50};
    case PROGRAM_CSP:
      return {name: 'CS Principles', shortName: 'CSP', minCourseHours: 100};
    case PROGRAM_CSA:
      return {name: 'CSA', shortName: 'CSA', minCourseHours: 140};
    default:
      return {name: 'CS Program', shortName: null, minCourseHours: 0};
  }
};

const CourseHoursLabeledNumberInput = props => {
  return (
    <LabeledNumberInput
      style={styles.numberInput}
      labelWidth={{md: 8}}
      controlWidth={{md: 4}}
      inlineControl={true}
      {...props}
    />
  );
};

const ChooseYourProgram = props => {
  const {data} = props;

  const [regionalPartner] = useRegionalPartner(data);

  const programInfo = getProgramInfo(data.program);
  const isOffered = regionalPartner?.pl_programs_offered?.includes(
    programInfo.shortName
  );

  // This should be kept consistent with the calculation logic in
  // dashboard/app/models/pd/application/teacher_application.rb.
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
  let minCourseHours = programInfo.minCourseHours;
  if (courseHours !== null && courseHours < minCourseHours) {
    belowMinCourseHours = true;
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
          <h3>Section 2: {SectionHeaders.chooseYourProgram}</h3>
          <LabeledRadioButtons name="program" />

          {data.program === PROGRAM_CSA && regionalPartner && !isOffered && (
            <p style={styles.error}>
              <strong>
                The Regional Partner in your region is not offering Computer
                Science A at this time.{' '}
              </strong>
              Code.org will review your application and contact you with options
              for joining a national cohort of Computer Science A teachers. If
              accepted into the program, travel may be required to attend a
              weeklong in-person summer workshop. If so, travel and
              accommodation will be provided by Code.org. Academic year
              workshops for the national cohort will be hosted virtually.
            </p>
          )}

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
              <LabeledRadioButtons name="csaAlreadyKnow" />
              {data.csaAlreadyKnow === 'No' && (
                <p style={styles.error}>
                  We don’t recommend this program for teachers completely new to
                  CS. If possible, consider teaching CS Principles in the
                  upcoming school year and applying for our CS Principles
                  Professional Learning program. If this is not possible, plan
                  to spend at least 40 hours learning foundational CS concepts
                  prior to attending our professional learning for CSA.
                </p>
              )}
              <LabeledRadioButtons name="csaPhoneScreen" />
              {data.csaPhoneScreen === 'No' && (
                <p style={styles.error}>
                  We recommend deepening your content knowledge prior to
                  starting this program. This can be accomplished by completing
                  some additional onboarding prior to attending the CSA
                  Professional Learning program. Your regional partner will
                  share this with you after you have been accepted into the
                  program.
                </p>
              )}
              <LabeledCheckBoxes name="csaWhichGrades" />
              <LabeledRadioButtons name="csaHowOffer" />
            </>
          )}

          <p>
            <strong>Course hours =</strong> (number of minutes of one class){' '}
            <strong> X </strong> (number of days per week the class will be
            offered) <strong> X </strong> (number of weeks with the class)
          </p>
          <p>
            Please provide information about your course implementation plans.
          </p>
          <CourseHoursLabeledNumberInput
            name="csHowManyMinutes"
            label={PageLabels.chooseYourProgram.csHowManyMinutes.replace(
              '{{CS program}}',
              programInfo.name
            )}
          />
          <CourseHoursLabeledNumberInput
            name="csHowManyDaysPerWeek"
            label={PageLabels.chooseYourProgram.csHowManyDaysPerWeek.replace(
              '{{CS program}}',
              programInfo.name
            )}
          />
          <CourseHoursLabeledNumberInput
            name="csHowManyWeeksPerYear"
            label={PageLabels.chooseYourProgram.csHowManyWeeksPerYear.replace(
              '{{CS program}}',
              programInfo.name
            )}
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
            <p style={styles.error}>
              Note: {minCourseHours} or more hours of instruction per{' '}
              {programInfo.name} section are strongly recommended. We suggest
              checking with your school administration to see if additional time
              can be allotted for this course in {Year}.
            </p>
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
              teaching this course in the {Year} school year. Scholarship
              eligibility is dependent on whether or not you will be teaching
              the course during the {Year} school year.
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
              label={PageLabels.chooseYourProgram.replaceWhichCourse.replace(
                '{{CS program}}',
                programInfo.name
              )}
              textFieldMap={{
                [TextFields.otherPleaseExplain]: 'other'
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

  if (data.replaceExisting === 'Yes') {
    requiredFields.push('replaceWhichCourse');
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
    color: 'rgb(204, 0, 0)'
  },
  numberInput: {
    width: 100
  }
};

export default ChooseYourProgram;
