import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
// import {blankStudentTransfer} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {UnconnectedMoveStudents as MoveStudents} from '@cdo/apps/templates/manageStudents/MoveStudents';

const studentAnswers = {
	'012896': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'},],
	'012897': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'}],
	'012898': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'}],
	'012899': [{question: 1, answer: 'A'}, {question: 2, answer: 'B'}]
};


const questions = {	
	question1: {
			answerOptions: [{option: commonMsg.answerOptionA(), isCorrectAnswer: true}, 
							{option: commonMsg.answerOptionB()}, 
							{option: commonMsg.answerOptionC()}, 
							{option: commonMsg.answerOptionD()}],
			questionText: '1. what is a variable?'
		},
	question2:
		{
			answerOptions: [{option: commonMsg.answerOptionA()}, 
							{option: commonMsg.answerOptionB(), isCorrectAnswer: true}, 
							{option: commonMsg.answerOptionC()}, 
							{option: commonMsg.answerOptionD()}, 
							{option: commonMsg.answerOptionE()}, 
							{option: commonMsg.answerOptionF()}
			],
			questionText: '2. What is a 4-bit number for the decimal number Ten(10)?'
		},
  };


// test for it calculates notAnswered
// test for it calcualtes percentAnswered
// test for it sorts question column


// describe('ManageStudentsTable', () => {
//     it('sortRows orders table in the following order: add, newStudent, student', () => {
//       const rowData = [
//         {id: 1, name: 'studentb', rowType: RowType.STUDENT},
//         {id: 3, name: 'studenta', rowType: RowType.STUDENT},
//         {id: 0, name: '', rowType: RowType.ADD},
//         {id: 2, name: 'studentf', rowType: RowType.NEW_STUDENT}
//       ];
//       const columnIndexList = [];
//       const orderList = ["asc"];
//       const sortedList = sortRows(rowData, columnIndexList, orderList);
//       expect(sortedList[0].id).to.equal(0);
//       expect(sortedList[1].id).to.equal(2);
//       expect(sortedList[2].id).to.equal(1);
//       expect(sortedList[3].id).to.equal(3);
//     });
//   });



describe('MultipleChoiceTable', () => {
  let updateStudentTransfer;
  let transferStudents;

  beforeEach(() => {
    updateStudentTransfer = sinon.spy();
    transferStudents = sinon.spy();
  });

  it('opens a dialog with a table', () => {
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
      />
    );

    wrapper.find('Button').simulate('click');
    expect(wrapper.find('BaseDialog').exists()).to.be.true;
    expect(wrapper.find('table').exists()).to.be.true;
  });

  it('renders students as rows', () => {
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
      />
    );

    wrapper.find('Button').simulate('click');
    const nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells).to.have.length(3);
  });

  it('sorts students by name (ascending) on click', () => {
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
    expect(nameCells.at(0).text()).to.equal('studenta');
    expect(nameCells.at(1).text()).to.equal('studentb');
    expect(nameCells.at(2).text()).to.equal('studentc');
  });

  it('shows all sections minus current section in dropdown', () => {
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
      />
    );

    wrapper.find('Button').simulate('click');
    const dropdownOptions = wrapper.find('select').find('option');
    // Dropdown options should include initial empty option, list of
    // sections (excluding current section), and 'Other teacher' option
    expect(dropdownOptions).to.have.length(4);
    expect(dropdownOptions.at(0).text()).to.equal('');
    expect(dropdownOptions.at(1).text()).to.equal('sectiona');
    expect(dropdownOptions.at(2).text()).to.equal('sectionc');
    expect(dropdownOptions.at(3).text()).to.equal('Other teacher');
  });

  it('renders additional inputs if other teacher is selected', () => {
    const transferData = {
      ...blankStudentTransfer,
      otherTeacher: true
    };
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        transferData={transferData}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
      />
    );

    wrapper.find('Button').simulate('click');
    expect(wrapper.find('#uitest-other-teacher').exists()).to.be.true;
  });

  it('calls transferStudents on submit', () => {
    const transferData = {
      ...blankStudentTransfer,
      studentIds: [1],
      sectionId: 2
    };
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        transferData={transferData}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
      />
    );

    wrapper.find('Button').simulate('click');
    expect(transferStudents.callCount).to.equal(0);
    wrapper.find('#submit').simulate('click');
    expect(transferStudents.callCount).to.equal(1);
  });
});
