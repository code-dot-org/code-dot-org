import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';

import {UnconnectedLessonCard as LessonCard} from '@cdo/apps/lib/levelbuilder/script-editor/LessonCard';

describe('LessonCard', () => {
  let reorderLevel,
    moveLevelToLesson,
    addLevel,
    setLessonGroup,
    setTargetLesson,
    moveLesson,
    removeLesson,
    defaultProps;

  beforeEach(() => {
    reorderLevel = sinon.spy();
    moveLevelToLesson = sinon.spy();
    addLevel = sinon.spy();
    setLessonGroup = sinon.spy();
    setTargetLesson = sinon.spy();
    moveLesson = sinon.spy();
    removeLesson = sinon.spy();
    defaultProps = {
      reorderLevel,
      moveLevelToLesson,
      addLevel,
      moveLesson,
      removeLesson,
      lessonsCount: 1,
      lessonGroupsCount: 1,
      lesson: {
        name: 'Lesson 1',
        levels: [],
        position: 1,
        lockable: false
      },
      lessonGroupPosition: 1,
      lessonMetrics: {},
      setLessonGroup,
      setTargetLesson,
      targetLessonPos: null
    };
  });

  it('renders default props', () => {
    let wrapper = shallow(<LessonCard {...defaultProps} />);
    expect(wrapper.contains('Lesson 1: Lesson 1'));
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.find('button').length).to.equal(1);
  });
});
