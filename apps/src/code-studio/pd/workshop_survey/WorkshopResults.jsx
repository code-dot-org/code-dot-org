import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';

const BUTTON_LABELS = {
  "morePreparedThanBefore": "I feel more prepared to teach the material covered in this workshop than before I came.",
  "knowWhereToGoForHelp": "I know where to go if I need help preparing to teach this material.",
  "suitableForMyExperience": "This professional development was suitable for my level of experience with teaching CS Principles.",
  "wouldRecommend": "I would recommend this professional development to others.",

  "anticipateContinuing": "I look forward to continuing my CS Principles training throughout the year.",
  "confidentCanTeach": "I feel confident I can teach this course to my students this year.",
  "believeAllStudents": "I believe all students should take AP CS Principles.",

  "bestPdEver": "This was the absolute best professional development I've ever participated in.",
  "partOfCommunity": "I feel more connected to the community of computer science teachers after this workshop.",
};

export default class WorkshopResults extends FormComponent {
  render() {
    return (
      <FormGroup>
        {Object.keys(BUTTON_LABELS).map(name =>
          this.buildButtonsFromOptions({
            label: BUTTON_LABELS[name],
            name: name,
            required: true,
            type: 'radio',
          })
        )}

        {this.buildFieldGroup({
          componentClass: "textarea",
          label: "What were the two things you liked most about the activities you did in this workshop and why?",
          name: "thingsYouLiked",
          required: true,
        })}
        {this.buildFieldGroup({
          componentClass: "textarea",
          label: "What are the two things you would change about the activities you did in this workshop? How would you improve them for future participants?",
          name: "thingsYouWouldChange",
          required: true,
        })}
        {this.buildFieldGroup({
          componentClass: "textarea",
          label: "Is there anything else you’d like to tell us about your experience at this workshop?",
          name: "anythingElse",
          required: false,
        })}

        {this.buildButtonsFromOptions({
          label: "I give Code.org permission to quote my written feedback from today for use on social media, promotional materials, and other communications. (We love sharing what our teachers think about us!)",
          name: "givePermissionToQuote",
          required: true,
          type: 'radio',
        })}
      </FormGroup>
    );
  }
}

WorkshopResults.associatedFields = Object.keys(BUTTON_LABELS).concat([
  "thingsYouLiked",
  "thingsYouWouldChange",
  "anythingElse",
  "givePermissionToQuote",
]);
