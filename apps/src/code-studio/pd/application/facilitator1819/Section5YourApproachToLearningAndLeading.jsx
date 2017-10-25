import React, {PropTypes} from 'react';
import {FormGroup} from "react-bootstrap";
import Facilitator1819FormComponent from "./Facilitator1819FormComponent";
import {pageLabels} from './Facilitator1819Labels';

export default class Section5YourApproachToLearningAndLeading extends Facilitator1819FormComponent {
  static propTypes = {
    ...Facilitator1819FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = pageLabels.Section5YourApproachToLearningAndLeading;

  static associatedFields = [
    ...Object.keys(pageLabels.Section5YourApproachToLearningAndLeading)
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
        <h3>Section 5: Your Approach to Learning and Leading</h3>

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
