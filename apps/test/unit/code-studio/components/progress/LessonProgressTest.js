import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedLessonProgress as LessonProgress} from '@cdo/apps/code-studio/components/progress/LessonProgress';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

describe('LessonProgress', () => {
  const defaultProps = {
    levels: [
      {
        id: '123',
        status: LevelStatus.not_tried,
      },
    ],
    stageId: 1,
    isLessonExtras: false,
  };

  it('uses progress bubbles', () => {
    const wrapper = shallow(<LessonProgress {...defaultProps} />);
    assert.equal(wrapper.find('Connect(StatusProgressDot)').length, 0);
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
