import React from 'react';
import {expect} from '../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import LessonLock from '@cdo/apps/templates/progress/LessonLock';
import LessonLockDialog from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDialog';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

const FAKE_LESSON_ID = 33;
const FAKE_UNIT_ID = 1;
const DEFAULT_PROPS = {
  lessonId: FAKE_LESSON_ID,
  unitId: FAKE_UNIT_ID,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<LessonLock {...props} />);
};

describe('LessonLock', () => {
  it('renders an open dialog button and no LessonLockDialog by default', () => {
    const wrapper = setUp();
    const openDialogButton = wrapper.find(Button);
    expect(openDialogButton).to.have.length(1);
    expect(openDialogButton.props().text).to.equal(i18n.lockSettings());
    expect(wrapper.find(LessonLockDialog)).to.have.length(0);
  });

  it('renders the LessonLockDialog when button is clicked', () => {
    const wrapper = setUp();
    wrapper.find(Button).simulate('click');

    const lockDialog = wrapper.find(LessonLockDialog);
    expect(lockDialog).to.have.length(1);
    expect(lockDialog.props().unitId).to.equal(FAKE_UNIT_ID);
    expect(lockDialog.props().lessonId).to.equal(FAKE_LESSON_ID);
  });
});
