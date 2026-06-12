import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {LockStatus} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import StudentRow from '@cdo/apps/code-studio/components/progress/lessonLockDialog/StudentRow';

const DEFAULT_PROPS = {
  index: 1,
  name: 'Jerry',
  lockStatus: LockStatus.Locked,
  handleRadioChange: () => {},
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<StudentRow {...props} />);
};

describe('StudentRow', () => {
  it('displays name', () => {
    const wrapper = setUp();
    expect(wrapper.find('td').at(0).text()).toBe('Jerry');
  });

  it('has expected status when lockStatus is locked', () => {
    const wrapper = setUp({lockStatus: LockStatus.Locked});
    const radioButtons = wrapper.find('input');
    const lockedSelected = radioButtons.at(0).props().checked;
    expect(lockedSelected).toBe(true);
    const editableSelected = radioButtons.at(1).props().checked;
    expect(editableSelected).toBe(false);
    const readonlySelected = radioButtons.at(2).props().checked;
    expect(readonlySelected).toBe(false);
  });

  it('has expected status when lockStatus is editable', () => {
    const wrapper = setUp({lockStatus: LockStatus.Editable});
    const radioButtons = wrapper.find('input');
    const lockedSelected = radioButtons.at(0).props().checked;
    expect(lockedSelected).toBe(false);
    const editableSelected = radioButtons.at(1).props().checked;
    expect(editableSelected).toBe(true);
    const readonlySelected = radioButtons.at(2).props().checked;
    expect(readonlySelected).toBe(false);
  });

  it('has expected status when lockStatus is readonlyAnswers', () => {
    const wrapper = setUp({lockStatus: LockStatus.ReadonlyAnswers});
    const radioButtons = wrapper.find('input');
    const lockedSelected = radioButtons.at(0).props().checked;
    expect(lockedSelected).toBe(false);
    const editableSelected = radioButtons.at(1).props().checked;
    expect(editableSelected).toBe(false);
    const readonlySelected = radioButtons.at(2).props().checked;
    expect(readonlySelected).toBe(true);
  });

  it('handleRadioChange is called with expected value when radio is selected', () => {
    const handleChangeSpy = jest.fn();
    const wrapper = setUp({handleRadioChange: handleChangeSpy});
    const lockLessonInput = wrapper.find('input').at(0);
    lockLessonInput.simulate('change', {
      target: {
        value: lockLessonInput.props().value,
        name: lockLessonInput.props().name,
      },
    });
    expect(handleChangeSpy).toHaveBeenCalledWith(1, LockStatus.Locked);
  });
});
