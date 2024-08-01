import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonLockDialog from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDialog';
import Button from '@cdo/apps/legacySharedComponents/Button';
import LessonLock from '@cdo/apps/templates/progress/LessonLock';
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
    expect(openDialogButton).toHaveLength(1);
    expect(openDialogButton.props().text).toBe(i18n.lockSettings());
    expect(wrapper.find(LessonLockDialog)).toHaveLength(0);
  });

  it('renders the LessonLockDialog when button is clicked', () => {
    const wrapper = setUp();
    wrapper.find(Button).simulate('click');

    const lockDialog = wrapper.find(LessonLockDialog);
    expect(lockDialog).toHaveLength(1);
    expect(lockDialog.props().unitId).toBe(FAKE_UNIT_ID);
    expect(lockDialog.props().lessonId).toBe(FAKE_LESSON_ID);
  });
});
