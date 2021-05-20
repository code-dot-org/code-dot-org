import React from 'react';
import MultipleChoiceSurveyOverviewTable from './MultipleChoiceSurveyOverviewTable';
import i18n from '@cdo/locale';

const multipleChoiceSurveyData = [
  {
    id: 1,
    question: 'I am very good at school',
    questionNumber: 1,
    answers: [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 40},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 20},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 20}
    ],
    notAnswered: 10,
    totalAnswered: 20
  },
  {
    id: 2,
    question: 'I enjoy pair programming',
    questionNumber: 2,
    answers: [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 30},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 10},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 10},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 20},
      {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 10}
    ],
    notAnswered: 30,
    totalAnswered: 20
  },
  {
    id: 3,
    question: 'How do you prepare for taking a test?',
    questionNumber: 3,
    answers: [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 50},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 15},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 5},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5}
    ],
    notAnswered: 5,
    totalAnswered: 20
  },
  {
    id: 4,
    question:
      'Do you feel more or less prepared to answer questions about the topics that interest you?',
    questionNumber: 4,
    answers: [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 15},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 18},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 9},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5},
      {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 32},
      {multipleChoiceOption: i18n.answerOptionG(), percentAnswered: 5}
    ],
    notAnswered: 0,
    totalAnswered: 20
  }
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
                answers: question.answers.slice(0, 2)
              };
            })}
          />
        )
      }
    ]);
};
