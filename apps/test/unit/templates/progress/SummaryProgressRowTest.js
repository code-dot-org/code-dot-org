import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import {UnconnectedSummaryProgressRow as SummaryProgressRow} from '@cdo/apps/templates/progress/SummaryProgressRow';

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
    expect(wrapper.props().id).toEqual('summary-progress-row-3');
  });

  describe('when viewing as Participant', () => {
    it('will not render if the lesson is hidden for students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Participant,
        lessonIsHiddenForStudents: true,
      });
      expect(wrapper.isEmptyRender()).toEqual(true);
    });

    it('renders as faded and with a dashed border when locked', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        viewAs: ViewType.Participant,
        lessonIsLockedForUser: () => true,
      });

      expect(wrapper.props().style.borderStyle).toEqual('dashed');
      expect(wrapper.find('td').at(0).props().style.opacity).toEqual(0.6);
      expect(wrapper.find('td').at(1).props().style.opacity).toEqual(0.6);
    });

    it('disables bubbles when locked', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        viewAs: ViewType.Participant,
        lessonIsLockedForUser: () => true,
      });

      expect(wrapper.find('Connect(ProgressBubbleSet)').props().disabled).toBe(
        true
      );
    });

    it('has a lock icon when lockable and locked for user', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        viewAs: ViewType.Participant,
        lessonIsLockedForUser: () => true,
      });

      expect(wrapper.find('FontAwesome').at(0).props().icon).toEqual('lock');
    });
  });

  describe('when viewing as Instructor', () => {
    it('renders with dashed border when viewing hidden lesson', () => {
      const wrapper = setUp({
        lessonIsHiddenForStudents: true,
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => false,
      });

      expect(wrapper.props().style.borderStyle).toEqual('dashed');
    });

    it('renders with dashed border and not faded when lockable lesson and lesson locked for participants in section', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => true,
      });

      expect(wrapper.props().style.borderStyle).toEqual('dashed');
      expect(wrapper.find('td').at(0).props().style.opacity).toEqual(undefined);
      expect(wrapper.find('td').at(1).props().style.opacity).toEqual(undefined);
    });

    it('does not disable bubbles when lockable lesson and unlocked for instructor', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => true,
      });

      expect(wrapper.find('Connect(ProgressBubbleSet)').props().disabled).toBe(
        false
      );
    });

    // It will be locked for the instructor if they are a not a verified teacher
    it('disables bubbles when locked for instructor', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => true,
      });

      expect(wrapper.find('Connect(ProgressBubbleSet)').props().disabled).toBe(
        true
      );
    });

    it('has a lock icon when lockable and locked for user', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => true,
      });

      expect(wrapper.find('FontAwesome').at(0).props().icon).toEqual('lock');
    });

    it('has a lock icon when lockable and locked for section', () => {
      const wrapper = setUp({
        lesson: fakeLesson('Maze', 1, true),
        lessonIsLockedForUser: () => true,
        lessonIsLockedForAllStudents: () => true,
      });

      expect(wrapper.find('FontAwesome').at(0).props().icon).toEqual('lock');
    });

    it('has an eye slash icon when hidden for participants', () => {
      const wrapper = setUp({
        lessonIsHiddenForStudents: true,
      });

      expect(wrapper.find('FontAwesome').first().props().icon).toEqual(
        'eye-slash'
      );
    });

    it('has an unlock icon when lockable and unlocked for instructor and students', () => {
      const wrapper = setUp({
        lessonIsLockedForUser: () => false,
        lessonIsLockedForAllStudents: () => false,
        lesson: fakeLesson('Maze', 1, true),
      });

      expect(wrapper.find('FontAwesome').at(0).props().icon).toEqual('unlock');
    });
  });
});
