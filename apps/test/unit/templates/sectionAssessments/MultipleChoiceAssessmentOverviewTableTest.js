import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedMultipleChoiceAssessmentsOverviewTable} from '@cdo/apps/templates/sectionAssessments/MultipleChoiceAssessmentsOverviewTable';
import commonMsg from '@cdo/locale';

const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), numAnswered: 40, isCorrect: true},
      {multipleChoiceOption: commonMsg.answerOptionB(), numAnswered: 20, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionC(), numAnswered: 20, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionD(), numAnswered: 20, isCorrect: false},
    ],
    totalAnswered: 100,
    notAnswered: 10,
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), numAnswered: 30, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionB(), numAnswered: 10, isCorrect: true},
      {multipleChoiceOption: commonMsg.answerOptionC(), numAnswered: 10, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionD(), numAnswered: 10, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionE(), numAnswered: 20, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionF(), numAnswered: 10, isCorrect: false},
    ],
    totalAnswered: 100,
    notAnswered: 10,
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), numAnswered: 50, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionB(), numAnswered: 15, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionC(), numAnswered: 20, isCorrect: true},
      {multipleChoiceOption: commonMsg.answerOptionD(), numAnswered: 5, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionE(), numAnswered: 5, isCorrect: false},
    ],
    totalAnswered: 100,
    notAnswered: 10,
  },
  {
    id: 4,
    question: '4. What is a function?',
    answers:  [
      {multipleChoiceOption: commonMsg.answerOptionA(), numAnswered: 15, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionB(), numAnswered: 18, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionC(), numAnswered: 10, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionD(), numAnswered: 9, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionE(), numAnswered: 5, isCorrect: false},
      {multipleChoiceOption: commonMsg.answerOptionF(), numAnswered: 32, isCorrect: true},
      {multipleChoiceOption: commonMsg.answerOptionG(), numAnswered: 5, isCorrect: false},
    ],
    totalAnswered: 100,
    notAnswered: 10,
  },
];

describe('MultipleChoiceAssessmentsOverviewTable', () => {
  it('renders the correct number of cells', () => {
    const wrapper = mount(
      <UnconnectedMultipleChoiceAssessmentsOverviewTable
        questionAnswerData={multipleChoiceData}
        openDialog={() => {}}
        setQuestionIndex={() => {}}
      />
    );

    const answerCells = wrapper.find('MultipleChoiceAnswerCell');
    expect(answerCells).to.have.length(32);

    const tableHeaders = wrapper.find('th');
    expect(tableHeaders).to.have.length(9);

    const tableRows = wrapper.find('tr');
    expect(tableRows).to.have.length(5);
  });
});
