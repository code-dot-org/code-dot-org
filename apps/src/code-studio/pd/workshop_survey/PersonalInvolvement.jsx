import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import FormComponent from '../form_components/FormComponent';

const LABELS = {
  howMuchParticipated: 'During your workshop, how much did you participate?',
  howOftenTalkAboutIdeasOutside:
    'When you are not in workshops about the Code.org {course} curriculum how often do you talk about the ideas from the workshops?',
  howOftenLostTrackOfTime:
    'How often did you get so focused on {course} workshop activities that you lost track of time?',
  howExcitedBefore:
    'Before the workshop, how excited were you about going to your {course} workshop?',
  overallHowInterested:
    'Overall, how interested were you in the {course} in-person workshop?',
};

export default class PersonalInvolvement extends FormComponent {
  labelFor(name) {
    return LABELS[name].replace('{course}', this.props.course);
  }

  render() {
    return (
      <FormGroup>
        {Object.keys(LABELS).map(name =>
          this.buildButtonsFromOptions({
            label: this.labelFor(name),
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
