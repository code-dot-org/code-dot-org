import React, {PropTypes} from 'react';
import {FormGroup} from 'react-bootstrap';
import VariableFormGroup from './VariableFormGroup';
import FormComponent from '../form_components/FormComponent';

export default class WorkshopQuality extends FormComponent {
  render() {
    return (
      <FormGroup>
        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: `Will you be teaching/are you teaching ${this.props.course} ${this.props.subject || ''} in the 2016-17 school year?`,
            name: "willTeach",
            type: 'radio',
            inline: true
          })
        }
        {this.props.data.willTeach &&
          this.props.data.willTeach === "No" &&
          this.buildFieldGroup({
            label: "Please explain why not.",
            name: "willNotTeachExplanation",
            type: "text",
            required: true
          })
        }

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: "Reason for attending? (select all that apply)",
            name: "reasonForAttending",
            type: 'check'
          })
        }
        {this.props.data.reasonForAttending &&
          this.props.data.reasonForAttending.includes("Other") &&
          this.buildFieldGroup({
            label: "Other reason?",
            name: "reasonForAttendingOther",
            type: "text",
          })
        }

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: "How did you hear about this workshop? (select all that apply)",
            name: "howHeard",
            type: 'check'
          })
        }
        {this.props.data.howHeard &&
          this.props.data.howHeard.includes("Other") &&
          this.buildFieldGroup({
            label: "Other source?",
            name: "howHeardOther",
            type: "text",
          })
        }

        {this.buildButtonsFromOptions({
          label: "I received clear communication about when and where the workshop would take place",
          name: "receivedClearCommunication",
          type: 'radio'
        })}

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: `
              Do you believe your school has the technology requirements (modern web browsers/sufficient
              internet access/1:1 computing environment) necessary to effectively teach the course?
            `,
            name: "schoolHasTech",
            type: 'radio'
          })
        }

        {this.buildFieldGroup({
          componentClass: "textarea",
          label: "Do you have feedback about the venue and the way logistics were run for this workshop? Please be specific and provide suggestions for improvement.",
          name: "venueFeedback",
          required: true,
        })}

        {this.buildButtonsFromOptions({
          label: "Overall, how much have you learned about computer science from your workshop?",
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
            required: true,
            values: this.props.options.howClearlyPresented
          }, {
            label: 'How interesting did your facilitator make what you learned in the workshop?',
            name: 'howInteresting',
            type: 'radio',
            required: true,
            values: this.props.options.howInteresting
          }, {
            label: 'How often did your facilitator give you feedback that helped you learn?',
            name: 'howOftenGivenFeedback',
            type: 'radio',
            required: true,
            values: this.props.options.howOftenGivenFeedback
          }, {
            label: 'When you needed extra help, how good was your facilitator at giving you that help?',
            name: 'helpQuality',
            type: 'radio',
            required: true,
            values: this.props.options.helpQuality
          }, {
            label: 'How comfortable were you asking your facilitator questions about what you were learning in his or her workshop?',
            name: 'howComfortableAskingQuestions',
            type: 'radio',
            required: true,
            values: this.props.options.howComfortableAskingQuestions
          }, {
            label: "How often did your facilitator teach you things that you didn't know before taking this workshop?",
            name: 'howOftenTaughtNewThings',
            type: 'radio',
            required: true,
            values: this.props.options.howOftenTaughtNewThings
          }]}

          rowVariableQuestions={[{
            label: "What were two things {value} did well?",
            name: 'thingsFacilitatorDidWell',
            type: 'free_response',
            required: true
          }, {
            label: "What were two things {value} could do better?",
            name: 'thingsFacilitatorCouldImprove',
            type: 'free_response',
            required: true
          }]}
        />
      </FormGroup>
    );
  }
}

WorkshopQuality.propTypes = {
  ...FormComponent.propTypes,
  facilitatorNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
};

WorkshopQuality.associatedFields = [
  "willTeach",
  "willNotTeachExplanation",
  "reasonForAttending",
  "reasonForAttendingOther",
  "howHeard",
  "howHeardOther",
  "receivedClearCommunication",
  "schoolHasTech",
  "venueFeedback",
  "howMuchLearned",
  "howMotivating",
  "whoFacilitated",
  "howClearlyPresented",
  "howInteresting",
  "howOftenGivenFeedback",
  "helpQuality",
  "howComfortableAskingQuestions",
  "howOftenTaughtNewThings",
  "thingsFacilitatorDidWell",
  "thingsFacilitatorCouldImprove",
];
