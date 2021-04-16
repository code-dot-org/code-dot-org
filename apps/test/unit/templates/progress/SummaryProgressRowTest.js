import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import SummaryProgressRow from '@cdo/apps/templates/progress/SummaryProgressRow';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';

describe('SummaryProgressRow', () => {
  const baseProps = {
    dark: false,
    lesson: fakeLesson('Maze', 1),
    lessonNumber: 3,
    levels: fakeLevels(4),
    lessonIsVisible: () => true,
    lessonIsLockedForUser: () => false,
    lockableAuthorized: false
  };

  it('renders with dashed border when lessonIsVisible for teachers only', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with dashed border when locked as student', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        viewAs={ViewType.Student}
        lessonIsLockedForUser={() => {
          return true;
        }}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('renders with dashed border when lockable lesson and teacher is not verified', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        viewAs={ViewType.Teacher}
        lockableAuthorized={false}
        lessonIsLockedForUser={() => {
          return true;
        }}
      />
    );
    assert.equal(wrapper.props().style.borderStyle, 'dashed');
  });

  it('disables bubbles when locked for student', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lessonIsLockedForUser={() => {
          return true;
        }}
      />
    );
    assert.strictEqual(
      wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
      true
    );
  });

  it('disables bubbles when lockable lesson and teacher not verified', () => {
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        viewAs={ViewType.Teacher}
        lockableAuthorized={false}
        lessonIsLockedForUser={() => {
          return true;
        }}
      />
    );
    assert.strictEqual(
      wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
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
    const wrapper = shallow(
      <SummaryProgressRow
        {...baseProps}
        lesson={fakeLesson('Maze', 1, true)}
        lessonIsLockedForUser={() => {
          return true;
        }}
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
        lessonIsVisible={(lesson, viewAs) => viewAs !== ViewType.Student}
        lessonIsLockedForUser={() => {
          return true;
        }}
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
