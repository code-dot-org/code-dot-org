import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import {
  blankStudentTransfer,
  blankStudentTransferStatus,
  TransferStatus
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {UnconnectedMoveStudents as MoveStudents} from '@cdo/apps/templates/manageStudents/MoveStudents';

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'}
];
const sections = [
  {id: 0, name: 'sectiona'},
  {id: 1, name: 'sectionb'},
  {id: 2, name: 'sectionc'}
];
const DEFAULT_PROPS = {
  studentData: studentData,
  transferData: blankStudentTransfer,
  transferStatus: blankStudentTransferStatus,
  sections: sections,
  currentSectionId: 1
};

describe('MoveStudents', () => {
  let updateStudentTransfer;
  let transferStudents;
  let cancelStudentTransfer;

  beforeEach(() => {
    updateStudentTransfer = sinon.spy();
    transferStudents = sinon.spy();
    cancelStudentTransfer = sinon.spy();
  });

  it('opens a dialog with a table', () => {
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
        cancelStudentTransfer={cancelStudentTransfer}
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
        cancelStudentTransfer={cancelStudentTransfer}
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
        cancelStudentTransfer={cancelStudentTransfer}
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
        cancelStudentTransfer={cancelStudentTransfer}
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
        cancelStudentTransfer={cancelStudentTransfer}
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
        cancelStudentTransfer={cancelStudentTransfer}
      />
    );

    wrapper.find('Button').simulate('click');
    expect(transferStudents.callCount).to.equal(0);
    wrapper.find('#uitest-submit').simulate('click');
    expect(transferStudents.callCount).to.equal(1);
  });

  it('calls cancelStudentTransfer on close', () => {
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
        cancelStudentTransfer={cancelStudentTransfer}
      />
    );

    wrapper.find('Button').simulate('click');
    expect(cancelStudentTransfer.callCount).to.equal(0);
    wrapper.find("#uitest-cancel").simulate('click');
    expect(cancelStudentTransfer.callCount).to.equal(1);
  });

  it('renders an error message if the transfer status is fail', () => {
    const transferStatus = {
      status: TransferStatus.FAIL,
      error: 'failed to transfer students!'
    };
    const wrapper = mount(
      <MoveStudents
        {...DEFAULT_PROPS}
        transferStatus={transferStatus}
        updateStudentTransfer={updateStudentTransfer}
        transferStudents={transferStudents}
        cancelStudentTransfer={cancelStudentTransfer}
      />
    );

    wrapper.find('Button').simulate('click');
    const errorElement = wrapper.find("#uitest-error");
    expect(errorElement.exists()).to.be.true;
    expect(errorElement.text()).to.equal(transferStatus.error);
  });
});
