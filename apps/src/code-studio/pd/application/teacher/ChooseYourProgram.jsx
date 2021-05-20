import React from 'react';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {FormGroup, Row, Col} from 'react-bootstrap';
import {PROGRAM_CSD, PROGRAM_CSP, YEAR} from './TeacherApplicationConstants';
import color from '@cdo/apps/util/color';

const MIN_CSD_HOURS = 50;
const MIN_CSP_HOURS = 100;

export default class ChooseYourProgram extends LabeledFormComponent {
  static labels = PageLabels.chooseYourProgram;

  static associatedFields = [...Object.keys(PageLabels.chooseYourProgram)];

  getNameForSelectedProgram() {
    if (this.props.data.program === PROGRAM_CSD) {
      return 'Discoveries';
    } else if (this.props.data.program === PROGRAM_CSP) {
      return 'Principles';
    } else {
      return 'Program';
    }
  }

  render() {
    // This should be kept consistent with the calculation logic in
    // dashboard/app/models/pd/application/teacher2122_application.rb.
    const csHowManyMinutes = parseInt(this.props.data.csHowManyMinutes, 10);
    const csHowManyDaysPerWeek = parseInt(
      this.props.data.csHowManyDaysPerWeek,
      10
    );
    const csHowManyWeeksPerYear = parseInt(
      this.props.data.csHowManyWeeksPerYear,
      10
    );
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
    let program = this.props.data.program;
    let minCourseHours =
      program && program.includes('Discoveries')
        ? MIN_CSD_HOURS
        : MIN_CSP_HOURS;
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
      this.props.data.planToTeach &&
      !this.props.data.planToTeach.includes(
        'Yes, I plan to teach this course this year'
      )
    ) {
      showTeachingPlansNote = true;
    }

    return (
      <FormGroup>
        <h3>Section 3: {SectionHeaders.chooseYourProgram}</h3>
        {this.radioButtonsFor('program')}
        {this.props.data.program === PROGRAM_CSD &&
          this.checkBoxesFor('csdWhichGrades')}
        {this.props.data.program === PROGRAM_CSP && (
          <div>
            {this.checkBoxesFor('cspWhichGrades')}
            {this.radioButtonsFor('cspHowOffer')}
          </div>
        )}
        <p>
          <strong>Course hours =</strong> (number of minutes of one class){' '}
          <strong> X </strong> (number of days per week the class will be
          offered) <strong> X </strong> (number of weeks with the class)
        </p>
        <br />
        {this.numberInputFor('csHowManyMinutes', {
          style: {
            width: '100px'
          },
          label: PageLabels.chooseYourProgram.csHowManyMinutes.replace(
            'program',
            this.getNameForSelectedProgram()
          ),
          labelWidth: {md: 8},
          controlWidth: {md: 4},
          inlineControl: true
        })}
        {this.numberInputFor('csHowManyDaysPerWeek', {
          style: {
            width: '100px'
          },
          label: PageLabels.chooseYourProgram.csHowManyDaysPerWeek.replace(
            'program',
            this.getNameForSelectedProgram()
          ),
          labelWidth: {md: 8},
          controlWidth: {md: 4},
          inlineControl: true
        })}
        {this.numberInputFor('csHowManyWeeksPerYear', {
          style: {
            width: '100px'
          },
          label: PageLabels.chooseYourProgram.csHowManyWeeksPerYear.replace(
            'program',
            this.getNameForSelectedProgram()
          ),
          labelWidth: {md: 8},
          controlWidth: {md: 4},
          inlineControl: true
        })}
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
            {this.getNameForSelectedProgram()} section are strongly recommended.
            We suggest checking with your school administration to see if
            additional time can be allotted for this course in {YEAR}.
          </p>
        )}
        {this.props.data.program === PROGRAM_CSD &&
          this.checkBoxesFor('csdWhichUnits')}
        {this.props.data.program === PROGRAM_CSP &&
          this.checkBoxesFor('cspWhichUnits')}
        {this.radioButtonsWithAdditionalTextFieldsFor('planToTeach', {
          [TextFields.dontKnowIfIWillTeachExplain]: 'other'
        })}

        {showTeachingPlansNote && (
          <p style={styles.error}>
            Note: This program is designed to work best for teachers who are
            teaching this course in the {YEAR} school year. Scholarship
            eligibility is dependent on whether or not you will be teaching the
            course during the {YEAR} school year.
          </p>
        )}
        {this.radioButtonsWithAdditionalTextFieldsFor('replaceExisting', {
          [TextFields.iDontKnowExplain]: 'other'
        })}
        {this.props.data.replaceExisting === 'Yes' &&
          this.checkBoxesWithAdditionalTextFieldsFor('replaceWhichCourse', {
            [TextFields.otherPleaseExplain]: 'other'
          })}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
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
  }

  /**
   * @override
   */
  static processPageData(data) {
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
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
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
  }
}

const styles = {
  error: {
    color: color.red
  }
};
