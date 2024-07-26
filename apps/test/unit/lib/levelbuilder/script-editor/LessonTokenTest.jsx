import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonToken, {
  LessonTokenContents,
} from '@cdo/apps/lib/levelbuilder/unit-editor/LessonToken';

const defaultLesson = {
  id: 10,
  key: 'lesson-1',
  name: 'Lesson 1',
  levels: [],
  position: 1,
  relative_position: 1,
  lockable: false,
  unplugged: false,
  assessment: true,
  hasLessonPlan: true,
};

describe('LessonToken', () => {
  let handleDragStart, cloneLesson, removeLesson, defaultProps;

  describe('LessonToken', () => {
    beforeEach(() => {
      handleDragStart = jest.fn();
      cloneLesson = jest.fn();
      removeLesson = jest.fn();
      defaultProps = {
        dragging: false,
        draggedLessonPos: false,
        delta: 0,
        allowMajorCurriculumChanges: true,
        handleDragStart,
        cloneLesson,
        removeLesson,
        lesson: defaultLesson,
      };
    });

    it('renders a Motion component', () => {
      const wrapper = shallow(<LessonToken {...defaultProps} />);
      expect(wrapper.find('Motion').length).toBe(1);
    });
  });

  describe('LessonTokenContents', () => {
    beforeEach(() => {
      handleDragStart = jest.fn();
      cloneLesson = jest.fn();
      removeLesson = jest.fn();
      defaultProps = {
        y: 0,
        scale: 0,
        shadow: 0,
        draggedLessonPos: false,
        allowMajorCurriculumChanges: true,
        handleDragStart,
        cloneLesson,
        removeLesson,
        lesson: defaultLesson,
      };
    });

    it('hides movement and deleting buttons when not allowed to make major curriculum changes', () => {
      const wrapper = shallow(
        <LessonTokenContents
          {...defaultProps}
          allowMajorCurriculumChanges={false}
        />
      );
      expect(wrapper.find('.fa-arrows-v').length).toBe(0);
      expect(wrapper.find('.fa-times').length).toBe(0);
    });

    it('show movement and deleting buttons when allowed to make major curriculum changes', () => {
      const wrapper = shallow(
        <LessonTokenContents
          {...defaultProps}
          allowMajorCurriculumChanges={true}
        />
      );
      expect(wrapper.find('.fa-arrows-v').length).toBe(1);
      expect(wrapper.find('.fa-times').length).toBe(1);
    });

    it('renders existing lesson with edit and clone buttons', () => {
      const wrapper = shallow(<LessonTokenContents {...defaultProps} />);
      expect(wrapper.contains('Lesson 1')).toBe(true);
      expect(wrapper.find('.fa-pencil').length).toBe(1);
      expect(wrapper.find('.fa-clone').length).toBe(1);
      expect(wrapper.contains('assessment')).toBe(true);
    });

    it('renders newly added lesson without edit and clone buttons', () => {
      let wrapper = shallow(
        <LessonTokenContents
          {...defaultProps}
          lesson={{
            key: 'new-lesson',
            name: 'New Lesson',
            levels: [],
            position: 1,
          }}
        />
      );
      // New Lesson
      expect(wrapper.contains('New Lesson')).toBe(true);
      // fa-pencil
      expect(wrapper.find('.fa-pencil').length).toBe(0);
      // fa-clone
      expect(wrapper.find('.fa-clone').length).toBe(0);
    });
  });
});
