import React  from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import {PROGRAM_CSD, PROGRAM_CSP} from "./TeacherApplicationConstants";

export default class Section2ChooseYourProgram extends LabeledFormComponent {
  static labels = PageLabels.section2ChooseYourProgram;

  static associatedFields = [
    ...Object.keys(PageLabels.section2ChooseYourProgram),
  ];

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
    return (
      <FormGroup>
        <h3>Section 2: {SectionHeaders.section2ChooseYourProgram}</h3>
        {this.radioButtonsFor('program')}
        {
          this.props.data.program === PROGRAM_CSD && (
            <div>
              {this.checkBoxesFor('csdWhichGrades')}
              <p>
                For teachers to participate in Code.org’s CS Discoveries Professional
                Learning Program, we require that you offer at minimum 50 instructional
                hours per section of students for a semester-long course (Units 1 - 3), and
                at minimum 100 hours for a year-long course (Units 1-  6). We assume a
                typical school year consists of 180 days (36 weeks) and a typical semester
                consists of 18 weeks.
              </p>
            </div>
          )
        }
        {
          this.props.data.program === PROGRAM_CSP && (
            <div>
              {this.checkBoxesFor('cspWhichGrades')}
              {this.radioButtonsFor('cspHowOffer')}
              <p>
                For teachers to participate in Code.org’s CS Principles Professional
                Learning Program, we require that you offer at a minimum 100 instructional
                hours per section of students for the full-year course. CS Principles is
                not designed to be taught as a semester unless you are able to offer 100
                hours of the course in one semester (usually in a block schedule format).
                We assume a typical school year consists of 180 days (36 weeks).
              </p>
            </div>
          )
        }
        <p>
          <strong>Course hours =</strong> (number of minutes of one
          class) <strong> X </strong> (number of days per week the class will be
          offered) <strong> X </strong> (number of weeks with the class)
        </p>
        <p>
          Please provide information about your course implementation plans.{' '}
          <a href="https://docs.google.com/document/d/1nFp033SuO_BMR-Bkinrlp0Ti_s-XYQDsOc-UjqNdrGw/edit#heading=h.6s62vrpws18" target="_blank">
            Click here
          </a> for guidance on required number of hours. Your Regional Partner will
          follow up if your responses below don't meet the requirements, or if they have
          additional questions.
        </p>
        {this.inputFor('csHowManyMinutes', {
          style: {
            width: '100px',
          },
          label: PageLabels.section2ChooseYourProgram.csHowManyMinutes.replace('program', this.getNameForSelectedProgram())
        })}
        {this.inputFor('csHowManyDaysPerWeek', {
          style: {
            width: '100px',
          },
          label: PageLabels.section2ChooseYourProgram.csHowManyDaysPerWeek.replace('program', this.getNameForSelectedProgram())
        })}
        {this.inputFor('csHowManyWeeksPerYear', {
          style: {
            width: '100px',
          },
          label: PageLabels.section2ChooseYourProgram.csHowManyWeeksPerYear.replace('program', this.getNameForSelectedProgram())
        })}
        {this.radioButtonsWithAdditionalTextFieldsFor('csTerms', {
          [TextFields.otherWithText]: "other"
        }, {
          label: PageLabels.section2ChooseYourProgram.csTerms.replace('program', this.getNameForSelectedProgram())
        })}
        {this.radioButtonsWithAdditionalTextFieldsFor('planToTeach', {
          [TextFields.dontKnowIfIWillTeachExplain]: "other"
        })}
        {this.radioButtonsWithAdditionalTextFieldsFor('replaceExisting', {
          [TextFields.iDontKnowExplain]: "other"
        })}
        {this.props.data.replaceExisting === 'Yes' && this.largeInputFor('replaceWhichCourse')}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.program === PROGRAM_CSD) {
      requiredFields.push(
        'csdWhichGrades'
      );
    }

    if (data.program === PROGRAM_CSP) {
      requiredFields.push(
        'cspWhichGrades',
        'cspHowOffer'
      );
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
      changes.cspHowOffer = undefined;
    }

    if (data.program === PROGRAM_CSP) {
      changes.csdWhichGrades = undefined;
    }

    if (data.replaceExisting !== 'Yes') {
      changes.replaceWhichCourse = undefined;
    }

    return changes;
  }
}
