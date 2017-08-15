import React from 'react';
import FreeResponseSection from './free_response_section';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('FreeResponseSection', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Responses for a single facilitator',
        story: () => (
          <FreeResponseSection
            questions={
              [
                {text: 'Question 1', key: 'question_1'},
                {text: 'Question 2', key: 'question_2'}
              ]
            }
            responseData={{
              'question_1': ['Feedback 1_1', 'Feedback 1_2'],
              'question_2': ['Feedback 2_1', 'Feedback 2_2']
            }}
          />
        )
      },
      {
        name: 'Responses for multiple facilitators',
        story: () => (
          <FreeResponseSection
            questions={
              [
                {text: 'Question 1', key: 'question_1'},
                {text: 'Question 2', key: 'question_2'}
              ]
            }
            responseData={{
              'question_1': {
                'Facilitator 1': ['Q1F1 feedback', 'Q1F1 feedback'],
                'Facilitator 2': ['Q1F2 feedback', 'Q1F2 feedback']
              },
              'question_2': {
                'Facilitator 1': ['Q2F1 feedback', 'Q2F1 feedback'],
                'Facilitator 2': ['Q2F2 feedback', 'Q2F2 feedback']
              },
            }}
          />
        )
      }
    ]);
};
