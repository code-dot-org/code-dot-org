import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';

import {UnconnectedLessonCard as LessonCard} from '@cdo/apps/lib/script-editor/LessonCard';

describe('LessonCard', () => {
  let reorderLevel,
    moveLevelToLesson,
    addLevel,
    setLessonLockable,
    setFlexCategory,
    setTargetLesson,
    defaultProps;

  beforeEach(() => {
    reorderLevel = sinon.spy();
    moveLevelToLesson = sinon.spy();
    addLevel = sinon.spy();
    setLessonLockable = sinon.spy();
    setFlexCategory = sinon.spy();
    setTargetLesson = sinon.spy();
    defaultProps = {
      reorderLevel,
      moveLevelToLesson,
      addLevel,
      setLessonLockable,
      lessonsCount: 1,
      lesson: {
        levels: [],
        position: 1,
        lockable: false
      },
      lessonMetrics: {},
      setFlexCategory,
      setTargetLesson,
      targetLessonPos: null
    };
  });

  it('displays lockable property', () => {
    let wrapper = shallow(<LessonCard {...defaultProps} />);
    let labelText = 'Require teachers to unlock this lesson';
    let label = wrapper.findWhere(
      n => n.name() === 'label' && n.text().includes(labelText)
    );
    expect(label.find('input').props().checked).to.equal(false);

    const props = {
      ...defaultProps,
      lesson: {
        ...defaultProps.lesson,
        lockable: true
      }
    };
    wrapper = shallow(<LessonCard {...props} />);
    labelText = 'Require teachers to unlock this lesson';
    label = wrapper.findWhere(
      n => n.name() === 'label' && n.text().includes(labelText)
    );
    expect(label.find('input').props().checked).to.equal(true);
  });
});
