import React, {PropTypes} from 'react';
import {FormGroup} from "react-bootstrap";
import Facilitator1819FormComponent from "./Facilitator1819FormComponent";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/facilitator1819ApplicationConstants';

export default class Section5YourApproachToLearningAndLeading extends Facilitator1819FormComponent {
  static propTypes = {
    ...Facilitator1819FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = PageLabels.section5YourApproachToLearningAndLeading;

  static associatedFields = [
    ...Object.keys(PageLabels.section5YourApproachToLearningAndLeading)
  ];

  largeInputFor(name, props = {}) {
    return super.largeInputFor(name, {
      rows: 6,
      maxLength: 750,
      ...props
    });
  }

  render() {
    return (
      <FormGroup>
        <h3>Section 5: {SectionHeaders.section5YourApproachToLearningAndLeading}</h3>

        {this.largeInputFor("whoShouldHaveOpportunity")}
        {this.largeInputFor("howSupportEquity")}
        {this.largeInputFor("expectedTeacherNeeds")}
        {this.largeInputFor("describeAdaptingLessonPlan")}
        {this.largeInputFor("describeStrategies")}
        {this.largeInputFor("exampleHowUsedFeedback")}
        {this.largeInputFor("exampleHowProvidedFeedback")}
        {this.largeInputFor("hopeToLearn")}
      </FormGroup>
    );
  }
}
