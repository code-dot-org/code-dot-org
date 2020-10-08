import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import LessonToken from '@cdo/apps/lib/levelbuilder/script-editor/LessonToken';

describe('LessonToken', () => {
  let handleDragStart, removeLesson, defaultProps;

  beforeEach(() => {
    handleDragStart = sinon.spy();
    removeLesson = sinon.spy();
    defaultProps = {
      dragging: false,
      draggedLessonPos: false,
      delta: 0,
      handleDragStart,
      removeLesson,
      lesson: {
        name: 'Lesson 1',
        levels: [],
        position: 1,
        lockable: false,
        unplugged: false,
        assessment: false
      },
      lessonGroupPosition: 1
    };
  });

  it('renders default props', () => {
    let wrapper = mount(<LessonToken {...defaultProps} />);
    expect(wrapper.find('Motion').length).to.equal(1);
    expect(wrapper.contains('Lesson 1')).to.be.true;
    expect(wrapper.find('i').length).to.equal(3);
  });
});
