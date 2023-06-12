import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedSummaryProgressRow as SummaryProgressRow} from '@cdo/apps/templates/progress/SummaryProgressRow';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';

const baseProps = {
  dark: false,
  lesson: fakeLesson('Maze', 1, false, 3),
  levels: fakeLevels(4),
  lessonIsHiddenForStudents: false,
  lessonIsLockedForUser: () => false,
  lessonIsLockedForAllStudents: () => false,
  viewAs: ViewType.Instructor,
};

const setUp = (overrideProps = {}) => {
  const props = {...baseProps, ...overrideProps};
  return shallow(<SummaryProgressRow {...props} />);
};

describe('SummaryProgressRow', () => {
  // This ID is used by the EndOfLessonDialog to scroll the recently completed lesson into view
  it('renders with the expected ID', () => {
    const wrapper = setUp();
    assert.equal(wrapper.props().id, 'summary-progress-row-3');
  });

  describe('when viewing as Participant', () => {
    it('will not render if the lesson is hidden for students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Participant,
        lessonIsHiddenForStudents: true,
      });
      assert.equal(wrapper.isEmptyRender(), true);
    });

    it('renders as faded and with a dashed border when locked', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        viewAs: ViewType.Participant,
        lessonIsLockedForUser: () => true,
      });

      assert.equal(wrapper.props().style.borderStyle, 'dashed');
      assert.equal(wrapper.find('td').at(0).props().style.opacity, 0.6);
      assert.equal(wrapper.find('td').at(1).props().style.opacity, 0.6);
    });

    it('disables bubbles when locked', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        viewAs: ViewType.Participant,
        lessonIsLockedForUser: () => true,
      });

      assert.strictEqual(
        wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
        true
      );
    });

    it('has a lock icon when lockable and locked for user', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        viewAs: ViewType.Participant,
        lessonIsLockedForUser: () => true,
      });

      assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'lock');
    });
  });

  describe('when viewing as Instructor', () => {
    it('renders with dashed border when viewing hidden lesson', () => {
      const wrapper = setUp({
        lessonIsHiddenForStudents: true,
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => false,
      });

      assert.equal(wrapper.props().style.borderStyle, 'dashed');
    });

    it('renders with dashed border and not faded when lockable lesson and lesson locked for participants in section', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => true,
      });

      assert.equal(wrapper.props().style.borderStyle, 'dashed');
      assert.equal(wrapper.find('td').at(0).props().style.opacity, undefined);
      assert.equal(wrapper.find('td').at(1).props().style.opacity, undefined);
    });

    it('does not disable bubbles when lockable lesson and unlocked for instructor', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => true,
      });

      assert.strictEqual(
        wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
        false
      );
    });

    // It will be locked for the instructor if they are a not a verified teacher
    it('disables bubbles when locked for instructor', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => true,
      });

      assert.strictEqual(
        wrapper.find('Connect(ProgressBubbleSet)').props().disabled,
        true
      );
    });

    it('has a lock icon when lockable and locked for user', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => true,
      });

      assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'lock');
    });

    it('has a lock icon when lockable and locked for section', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => true,
        lessonIsLockedForAllStudents: () => true,
      });

      assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'lock');
    });

    it('has an eye slash icon when hidden for participants', () => {
      const wrapper = setUp({
        lessonIsHiddenForStudents: true,
      });

      assert.equal(
        wrapper.find('FontAwesome').first().props().icon,
        'eye-slash'
      );
    });

    it('has an unlock icon when lockable and unlocked for instructor and students', () => {
      const wrapper = setUp({
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => false,
        lesson: fakeLesson('Maze', 1, true),
      });

      assert.equal(wrapper.find('FontAwesome').at(0).props().icon, 'unlock');
    });
  });
});
