import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup} from 'react-bootstrap';
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

const TeachingPlansNote = () => {
  return (
    <p style={styles.error}>
      Note: This program is designed to work best for teachers who are teaching
      this course in the {Year} school year. Scholarship eligibility is
      dependent on whether or not you will be teaching the course during the{' '}
      {Year} school year.
    </p>
  );
};

const ChooseYourProgram = props => {
  const {data} = props;

  const [regionalPartner] = useRegionalPartner(data);

  const programInfo = getProgramInfo(data.program);
  const isOffered = regionalPartner?.pl_programs_offered?.includes(
    programInfo.shortName
  );

  let showTeachingPlansNote = false;
  const notSureTeachPlanOption = `Not sure yet if my school plans to offer ${
    programInfo.name
  } in the ${Year} school year`;
  if (
    (data.csdWhichGrades &&
      data.csdWhichGrades.includes(notSureTeachPlanOption)) ||
    (data.cspWhichGrades &&
      data.cspWhichGrades.includes(notSureTeachPlanOption)) ||
    (data.csaWhichGrades &&
      data.csaWhichGrades.includes(notSureTeachPlanOption))
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
            <>
              <LabeledCheckBoxes name="csdWhichGrades" />
              {showTeachingPlansNote && <TeachingPlansNote />}
            </>
          )}

          {data.program === PROGRAM_CSP && (
            <>
              <LabeledCheckBoxes name="cspWhichGrades" />
              {showTeachingPlansNote && <TeachingPlansNote />}
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
              {showTeachingPlansNote && <TeachingPlansNote />}
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

const styles = {
  error: {
    color: 'rgb(204, 0, 0)'
  },
  numberInput: {
    width: 100
  }
};

export default ChooseYourProgram;
