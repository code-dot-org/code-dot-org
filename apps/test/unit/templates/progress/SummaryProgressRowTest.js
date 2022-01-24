import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedSummaryProgressRow as SummaryProgressRow} from '@cdo/apps/templates/progress/SummaryProgressRow';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('SummaryProgressRow', () => {
  const baseProps = {
    dark: false,
    lesson: fakeLesson('Maze', 1, false, 3),
    levels: fakeLevels(4),
    lessonIsVisible: () => true,
    lessonIsLockedForUser: () => false,
    lessonIsLockedForAllStudents: () => false,
    lockableAuthorized: false
  };

  // This ID is used by the EndOfLessonDialog to scroll the recently completed lesson into view
  it('renders with the expected ID', () => {
    const wrapper = shallow(<SummaryProgressRow {...baseProps} />);
    assert.equal(wrapper.props().id, 'summary-progress-row-3');
  });

  it('renders with dashed border and not faded when instructor viewing hidden lesson', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Participant}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
    assert.equal(
      wrapper
        .find('td')
        .at(0)
        .props().style.opacity,
      undefined
    );
    assert.equal(
      wrapper
        .find('td')
        .at(1)
        .props().style.opacity,
      undefined
    );
  });

  it('renders with dashed border and faded when locked for participant', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        viewAs={ViewType.Participant}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
    assert.equal(
      wrapper
        .find('td')
        .at(0)
        .props().style.opacity,
      0.6
    );
    assert.equal(
      wrapper
        .find('td')
        .at(1)
        .props().style.opacity,
      0.6
    );
  });

  it('renders with dashed border when lockable lesson and instructor is not verified', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        viewAs={ViewType.Instructor}
        lockableAuthorized={false}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with dashed border and not faded when lockable lesson and lesson locked for participants in instructors section', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        viewAs={ViewType.Instructor}
        lockableAuthorized={true}
        lessonIsLockedForAllStudents={() => true}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
    assert.equal(
      wrapper
        .find('td')
        .at(0)
        .props().style.opacity,
      undefined
    );
    assert.equal(
      wrapper
        .find('td')
        .at(1)
        .props().style.opacity,
      undefined
    );
  });

  it('disables bubbles when locked for participant', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        viewAs={ViewType.Participant}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.strictEqual(
      wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
      true
    );
  });

  it('disables bubbles when lockable lesson and instructor not verified', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        viewAs={ViewType.Instructor}
        lockableAuthorized={false}
        lessonIsLockedForUser={() => true}
      />
    );
    assert.strictEqual(
      wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
      true
    );
  });

  it('does not disable bubbles when lockable lesson and instructor verified', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        viewAs={ViewType.Instructor}
        lockableAuthorized={true}
        lessonIsLockedForUser={() => false}
        lessonIsLockedForAllStudents={() => true}
      />
    );
    assert.strictEqual(
      wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
      false
    );
  });

  it('has an eye slash icon when hidden for participants', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Participant}
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

  it('has a lock icon when lockable and locked for user', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        lessonIsLockedForUser={() => true}
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

  it('has a lock icon when lockable and locked for section', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        lessonIsLockedForAllStudents={() => true}
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
    const wrapper = shallow(
      <SummaryProgressRow {...baseProps} lesson={fakeLesson('Maze', 1, true)} />
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
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Participant}
        lessonIsLockedForUser={() => true}
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
