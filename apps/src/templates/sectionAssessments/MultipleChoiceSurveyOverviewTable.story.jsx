import React from 'react';
import MultipleChoiceSurveyOverviewTable from './MultipleChoiceSurveyOverviewTable';
import i18n from '@cdo/locale';

const multipleChoiceSurveyData = [
  {
    id: 1,
    question: '1. I am very good at school',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 40},
               {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 20},
               {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20},
               {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 20},
    ],
    notAnswered: 10,
  },
  {
    id: 2,
    question: '2. I enjoy pair programming',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 30},
               {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 10},
               {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10},
               {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 10},
               {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 20},
               {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 10},
    ],
    notAnswered: 30,
  },
  {
    id: 3,
    question: '3. How do you prepare for taking a test?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 50},
               {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 15},
               {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20},
               {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 5},
               {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5},
    ],
    notAnswered: 5,
  },
  {
    id: 4,
    question: '4. Do you feel more or less prepared to answer questions about the topics that interest you?',
    answers:  [{multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 15},
               {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 18},
               {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10},
               {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 9},
               {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5},
               {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 32},
               {multipleChoiceOption: i18n.answerOptionG(), percentAnswered: 5},
    ],
    notAnswered: 0,
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/MultipleChoiceSurveyOverviewTable', module)
    .addStoryTable([
      {
        name: 'Assessment multiple choice with 7 answers',
        description: 'Ability to see assessment overview for a section',
        story: () => (
          <MultipleChoiceSurveyOverviewTable
            multipleChoiceSurveyData={multipleChoiceSurveyData}
          />
        )
      },
      {
        name: 'Assessment multiple choice with 3 answers',
        description: 'Ability to see assessment overview for a section',
        story: () => (
          <MultipleChoiceSurveyOverviewTable
            multipleChoiceSurveyData={multipleChoiceSurveyData.map(question => {
              return {
                ...question,
                answers: question.answers.slice(0,2),
              };
            })}
          />
        )
      },
    ]);
};
