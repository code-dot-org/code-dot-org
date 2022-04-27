import React from 'react';
import {shallow} from 'enzyme';
import CloneLessonDialogButton from '@cdo/apps/lib/levelbuilder/CloneLessonDialogButton';
import {expect} from '../../../util/reconfiguredChai';

describe('CloneLessonDialogButton', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      lessonId: 123,
      lessonName: 'Lesson One',
      buttonText: 'Make a Copy'
    };
  });

  it('renders a closed CloneLessonDialog initially', () => {
    const wrapper = shallow(<CloneLessonDialogButton {...defaultProps} />);

    const button = wrapper.find('Button');
    expect(button.prop('text')).to.equal('Make a Copy');

    const dialog = wrapper.find('CloneLessonDialog');
    // this indicates that the dialog is closed
    expect(dialog.prop('lessonId')).to.be.undefined;
    expect(dialog.prop('lessonName')).to.equal('Lesson One');
  });
});
