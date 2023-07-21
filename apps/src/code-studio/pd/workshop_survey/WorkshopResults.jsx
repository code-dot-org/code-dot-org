import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import FormComponent from '../form_components/FormComponent';

const BUTTON_LABELS = {
  morePreparedThanBefore:
    'I feel more prepared to teach the material covered in this workshop than before I came.',
  knowWhereToGoForHelp:
    'I know where to go if I need help preparing to teach this material.',
  suitableForMyExperience:
    'This professional development was suitable for my level of experience with teaching {course}.',
  wouldRecommend: 'I would recommend this professional development to others.',

  anticipateContinuing:
    'I look forward to continuing my {course} training throughout the year.',
  confidentCanTeach:
    'I feel confident I can teach this course to my students this year.',
  believeAllStudents: 'I believe all students should take AP {course}.',

  bestPdEver:
    "This was the absolute best professional development I've ever participated in.",
  partOfCommunity:
    'I feel more connected to the community of computer science teachers after this workshop.',
};

export default class WorkshopResults extends FormComponent {
  labelFor(name) {
    return BUTTON_LABELS[name].replace('{course}', this.props.course);
  }

  render() {
    return (
      <FormGroup>
        {this.buildButtonsFromOptions({
          label: this.labelFor('morePreparedThanBefore'),
          name: 'morePreparedThanBefore',
          required: true,
          type: 'radio',
        })}
        {this.buildButtonsFromOptions({
          label: this.labelFor('knowWhereToGoForHelp'),
          name: 'knowWhereToGoForHelp',
          required: true,
          type: 'radio',
        })}
        {this.buildButtonsFromOptions({
          label: this.labelFor('suitableForMyExperience'),
          name: 'suitableForMyExperience',
          required: true,
          type: 'radio',
        })}
        {this.buildButtonsFromOptions({
          label: this.labelFor('wouldRecommend'),
          name: 'wouldRecommend',
          required: true,
          type: 'radio',
        })}

        {this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: this.labelFor('anticipateContinuing'),
            name: 'anticipateContinuing',
            required: true,
            type: 'radio',
          })}
        {this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: this.labelFor('confidentCanTeach'),
            name: 'confidentCanTeach',
            required: true,
            type: 'radio',
          })}
        {this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label: this.labelFor('believeAllStudents'),
            name: 'believeAllStudents',
            required: true,
            type: 'radio',
          })}

        {this.buildButtonsFromOptions({
          label: this.labelFor('bestPdEver'),
          name: 'bestPdEver',
          required: true,
          type: 'radio',
        })}
        {this.buildButtonsFromOptions({
          label: this.labelFor('partOfCommunity'),
          name: 'partOfCommunity',
          required: true,
          type: 'radio',
        })}

        {this.buildFieldGroup({
          componentClass: 'textarea',
          label:
            'What were the two things you liked most about the activities you did in this workshop and why?',
          name: 'thingsYouLiked',
          required: true,
        })}
        {this.buildFieldGroup({
          componentClass: 'textarea',
          label:
            'What are the two things you would change about the activities you did in this workshop? How would you improve them for future participants?',
          name: 'thingsYouWouldChange',
          required: true,
        })}
        {this.buildFieldGroup({
          componentClass: 'textarea',
          label:
            'Is there anything else you’d like to tell us about your experience at this workshop?',
          name: 'anythingElse',
          required: false,
        })}

        {!this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label:
              'Would you be willing to talk to someone at Code.org about your PD experiences?',
            name: 'willingToTalk',
            required: true,
            type: 'radio',
          })}
        {this.props.data.willingToTalk &&
          this.props.data.willingToTalk === 'Yes' &&
          this.buildFieldGroup({
            label: 'Please provide the best method for contacting you.',
            name: 'howToContact',
            required: true,
            type: 'text',
          })}

        {this.props.isLocalSummer &&
          this.buildButtonsFromOptions({
            label:
              'I give Code.org permission to quote my written feedback from today for use on social media, promotional materials, and other communications. (We love sharing what our teachers think about us!)',
            name: 'givePermissionToQuote',
            required: true,
            type: 'radio',
          })}
      </FormGroup>
    );
  }
}

WorkshopResults.associatedFields = Object.keys(BUTTON_LABELS).concat([
  'thingsYouLiked',
  'thingsYouWouldChange',
  'anythingElse',
  'willingToTalk',
  'howToContact',
  'givePermissionToQuote',
]);
