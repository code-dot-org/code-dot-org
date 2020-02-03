import React from 'react';
import {FormGroup} from 'react-bootstrap';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitatorApplicationConstants';

export default class Submission extends LabeledFormComponent {
  static labels = {
    ...PageLabels.submission,
    ...PageLabels.aboutYou
  };

  static associatedFields = [
    ...Object.keys(PageLabels.submission),
    'genderIdentity',
    'race'
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 6: {SectionHeaders.submission}</h3>
        {this.radioButtonsFor('genderIdentity')}
        {this.checkBoxesFor('race')}
        {this.checkBoxesWithAdditionalTextFieldsFor(
          'howHeard',
          {
            [TextFields.howHeardFacilitator]: 'facilitator',
            [TextFields.howHeardCodeOrgStaff]: 'codeOrgStaff',
            [TextFields.howHeardRegionalPartner]: 'regionalPartner',
            [TextFields.otherWithText]: 'other'
          },
          {
            required: false
          }
        )}
        Code.org works closely with local Regional Partners to organize and
        deliver the Facilitator Development Program. If accepted to the program,
        you agree to allow Code.org to share your workshop performance and
        program participation data with the Regional Partner. If you use this
        program in your classroom, you also agree to allow Code.org to share
        information on how you use Code.org and the Professional Learning
        resources with your Regional Partner and school district. We will share
        your contact information, which courses/units you are using in your
        classrooms and aggregate data about your classes. This includes the
        number of students in your classes, the demographic breakdown of your
        classroom, and the name of your school and district. We will not share
        any information about individual students with our Regional Partners -
        all information will be anonymized and aggregated. Our Regional Partners
        are contractually obliged to treat this information with the same level
        of confidentiality as Code.org.
        {this.singleCheckboxFor('agree')}
      </FormGroup>
    );
  }
}
