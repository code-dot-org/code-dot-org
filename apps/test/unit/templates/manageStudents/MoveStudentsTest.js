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

describe('MoveStudents', () => {
  let updateStudentTransfer;
  let transferStudents;
  let cancelStudentTransfer;
  let DEFAULT_PROPS;

  beforeEach(() => {
    updateStudentTransfer = sinon.spy();
    transferStudents = sinon.spy();
    cancelStudentTransfer = sinon.spy();
    DEFAULT_PROPS = {
      studentData,
      transferData: blankStudentTransfer,
      transferStatus: blankStudentTransferStatus,
      sections,
      currentSectionId: 1,
      updateStudentTransfer,
      transferStudents,
      cancelStudentTransfer
    };
  });

  it('opens a dialog with a table', () => {
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS}/>
    );

    wrapper.find('Button').simulate('click');
    expect(wrapper.find('BaseDialog').exists()).to.be.true;
    expect(wrapper.find('table').exists()).to.be.true;
  });

  it('renders students as rows', () => {
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS}/>
    );

    wrapper.find('Button').simulate('click');
    const nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells).to.have.length(3);
  });

  it('sorts students by name (ascending) by default', () => {
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS}/>
    );

    wrapper.find('Button').simulate('click');
    const nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0)).to.have.text('studenta');
    expect(nameCells.at(1)).to.have.text('studentb');
    expect(nameCells.at(2)).to.have.text('studentc');
  });

  it('sorts students by name (descending) on click', () => {
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS}/>
    );

    wrapper.find('Button').simulate('click');
    wrapper.find('#uitest-name-header').simulate('click');
    const nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0)).to.have.text('studentc');
    expect(nameCells.at(1)).to.have.text('studentb');
    expect(nameCells.at(2)).to.have.text('studenta');
  });

  it('shows all sections minus current section in dropdown', () => {
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS}/>
    );

    wrapper.find('Button').simulate('click');
    const dropdownOptions = wrapper.find('select').find('option');
    // Dropdown options should include initial empty option, list of
    // sections (excluding current section), and 'Other teacher' option
    expect(dropdownOptions).to.have.length(4);
    expect(dropdownOptions.at(0)).to.have.text('');
    expect(dropdownOptions.at(1)).to.have.text('sectiona');
    expect(dropdownOptions.at(2)).to.have.text('sectionc');
    expect(dropdownOptions.at(3)).to.have.text('Other teacher');
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
      />
    );

    wrapper.find('Button').simulate('click');
    expect(transferStudents).not.to.have.been.called;
    wrapper.find('#uitest-submit').simulate('click');
    expect(transferStudents).to.have.been.calledOnce;
  });

  it('calls cancelStudentTransfer on close', () => {
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS}/>
    );

    wrapper.find('Button').simulate('click');
    expect(cancelStudentTransfer).not.to.have.been.called;
    wrapper.find("#uitest-cancel").simulate('click');
    expect(cancelStudentTransfer).to.have.been.calledOnce;
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
      />
    );

    wrapper.find('Button').simulate('click');
    const errorElement = wrapper.find("#uitest-error");
    expect(errorElement.exists()).to.be.true;
    expect(errorElement).to.have.text(transferStatus.error);
  });
});
