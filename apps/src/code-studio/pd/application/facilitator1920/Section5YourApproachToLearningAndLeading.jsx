import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';

export default class Section5YourApproachToLearningAndLeading extends LabeledFormComponent {
  static labels = PageLabels.section5YourApproachToLearningAndLeading;

  static associatedFields = [
    ...Object.keys(PageLabels.section5YourApproachToLearningAndLeading)
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
        <h3>Section 5: {SectionHeaders.section5YourApproachToLearningAndLeading}</h3>

        {this.largeInputFor("whyShouldAllHaveAccess")}
        {this.largeInputFor("skillsAreasToImprove")}
        {this.largeInputFor("inquiryBasedLearning")}
        {this.largeInputFor("whyInterested")}
        {this.largeInputFor("anythingElse", {required: false})}
      </FormGroup>
    );
  }
}
