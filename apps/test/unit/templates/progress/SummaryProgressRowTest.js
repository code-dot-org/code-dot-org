import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedSummaryProgressRow as SummaryProgressRow} from '@cdo/apps/templates/progress/SummaryProgressRow';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
  fakeProgressForLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

describe('SummaryProgressRow', () => {
  let baseLesson = fakeLesson('Maze', 1);
  const baseLevels = fakeLevels(4);
  baseLesson.levels = baseLevels;
  const baseProps = {
    dark: false,
    lesson: baseLesson,
    lessonNumber: 3,
    lockedForSection: false,
    lessonIsVisible: () => true,
    studentProgress: fakeProgressForLevels(baseLevels)
  };

  it('does not render when lessonIsVisible is false', () => {
    const wrapper = shallow(
      <SummaryProgressRow {...baseProps} lessonIsVisible={() => false} />
    );
    assert.equal(wrapper.html(), null);
  });

  it('renders with dashed border when lessonIsVisible for teachers only', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with dashed border when locked for section', () => {
    const wrapper = shallow(
      <SummaryProgressRow {...baseProps} lockedForSection={true} />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with dashed border when locked for particular student', () => {
    let progress = fakeProgressForLevels(baseLevels);
    Object.keys(progress).forEach(key => {
      progress[key].status = LevelStatus.locked;
    });
    const wrapper = shallow(
      <SummaryProgressRow {...baseProps} studentProgress={progress} />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('disables bubbles when locked for section', () => {
    const wrapper = shallow(
      <SummaryProgressRow {...baseProps} lockedForSection={true} />
    );
    assert.strictEqual(
      wrapper.find('ProgressBubbleSet').props().disabled,
      true
    );
  });

  it('disables bubbles when locked for particular student', () => {
    let progress = fakeProgressForLevels(baseLevels);
    Object.keys(progress).forEach(key => {
      progress[key].status = LevelStatus.locked;
    });
    const wrapper = shallow(
      <SummaryProgressRow {...baseProps} studentProgress={progress} />
    );
    assert.strictEqual(
      wrapper.find('ProgressBubbleSet').props().disabled,
      true
    );
  });

  it('has an eye slash icon when hidden for students', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(
      wrapper
        .find('td div')
        .children()
        .at(0)
        .props().icon,
      'eye-slash'
    );
  });

  it('has a lock icon when lockable and locked', () => {
    let lesson = fakeLesson('Maze', 1, true);
    const levels = fakeLevels(4);
    lesson.levels = levels;
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={lesson}
        lockedForSection={true}
      />
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon,
      'lock'
    );
  });

  it('has an unlock icon when lockable and unlocked', () => {
    let lesson = fakeLesson('Maze', 1, true);
    const levels = fakeLevels(4);
    lesson.levels = levels;
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={lesson}
        lockedForSection={false}
      />
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon,
      'unlock'
    );
  });

  it('has two icons when locked and hidden', () => {
    let lesson = fakeLesson('Maze', 1, true);
    const levels = fakeLevels(4);
    lesson.levels = levels;
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={lesson}
        lockedForSection={true}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon,
      'eye-slash'
    );
    assert.equal(
      wrapper
        .find('FontAwesome')
        .at(1)
        .props().icon,
      'lock'
    );
  });
});
