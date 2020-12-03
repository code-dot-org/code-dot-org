import React from 'react';
import {assert} from 'chai';
import {UnconnectedLessonProgress as LessonProgress} from '@cdo/apps/code-studio/components/progress/LessonProgress';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {levelProgressWithStatus} from '@cdo/apps/templates/progress/progressHelpers';
import {shallow} from 'enzyme';

describe('LessonProgress', () => {
  const defaultProps = {
    levels: [
      {
        id: 123
      }
    ],
    studentProgress: {123: levelProgressWithStatus(LevelStatus.not_tried)},
    stageId: 1,
    onLessonExtras: false
  };

  it('uses progress bubbles', () => {
    const wrapper = shallow(<LessonProgress {...defaultProps} />);
    assert.equal(wrapper.find('ProgressBubble').length, 1);
  });

  it('does not include lesson extras when there is not a lessonExtrasUrl', () => {
    const wrapper = shallow(<LessonProgress {...defaultProps} />);
    assert.equal(wrapper.find('LessonExtrasProgressBubble').length, 0);
  });

  it('includes lesson extras when there is a lessonExtrasUrl', () => {
    const wrapper = shallow(
      <LessonProgress {...defaultProps} lessonExtrasUrl={'/extras'} />
    );
    assert.equal(wrapper.find('LessonExtrasProgressBubble').length, 1);
  });
});
