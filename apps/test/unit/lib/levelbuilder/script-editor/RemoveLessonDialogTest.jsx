import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedRemoveLessonDialog as RemoveLessonDialog} from '@cdo/apps/lib/levelbuilder/unit-editor/RemoveLessonDialog';

describe('RemoveLessonDialog', () => {
  let handleClose, removeLesson, props;
  beforeEach(() => {
    handleClose = jest.fn();
    removeLesson = jest.fn();
    props = {
      lessonGroupPosition: 1,
      lessonPosToRemove: 2,
      lessonName: 'Lesson Name',
      handleClose,
      removeLesson,
    };
  });

  it('is initially closed', () => {
    props.lessonPosToRemove = null;
    const wrapper = mount(<RemoveLessonDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(0);
  });
  it('is open when lesson is specified', () => {
    const wrapper = mount(<RemoveLessonDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(1);
  });
  it('removes lesson on confirm', () => {
    const wrapper = mount(<RemoveLessonDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(1);

    const body = wrapper.find('.modal-body');
    const deleteButton = body.find('button').at(2);
    expect(deleteButton.text()).toContain('Delete');
    deleteButton.simulate('click');
    expect(removeLesson).toHaveBeenCalledWith(1, 2);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  it('does not remove lesson on cancel', () => {
    const wrapper = mount(<RemoveLessonDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(1);

    const body = wrapper.find('.modal-body');
    const cancelButton = body.find('button').at(1);
    expect(cancelButton.text()).toContain('Cancel');
    cancelButton.simulate('click');
    expect(removeLesson).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
