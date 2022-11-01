import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup} from 'react-bootstrap';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA
} from './TeacherApplicationConstants';
import {LabelsContext} from '../../form_components_func/LabeledFormComponent';
import {LabeledCheckBoxes} from '../../form_components_func/labeled/LabeledCheckBoxes';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields
} from '../../form_components_func/labeled/LabeledRadioButtons';
import {FormContext} from '../../form_components_func/FormComponent';
import {useRegionalPartner} from '../../components/useRegionalPartner';

const getProgramInfo = program => {
  switch (program) {
    case PROGRAM_CSD:
      return {name: 'CS Discoveries', shortName: 'CSD', minCourseHours: 25};
    case PROGRAM_CSP:
      return {name: 'CS Principles', shortName: 'CSP', minCourseHours: 100};
    case PROGRAM_CSA:
      return {name: 'CSA', shortName: 'CSA', minCourseHours: 140};
    default:
      return {name: 'CS Program', shortName: null, minCourseHours: 0};
  }
};

const Year = '2023-2024';

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
  showScholarshipWarning: PropTypes.bool
};

const FindYourRegion = props => {
  const {data} = props;
  const [regionalPartner] = useRegionalPartner(data);

  const programInfo = getProgramInfo(data.program);
  const isOffered = regionalPartner?.pl_programs_offered?.includes(
    programInfo.shortName
  );

  const notSureTeachPlanOption = `Not sure yet if my school plans to offer ${
    programInfo.name
  } in the ${Year} school year`;
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
  return (
    <FormContext.Provider value={props}>
      <LabelsContext.Provider value={PageLabels.findYourRegion}>
        <FormGroup>
          <h3>Section 2: {SectionHeaders.findYourRegion}</h3>
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
            label={PageLabels.chooseYourProgram.enoughCourseHours
              .replace('{{CS program}}', programInfo.name)
              .replace('{{min hours}}', programInfo.minCourseHours)}
          />

          <LabeledRadioButtonsWithAdditionalTextFields
            name="replaceExisting"
            textFieldMap={{
              [TextFields.iDontKnowExplain]: 'other'
            }}
          />
        </FormGroup>
      </LabelsContext.Provider>
    </FormContext.Provider>
  );
};

// BELOW THIS LINE MUST GET FIXED; NOT CORRECT
// FIND VARIABLE FOR YEAR FOR ABOVE

const styles = {
  error: {
    color: 'rgb(204, 0, 0)'
  },
  numberInput: {
    width: 100
  }
};

FindYourRegion.propTypes = {
  options: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorMessages: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  accountEmail: PropTypes.string.isRequired
};

FindYourRegion.associatedFields = [...Object.keys(PageLabels.aboutYou)];

FindYourRegion.getDynamicallyRequiredFields = data => {
  const requiredFields = [];

  if (data.completingOnBehalfOfSomeoneElse === 'Yes') {
    requiredFields.push('completingOnBehalfOfName');
  }

  if (data.school === '-1') {
    requiredFields.push('schoolName');
    requiredFields.push('schoolState');
    requiredFields.push('schoolZipCode');
    requiredFields.push('schoolType');
  }

  return requiredFields;
};

FindYourRegion.processPageData = data => {
  const changes = {};
  if (data.completingOnBehalfOfSomeoneElse === 'No') {
    changes.completingOnBehalfOfName = undefined;
  }
  return changes;
};
