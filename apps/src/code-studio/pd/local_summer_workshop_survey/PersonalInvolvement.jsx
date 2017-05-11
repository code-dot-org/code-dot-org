import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';

const LABELS = {
  "howMuchParticipated": "During your workshop, how much did you participate?",
  "howOftenTalkAboutIdeasOutside": "When you are not in workshops on the Code.org CS Principles curriculum how often do you talk about the ideas from the workshops?",
  "howOftenLostTrackOfTime": "How often did you get so focused on CS Principles workshop activities that you lost track of time?",
  "howExcitedBefore": "Before the workshop, how excited were you about going to your CS Principles workshop?",
  "overallHowInterested": "Overall, how interested were you in the CS Principles in-person workshop?",
};

export default class PersonalInvolvement extends FormComponent {
  render() {
    console.log("rendering");
    return (
      <FormGroup>
        {Object.keys(LABELS).map(name =>
          this.buildButtonsFromOptions({
            label: LABELS[name],
            name: name,
            required: true,
            type: 'radio',
          })
        )}
      </FormGroup>
    );
  }
}

PersonalInvolvement.associatedFields = Object.keys(LABELS);
