import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CloneLessonDialogButton from '@cdo/apps/lib/levelbuilder/CloneLessonDialogButton';

describe('CloneLessonDialogButton', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      lessonId: 123,
      lessonName: 'Lesson One',
      buttonText: 'Make a Copy',
    };
  });

  it('renders a closed CloneLessonDialog initially', () => {
    const wrapper = shallow(<CloneLessonDialogButton {...defaultProps} />);

    const button = wrapper.find('Button');
    expect(button.prop('text')).toBe('Make a Copy');

    const dialog = wrapper.find('CloneLessonDialog');
    // this indicates that the dialog is closed
    expect(dialog.prop('lessonId')).toBeUndefined();
    expect(dialog.prop('lessonName')).toBe('Lesson One');
  });

  it('renders an open CloneLessonDialog after button is clicked', () => {
    const wrapper = shallow(<CloneLessonDialogButton {...defaultProps} />);

    const button = wrapper.find('Button');
    button.simulate('click');

    const dialog = wrapper.find('CloneLessonDialog');
    expect(dialog.prop('lessonId')).toBe(123);
    expect(dialog.prop('lessonName')).toBe('Lesson One');
  });
});
