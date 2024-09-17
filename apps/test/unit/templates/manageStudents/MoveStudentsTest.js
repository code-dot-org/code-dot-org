import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  blankStudentTransfer,
  blankStudentTransferStatus,
  TransferStatus,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import {UnconnectedMoveStudents as MoveStudents} from '@cdo/apps/templates/manageStudents/MoveStudents';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'},
];
const sections = [
  {id: 0, name: 'sectiona', loginType: SectionLoginType.google_classroom},
  {id: 1, name: 'sectionb', loginType: SectionLoginType.email},
  {id: 2, name: 'sectionc', loginType: SectionLoginType.clever},
  {id: 3, name: 'sectiond', loginType: SectionLoginType.word},
];

describe('MoveStudents', () => {
  let updateStudentTransfer;
  let transferStudents;
  let cancelStudentTransfer;
  let DEFAULT_PROPS;

  beforeEach(() => {
    updateStudentTransfer = jest.fn();
    transferStudents = jest.fn();
    cancelStudentTransfer = jest.fn();
    DEFAULT_PROPS = {
      studentData,
      transferData: blankStudentTransfer,
      transferStatus: blankStudentTransferStatus,
      sections,
      currentSectionId: 1,
      updateStudentTransfer,
      transferStudents,
      cancelStudentTransfer,
    };
  });

  it('renders only movable sections in dropdown', () => {
    const wrapper = mount(<MoveStudents {...DEFAULT_PROPS} />);
    let dropdownOptions = wrapper.instance().getOptions();
    expect(dropdownOptions).toHaveLength(2);
    expect(dropdownOptions[0].name).toBe('sectiond');
    expect(dropdownOptions[1].name).toBe('Other teacher');
  });

  it('renders additional inputs if other teacher is selected', () => {
    const transferData = {
      ...blankStudentTransfer,
      otherTeacher: true,
    };
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS} transferData={transferData} />
    );

    wrapper.instance().openDialog();
    wrapper.update();
    expect(wrapper.find('#uitest-other-teacher').exists()).toBe(true);
  });

  it('calls transferStudents on submit', () => {
    const transferData = {
      ...blankStudentTransfer,
      studentIds: [1],
      sectionId: 2,
    };
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS} transferData={transferData} />
    );

    expect(transferStudents).not.toHaveBeenCalled();
    wrapper.instance().transfer();
    expect(transferStudents).toHaveBeenCalledTimes(1);
  });

  it('calls cancelStudentTransfer on close', () => {
    const wrapper = mount(<MoveStudents {...DEFAULT_PROPS} />);

    expect(cancelStudentTransfer).not.toHaveBeenCalled();
    wrapper.instance().closeDialog();
    expect(cancelStudentTransfer).toHaveBeenCalledTimes(1);
  });

  it('renders an error message if the transfer status is fail', () => {
    const transferStatus = {
      status: TransferStatus.FAIL,
      error: 'failed to transfer students!',
    };
    const wrapper = mount(
      <MoveStudents {...DEFAULT_PROPS} transferStatus={transferStatus} />
    );

    wrapper.find('Button').simulate('click');
    const errorElement = wrapper.find('#uitest-error');
    expect(errorElement.exists()).toBe(true);
    expect(errorElement.text()).toBe(transferStatus.error);
  });

  it('toggleStudentSelected calls updateStudentTransfer with an updated set of IDs', () => {
    const wrapper = mount(<MoveStudents {...DEFAULT_PROPS} />);
    wrapper.instance().toggleStudentSelected(1);
    expect(updateStudentTransfer).toHaveBeenCalledWith({studentIds: [1]});
  });

  it('toggleStudentSelected adds a missing ID', () => {
    const wrapper = mount(<MoveStudents {...DEFAULT_PROPS} />);
    wrapper.instance().toggleStudentSelected(1);
    expect(updateStudentTransfer).toHaveBeenCalledWith({studentIds: [1]});
  });

  it('toggleStudentSelected removes an existing ID', () => {
    const studentTransfer = {...blankStudentTransfer, studentIds: [1]};
    const props = {...DEFAULT_PROPS, transferData: studentTransfer};
    const wrapper = mount(<MoveStudents {...props} />);
    wrapper.instance().toggleStudentSelected(1);
    expect(updateStudentTransfer).toHaveBeenCalledWith({studentIds: []});
  });

  it('toggleAll true adds all IDs', () => {
    const wrapper = mount(<MoveStudents {...DEFAULT_PROPS} />);
    wrapper.instance().toggleAll(true);
    expect(updateStudentTransfer).toHaveBeenCalledWith({
      studentIds: [1, 3, 0],
    });
  });

  it('toggleAll removes all ID', () => {
    const studentTransfer = {...blankStudentTransfer, studentIds: [1, 3]};
    const props = {...DEFAULT_PROPS, transferData: studentTransfer};
    const wrapper = mount(<MoveStudents {...props} />);
    wrapper.instance().toggleAll(false);
    expect(updateStudentTransfer).toHaveBeenCalledWith({studentIds: []});
  });
});
