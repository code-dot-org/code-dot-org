import React from 'react';
import {FormGroup} from 'react-bootstrap';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/facilitatorApplicationConstants';

export default class YourApproachToLearningAndLeading extends LabeledFormComponent {
  static labels = PageLabels.yourApproachToLearningAndLeading;

  static associatedFields = [
    ...Object.keys(PageLabels.yourApproachToLearningAndLeading)
  ];

  largeInputFor(name, props = {}) {
    return super.largeInputFor(name, {
      rows: 6,
      maxLength: 1500,
      ...props
    });
  }

  render() {
    return (
      <FormGroup>
        <h3>Section 5: {SectionHeaders.yourApproachToLearningAndLeading}</h3>

        {this.largeInputFor('whyShouldAllHaveAccess')}
        {this.largeInputFor('skillsAreasToImprove')}
        {this.largeInputFor('inquiryBasedLearning')}
        {this.largeInputFor('whyInterested')}
        {this.largeInputFor('anythingElse', {required: false})}
      </FormGroup>
    );
  }
}
