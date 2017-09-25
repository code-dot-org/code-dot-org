import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import SummaryProgressRow from '@cdo/apps/templates/progress/SummaryProgressRow';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { fakeLesson, fakeLevels } from '@cdo/apps/templates/progress/progressTestHelpers';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

describe('SummaryProgressRow', () => {
  const baseProps = {
    dark: false,
    lesson: fakeLesson('Maze', 1),
    lessonNumber: 3,
    levels: fakeLevels(4),
    lockedForSection: false,
    lessonIsVisible: () => true
  };

  it('does not render when lessonIsVisible is false', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsVisible={() => false}
      />
    );
    assert.equal(wrapper.node, null);
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
      <SummaryProgressRow
        {...baseProps}
        lockedForSection={true}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with dashed border when locked for particular student', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        levels={baseProps.levels.map(level => ({...level, status: LevelStatus.locked}))}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('disables bubbles when locked for section', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lockedForSection={true}
      />
    );
    assert.strictEqual(wrapper.find('ProgressBubbleSet').props().disabled, true);
  });

  it('disables bubbles when locked for particular student', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        levels={baseProps.levels.map(level => ({...level, status: LevelStatus.locked}))}
      />
    );
    assert.strictEqual(wrapper.find('ProgressBubbleSet').props().disabled, true);
  });

  it('has an eye slash icon when hidden for students', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(wrapper.find('td div').children().at(0).props().icon, 'eye-slash');
  });

  it('has a lock icon when lockable and locked', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        lockedForSection={true}
      />
    );
    assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'lock');
  });

  it('has an unlock icon when lockable and unlocked', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        lockedForSection={false}
      />
    );
    assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'unlock');
  });

  it('has two icons when locked and hidden', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        lockedForSection={true}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'eye-slash');
    assert.equal(wrapper.find('FontAwesome').at(1).props().icon, 'lock');
  });
});
