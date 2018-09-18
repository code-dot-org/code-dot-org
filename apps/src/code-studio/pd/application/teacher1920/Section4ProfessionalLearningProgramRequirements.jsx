import React from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {FormGroup} from 'react-bootstrap';

export default class Section4ProfessionalLearningProgramRequirements extends LabeledFormComponent {
  static labels = PageLabels.section4ProfessionalLearningProgramRequirements;

  static associatedFields = [
    ...Object.keys(PageLabels.section4ProfessionalLearningProgramRequirements)
  ];

  render() {
    return (
      <FormGroup>
        <h3>
          Section 4: {SectionHeaders.section4ProfessionalLearningProgramRequirements}
        </h3>
        <p>
          Teachers in this program are required to participate in both:
        </p>
        <ul>
          <li>
            One five-day, in-person summer workshop in 2019
          </li>
          <li>
            Up to four one-day, in-person local workshops during the 2019-20 school year
            (typically held on Saturdays)
          </li>
        </ul>
        {this.radioButtonsWithAdditionalTextFieldsFor('committed', {
          [TextFields.noExplain]: 'other'
        })}
        <p>
          Your application has been assigned to a program hosted by one of our Regional
          Partners based on your geographic location. There may be a fee associated with
          the program in your region. There also may be scholarships available to help
          cover the cost of the program. You can{' '}
          <a href="https://code.org/educate/professional-learning/program-information" target="_blank">
            check this page
          </a>
          {' '}to see if there are fees and/or scholarships available in your region.
        </p>
        {this.radioButtonsFor('payFee')}
        {this.props.data.payFee === TextFields.noPayFee1920 && this.largeInputFor('scholarshipReasons')}
        {this.radioButtonsFor('willingToTravel')}
        We may offer online academic year workshops for those unable to travel to their local academic year workshops. Important notes.
        <ol>
          <li>
            The online option for academic year workshops is not guaranteed - we are
            piloting this option now, and considering the effectiveness of this method
            before rolling it out large-scale.
          </li>
          <li>
            An online option for the five-day summer workshop does not currently exist -
            all participants accepted to the Professional Learning Program will need to
            commit to attending the five-day summer workshop in-person.
          </li>
        </ol>
        {this.radioButtonsFor('interestedInOnlineProgram')}
      </FormGroup>
    );
  }
}
