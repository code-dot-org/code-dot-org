import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import sinon from 'sinon';
import StudentRow from '@cdo/apps/code-studio/components/progress/lessonLockDialog/StudentRow';
import {LockStatus} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';

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
    expect(wrapper.find('td').at(0).text()).to.equal('Jerry');
  });

  it('has expected status when lockStatus is locked', () => {
    const wrapper = setUp({lockStatus: LockStatus.Locked});
    const radioButtons = wrapper.find('input');
    const lockedSelected = radioButtons.at(0).props().checked;
    expect(lockedSelected).to.be.true;
    const editableSelected = radioButtons.at(1).props().checked;
    expect(editableSelected).to.be.false;
    const readonlySelected = radioButtons.at(2).props().checked;
    expect(readonlySelected).to.be.false;
  });

  it('has expected status when lockStatus is editable', () => {
    const wrapper = setUp({lockStatus: LockStatus.Editable});
    const radioButtons = wrapper.find('input');
    const lockedSelected = radioButtons.at(0).props().checked;
    expect(lockedSelected).to.be.false;
    const editableSelected = radioButtons.at(1).props().checked;
    expect(editableSelected).to.be.true;
    const readonlySelected = radioButtons.at(2).props().checked;
    expect(readonlySelected).to.be.false;
  });

  it('has expected status when lockStatus is readonlyAnswers', () => {
    const wrapper = setUp({lockStatus: LockStatus.ReadonlyAnswers});
    const radioButtons = wrapper.find('input');
    const lockedSelected = radioButtons.at(0).props().checked;
    expect(lockedSelected).to.be.false;
    const editableSelected = radioButtons.at(1).props().checked;
    expect(editableSelected).to.be.false;
    const readonlySelected = radioButtons.at(2).props().checked;
    expect(readonlySelected).to.be.true;
  });

  it('handleRadioChange is called with expected value when radio is selected', () => {
    const handleChangeSpy = sinon.spy();
    const wrapper = setUp({handleRadioChange: handleChangeSpy});
    const lockLessonInput = wrapper.find('input').at(0);
    lockLessonInput.simulate('change', {
      target: {
        value: lockLessonInput.props().value,
        name: lockLessonInput.props().name,
      },
    });
    expect(handleChangeSpy).to.have.been.calledWith(1, LockStatus.Locked);
  });
});
