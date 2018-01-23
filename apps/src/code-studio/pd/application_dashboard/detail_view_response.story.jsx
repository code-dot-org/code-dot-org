import React from 'react';
import DetailViewResponse from './detail_view_response';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('DetailViewResponse', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Detail View Response for line item question 1',
        story: () => (
          <DetailViewResponse
            question="What is your name?"
            answer="Sir Galahad"
            layout="lineItem"
          />
        )
      },
      {
        name: 'Detail View Response for line item question 2',
        story: () => (
          <DetailViewResponse
            question="What is your quest?"
            answer="I seek the grail"
            layout="panel"
          />
        )
      },
      {
        name: 'Detail View Response for line item question 3',
        story: () => (
          <DetailViewResponse
            question="What is your favorite color?"
            answer={['Blue', 'No - Yellow', 'AIYEEEEEEE']}
            layout="lineItem"
          />
        )
      },
      {
        name: 'Detail View Response for line item question 4',
        story: () => (
          <DetailViewResponse
            question="What is your favorite color?"
            answer={['Blue', 'No - Yellow', 'AIYEEEEEEE']}
            layout="panel"
          />
        )
      },
      {
        name: 'Detail View Response for line item question 5',
        story: () => (
          <DetailViewResponse
            question="This should not render"
            answer=""
            layout="lineItem"
          />
        )
      },
      {
        name: 'Detail View Response for yes/no scored question',
        story: () => (
          <DetailViewResponse
            question="Scored question that should have yes/no as possible scores"
            answer="Here is a response"
            layout="panel"
            score="Yes"
            possibleScores={['Yes', 'No']}
          />
        )
      },
      {
        name: 'Detail View Response for numeric scored question',
        story: () => (
          <DetailViewResponse
            question="Scored question that should have numbers as possible scores"
            answer="Here is a response"
            layout="panel"
            score="3"
            possibleScores={[0, 3]}
          />
        )
      }
    ]);
};
