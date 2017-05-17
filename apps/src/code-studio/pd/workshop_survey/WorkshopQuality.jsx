import React from 'react';
import {FormGroup} from 'react-bootstrap';
import VariableFormGroup from './VariableFormGroup';
import FormComponent from '../form_components/FormComponent';

export default class WorkshopQuality extends FormComponent {
  render() {
    return (
      <FormGroup>
        {this.buildButtonsFromOptions({
          label: "I received clear communication about when and where the workshop would take place",
          name: "receivedClearCommunication",
          type: 'radio'
        })}
        {this.buildFieldGroup({
          componentClass: "textarea",
          label: "Do you have feedback about the venue and the way logistics were run for this workshop? Please be specific and provide suggestions for improvement.",
          name: "feedbackVenueLogistics",
          required: true,
        })}
        {this.buildButtonsFromOptions({
          label: "Overall, how much have you learned from your workshop about computer science?",
          name: "howMuchLearned",
          type: 'radio'
        })}
        {this.buildButtonsFromOptions({
          label: "During your workshop, how motivating were the activities that this program had you do?",
          name: "howMotivating",
          type: 'radio'
        })}

        <VariableFormGroup
          sourceName="whoFacilitated"
          sourceLabel="Who facilitated your workshop today? (check at least one)"
          sourceValues={this.props.facilitatorNames}

          onChange={this.handleChange}
          data={this.props.data}
          errors={this.props.errors}

          columnVariableQuestions={[{
            label: 'For this workshop, how clearly did your facilitator present the information that you needed to learn?',
            name: 'howClearlyPresented',
            type: 'radio',
            values: this.props.options.howClearlyPresented
          }, {
            label: 'How interesting did your facilitator make what you learned in the workshop?',
            name: 'howInteresting',
            type: 'radio',
            values: this.props.options.howInteresting
          }, {
            label: 'How often did your facilitator give you feedback that helped you learn?',
            name: 'howOftenGivenFeedback',
            type: 'radio',
            values: this.props.options.howOftenGivenFeedback
          }, {
            label: 'When you needed extra help, how good was your facilitator at giving you that help?',
            name: 'helpQuality',
            type: 'radio',
            values: this.props.options.helpQuality
          }, {
            label: 'How comfortable were you asking your facilitator questions about what you were learning in his or her workshop?',
            name: 'howComfortableAskingQuestions',
            type: 'radio',
            values: this.props.options.howComfortableAskingQuestions
          }, {
            label: "How often did your facilitator teach you things that you didn't know before taking this workshop?",
            name: 'howOftenTaughtNewThings',
            type: 'radio',
            values: this.props.options.howOftenTaughtNewThings
          }]}

          rowVariableQuestions={[{
            label: "What were two things {value} did well?",
            name: 'thingsFacilitatorDidWell',
            type: 'free_response',
          }, {
            label: "What were two things {value} could do better?",
            name: 'thingsFacilitatorCouldImprove',
            type: 'free_response',
          }]}
        />
      </FormGroup>
    );
  }
}

WorkshopQuality.propTypes = {
  ...FormComponent.propTypes,
  facilitatorNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

WorkshopQuality.associatedFields = [
  "receivedClearCommunication",
  "feedbackVenueLogistics",
  "howMuchLearned",
  "howMotivating",
  "whoFacilitated"
];
