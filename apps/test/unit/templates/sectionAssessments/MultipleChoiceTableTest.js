import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import MultipleChoiceAnswerCell from './MultipleChoiceAnswerCell';
import MultipleChoiceOverviewTable from './MultipleChoiceOverviewTable';
import commonMsg from '@cdo/locale';

const students = [
  {
    id: '012896',
    name: 'Caley',
    answers: [{question: 1, answer: ['']}, {question: 2, answer: ['D']}, {question: 3, answer: ['A']}],
    submitted: true
  },
  {
    id: '012896',
    name: 'Erin',
    answers: [{question: 1, answer: ['']}, {question: 2, answer: ['B']}, {question: 3, answer: ['D']}],
    submitted: false
  },
  {
    id: '012896',
    name: 'Maddie',
    answers: [{question: 1, answer: ['']}, {question: 2, answer: ['']}, {question: 3, answer: ['E']}],
    submitted: true
  },
]

const questions = [	
	{
		id: 1,
		answerOptions: 
		[
			{option: commonMsg.answerOptionA(), isCorrectAnswer: true}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}
		],
		questionText: '1. What is a variable?'
	},
	{
		id: 2,
		answerOptions: [
			{option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB(), isCorrectAnswer: true}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD()}, {option: commonMsg.answerOptionE()}, {option: commonMsg.answerOptionF()},
		],
		questionText: '2. What is a function?'
	},
	{
		id: 3,
		answerOptions: [
			{option: commonMsg.answerOptionA()}, {option: commonMsg.answerOptionB()}, {option: commonMsg.answerOptionC()}, {option: commonMsg.answerOptionD(), isCorrectAnswer: true}, {option: commonMsg.answerOptionE()},
		],
    	questionText: '3. What is an event?'	
	},
];

describe('MultipleChoiceTable', () => {
  let updateStudentTransfer;
  let transferStudents;

  beforeEach(() => {
    updateStudentTransfer = sinon.spy();
    transferStudents = sinon.spy();
  });

  // it('renders answer choices as rows', () => {
  //   const wrapper = mount(
  //     <MoveStudents
  //       {...DEFAULT_PROPS}
  //       updateStudentTransfer={updateStudentTransfer}
  //       transferStudents={transferStudents}
  //     />
  //   );

  //   wrapper.find('Button').simulate('click');
  //   const nameCells = wrapper.find('.uitest-name-cell');
  //   expect(nameCells).to.have.length(3);
  // });

  it('sorts questions by number (descending) on click', () => {
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
      />
    );

    wrapper.find('Button').simulate('click');
    wrapper.find('#uitest-name-header').simulate('click');
    const nameCells = wrapper.find('.uitest-name-cell');
    expect(questionTextCells.at(2).text()).to.equal('3. What is an event?');
    expect(questionTextCells.at(1).text()).to.equal('2.  What is a function?');
    expect(questionTextCells.at(0).text()).to.equal('1.');
  });

  // it('returns the percent of students that did not select an answer choice', () => {
  //   const wrapper = mount(
  //     <MoveStudents
  //       {...DEFAULT_PROPS}
  //       updateStudentTransfer={updateStudentTransfer}
  //       transferStudents={transferStudents}
  //     />
  //   );

  //   wrapper.find('Button').simulate('click');
  //   wrapper.find('#uitest-name-header').simulate('click');
  //   const nameCells = wrapper.find('.uitest-name-cell');
  //   expect(nameCells.at(0).text()).to.equal('studenta');
  //   expect(nameCells.at(1).text()).to.equal('studentb');
  //   expect(nameCells.at(2).text()).to.equal('studentc');
  // });

  // it('returns the percent of students that selected each answer choice', () => {
  //   const wrapper = mount(
  //     <MoveStudents
  //       {...DEFAULT_PROPS}
  //       updateStudentTransfer={updateStudentTransfer}
  //       transferStudents={transferStudents}
  //     />
  //   );

  //   wrapper.find('Button').simulate('click');
  //   wrapper.find('#uitest-name-header').simulate('click');
  //   const nameCells = wrapper.find('.uitest-name-cell');
  //   expect(nameCells.at(0).text()).to.equal('studenta');
  //   expect(nameCells.at(1).text()).to.equal('studentb');
  //   expect(nameCells.at(2).text()).to.equal('studentc');
  // });
});