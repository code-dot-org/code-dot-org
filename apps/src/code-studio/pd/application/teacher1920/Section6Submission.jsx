import React from 'react';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {FormGroup} from 'react-bootstrap';
import PrivacyDialog from './PrivacyDialog';

export default class Section6Submission extends LabeledFormComponent {
  static labels = PageLabels.section6Submission;

  static associatedFields = [...Object.keys(PageLabels.section6Submission)];

  handleAgreeChange = event => {
    this.handleChange({
      agree: event.target.checked
    });
  };

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
      <div>
        <FormGroup>
          <h3>Section 6: {SectionHeaders.section6Submission}</h3>

          {this.singleCheckboxFor('agree', {
            label: (
              <span>
                {this.labelFor('agree')}{' '}
                <a onClick={this.openPrivacyDialog}>Learn more.</a>
              </span>
            )
          })}
        </FormGroup>
        <PrivacyDialog
          show={this.state.isPrivacyDialogOpen}
          onHide={this.handleClosePrivacyDialog}
        />
      </div>
    );
  }
}
