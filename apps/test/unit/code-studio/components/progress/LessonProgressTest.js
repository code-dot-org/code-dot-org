import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedLessonProgress as LessonProgress} from '@cdo/apps/code-studio/components/progress/LessonProgress';
import experiments from '@cdo/apps/util/experiments';
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

  describe('LessonTutorProgressBubble', () => {
    let realIsEnabled;
    beforeEach(() => {
      realIsEnabled = experiments.isEnabled;
    });
    afterEach(() => {
      experiments.isEnabled = realIsEnabled;
    });

    it('does not include tutor bubble when lessonTutorAvailable is false', () => {
      experiments.isEnabled = jest.fn(() => true);
      const wrapper = shallow(<LessonProgress {...defaultProps} />);
      assert.equal(wrapper.find('LessonTutorProgressBubble').length, 0);
    });

    it('does not include tutor bubble when experiment is disabled', () => {
      experiments.isEnabled = jest.fn(() => false);
      const wrapper = shallow(
        <LessonProgress
          {...defaultProps}
          lessonTutorAvailable={true}
          lessonTutorPath={'/tutor'}
        />
      );
      assert.equal(wrapper.find('LessonTutorProgressBubble').length, 0);
    });

    it('includes tutor bubble when lessonTutorAvailable is true and experiment is enabled', () => {
      experiments.isEnabled = jest.fn(() => true);
      const wrapper = shallow(
        <LessonProgress
          {...defaultProps}
          lessonTutorAvailable={true}
          lessonTutorPath={'/tutor'}
        />
      );
      assert.equal(wrapper.find('LessonTutorProgressBubble').length, 1);
    });

    it('passes lessonTutorPath to the bubble', () => {
      experiments.isEnabled = jest.fn(() => true);
      const wrapper = shallow(
        <LessonProgress
          {...defaultProps}
          lessonTutorAvailable={true}
          lessonTutorPath={'/tutor'}
        />
      );
      assert.equal(
        wrapper.find('LessonTutorProgressBubble').prop('lessonTutorPath'),
        '/tutor'
      );
    });
  });
});
