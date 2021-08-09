import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import LessonToken, {
  LessonTokenContents
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
  hasLessonPlan: true
};

describe('LessonToken', () => {
  let handleDragStart, cloneLesson, removeLesson, defaultProps;

  describe('LessonToken', () => {
    beforeEach(() => {
      handleDragStart = sinon.spy();
      cloneLesson = sinon.spy();
      removeLesson = sinon.spy();
      defaultProps = {
        dragging: false,
        draggedLessonPos: false,
        delta: 0,
        handleDragStart,
        cloneLesson,
        removeLesson,
        lesson: defaultLesson
      };
    });

    it('renders a Motion component', () => {
      const wrapper = shallow(<LessonToken {...defaultProps} />);
      expect(wrapper.find('Motion').length).to.equal(1);
    });
  });

  describe('LessonTokenContents', () => {
    beforeEach(() => {
      handleDragStart = sinon.spy();
      cloneLesson = sinon.spy();
      removeLesson = sinon.spy();
      defaultProps = {
        y: 0,
        scale: 0,
        shadow: 0,
        draggedLessonPos: false,
        handleDragStart,
        cloneLesson,
        removeLesson,
        lesson: defaultLesson
      };
    });

    it('renders existing lesson with edit and clone buttons', () => {
      const wrapper = shallow(<LessonTokenContents {...defaultProps} />);
      expect(wrapper.contains('Lesson 1')).to.be.true;
      expect(wrapper.find('.fa-pencil').length).to.equal(1);
      expect(wrapper.find('.fa-clone').length).to.equal(1);
      expect(wrapper.contains('assessment')).to.be.true;
    });

    it('renders newly added lesson without edit and clone buttons', () => {
      let wrapper = shallow(
        <LessonTokenContents
          {...defaultProps}
          lesson={{
            key: 'new-lesson',
            name: 'New Lesson',
            levels: [],
            position: 1
          }}
        />
      );
      expect(wrapper.contains('New Lesson'), 'New Lesson').to.be.true;
      expect(wrapper.find('.fa-pencil').length, 'fa-pencil').to.equal(0);
      expect(wrapper.find('.fa-clone').length, 'fa-clone').to.equal(0);
    });
  });
});
