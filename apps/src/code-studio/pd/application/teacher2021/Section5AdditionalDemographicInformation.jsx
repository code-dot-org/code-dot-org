import React from 'react';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher2021ApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import PrivacyDialog from '../PrivacyDialog';
import {PrivacyDialogMode} from '../../constants';

export default class Section5AdditionalDemographicInformation extends LabeledFormComponent {
  static labels = PageLabels.section5AdditionalDemographicInformation;

  static associatedFields = [
    ...Object.keys(PageLabels.section5AdditionalDemographicInformation)
  ];

  state = {
    isPrivacyDialogOpen: false
  };

  openPrivacyDialog = event => {
    // preventDefault so clicking this link inside the label doesn't
    // also check the checkbox.
    event.preventDefault();
    this.setState({isPrivacyDialogOpen: true});
  };

  handleClosePrivacyDialog = () => {
    this.setState({isPrivacyDialogOpen: false});
  };

  render() {
    return (
      <FormGroup>
        <h3>
          Section 5: {SectionHeaders.section5AdditionalDemographicInformation}
        </h3>
        {this.radioButtonsFor('genderIdentity')}
        {this.checkBoxesFor('race')}
        {this.checkBoxesWithAdditionalTextFieldsFor(
          'howHeard',
          {
            [TextFields.otherWithText]: 'other'
          },
          {
            required: false
          }
        )}

        <label className="control-label">Submit your application</label>
        {this.singleCheckboxFor('agree', {
          label: (
            <span>
              {this.labelFor('agree')}{' '}
              <a onClick={this.openPrivacyDialog}>Learn more.</a>
            </span>
          )
        })}
        <PrivacyDialog
          show={this.state.isPrivacyDialogOpen}
          onHide={this.handleClosePrivacyDialog}
          mode={PrivacyDialogMode.TEACHER_APPLICATION}
        />
      </FormGroup>
    );
  }
}
