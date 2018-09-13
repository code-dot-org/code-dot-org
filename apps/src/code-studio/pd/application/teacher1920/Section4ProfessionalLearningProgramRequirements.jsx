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
          <a href="https://code.org/educate/regional-partner/summer-workshop-fee" target="_blank">
            check this page
          </a>
          {' '}to see if there are fees and/or scholarships available in your region.
        </p>
        {this.radioButtonsFor('payFee')}
        {this.largeInputFor('scholarshipReasons')}
        {this.radioButtonsFor('willingToTravel')}
        {/* TODO (mehal): online question goes here*/}
      </FormGroup>
    );
  }
}
