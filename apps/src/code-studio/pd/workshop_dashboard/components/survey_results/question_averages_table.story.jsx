import React from 'react';
import QuestionAveragesTable from './question_averages_table';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';

export default storybook => {
  const questions = [
    {text: 'Was the facilitator good at brooding?', key: 'question_1', score_base: 5},
    {text: 'How was the session?', key: 'question_2', score_base: 5}
  ];

  storybook
    .storiesOf('Question Averages Section', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Table for a single facilitator',
        story: () => (
          <QuestionAveragesTable
            questions={questions}
            thisWorkshopData={{
              'question_1': 5,
              'question_2': 5
            }}
            allMyWorkshopsData={{
              'question_1': 4,
              'question_2': 4.1,
            }}
            allWorkshopsData={{
              'question_1': 3.5,
              'question_2': 3.6
            }}
            allWorkshops
            facilitatorNames={['Jon Snow', 'Tyrion Lannister']}
            facilitatorBreakdown={false}
            workshopType="TeacherCons"
          />
        )
      },
      {
        name: 'Table for multiple facilitators',
        story: () => (
          <QuestionAveragesTable
            questions={questions}
            facilitatorNames={['Jon Snow', 'Tyrion Lannister']}
            facilitatorBreakdown={true}
            thisWorkshopData={{
              'question_1': {
                'Jon Snow': 5,
                'Tyrion Lannister': 3
              },
              'question_2': 5
            }}
            allMyWorkshopsData={{
              'question_1': 4,
              'question_2': 4.1
            }}
            allWorkshopsData={{
              'question_1': 3.5,
              'question_2': 3.6
            }}
            workshopType="TeacherCons"
          />
        )
      }
    ]);
};
