import React from 'react';
import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';

import FormComponent from '../form_components/FormComponent';

export default class DayOneQuestions extends FormComponent {
  render() {
    return (
      <FormGroup>
        <FormGroup>
          <ControlLabel>Please rate your level of agreement with each statement below.</ControlLabel>
          {this.buildButtonsFromOptions({
            name: 'personalLearningNeedsMet',
            label: "I feel that my personal learning needs were met today.",
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: "clearUnderstandingOfPlan",
            label: "I have a clear understanding of the plan for the week.",
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: "provideExplanationOfFramework",
            label: "I can provide an explanation of how the framework was interpreted when the course was being built.",
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: "feelMorePrepared",
            label: "I feel more prepared to teach CS Principles than I did at the beginning of the day.",
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: "activitiesAsLearnerHelped",
            label: "Experiencing activities as a learner in model lessons helped me understand how to make the course material personally relevant to my students.",
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: "understandElementsOfPlan",
            label: "I understand the elements of a CS Principles lesson plan well enough to prepare to teach from those materials.",
            type: 'radio'
          })}
        </FormGroup>
      </FormGroup>
    );
  }
}

DayOneQuestions.associatedFields = [
  "personalLearningNeedsMet",
  "clearUnderstandingOfPlan",
  "provideExplanationOfFramework",
  "feelMorePrepared",
  "activitiesAsLearnerHelped",
  "understandElementsOfPlan",
];

