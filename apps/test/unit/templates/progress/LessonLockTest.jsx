import React from 'react';
import {expect} from '../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import LessonLock from '@cdo/apps/templates/progress/LessonLock';

const FAKE_LESSON_ID = 33;
const FAKE_UNIT_ID = 1;
const DEFAULT_PROPS = {
  unitId: FAKE_UNIT_ID,
  lessonId: FAKE_LESSON_ID
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<LessonLock {...props} />);
};

describe('LessonLock', () => {
  it('renders only a button initially', () => {
    const wrapper = setUp();
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find('LessonLockDialog')).to.have.length(0);
  });

  it('renders the dialog when the button is clicked', () => {
    const wrapper = setUp();
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('Connect(LessonLockDialog)')).to.have.length(1);
  });
});
