import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedLessonGroupCard as LessonGroupCard} from '@cdo/apps/levelbuilder/unit-editor/LessonGroupCard';

export const nonUserFacingGroup = {
  key: 'lg-key',
  displayName: null,
  position: 1,
  userFacing: false,
  description: '',
  bigQuestions: '',
  lessons: [
    {
      id: 100,
      name: 'A',
      position: 1,
      key: 'lesson-1',
      levels: [],
    },
    {
      name: 'B',
      id: 101,
      position: 2,
      key: 'lesson-2',
      levels: [],
    },
  ],
};

describe('LessonGroupCard', () => {
  let defaultProps,
    addLesson,
    moveGroup,
    removeGroup,
    moveLesson,
    removeLesson,
    setLessonGroup,
    reorderLesson,
    updateLessonGroupField,
    setTargetLessonGroup;

  beforeEach(() => {
    addLesson = jest.fn();
    moveGroup = jest.fn();
    removeGroup = jest.fn();
    moveLesson = jest.fn();
    removeLesson = jest.fn();
    setLessonGroup = jest.fn();
    reorderLesson = jest.fn();
    updateLessonGroupField = jest.fn();
    setTargetLessonGroup = jest.fn();
    defaultProps = {
      addLesson,
      moveGroup,
      removeGroup,
      moveLesson,
      removeLesson,
      setLessonGroup,
      reorderLesson,
      updateLessonGroupField,
      setTargetLessonGroup,
      lessonGroupsCount: 1,
      lessonGroupMetrics: {},
      targetLessonGroupPos: null,
      lessonKeys: [],
      allowMajorCurriculumChanges: true,
      lessonGroup: {
        key: 'lg-key',
        displayName: 'Display Name',
        position: 1,
        userFacing: true,
        description: 'Lesson group description',
        bigQuestions: 'Big questions',
        lessons: [
          {
            id: 100,
            name: 'A',
            position: 1,
            key: 'lesson-1',
            levels: [],
          },
          {
            name: 'B',
            id: 101,
            position: 2,
            key: 'lesson-2',
            levels: [],
          },
        ],
      },
    };
  });

  it('displays LessonGroupCard correctly when user facing', () => {
    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);

    expect(wrapper.find('OrderControls')).toHaveLength(1);
    expect(wrapper.find('LessonToken')).toHaveLength(2);
    expect(wrapper.find('button')).toHaveLength(1);
    expect(wrapper.find('input')).toHaveLength(1);
    expect(wrapper.find('MarkdownEnabledTextarea')).toHaveLength(2);

    expect(wrapper.contains('Lesson Group Name:')).toBe(true);

    expect(wrapper.find('MarkdownEnabledTextarea').at(0).props().markdown).toBe(
      'Lesson group description'
    );
    expect(wrapper.find('MarkdownEnabledTextarea').at(1).props().markdown).toBe(
      'Big questions'
    );
  });

  it('hides OrderControls when not allowed to make major curriculum changes', () => {
    const wrapper = shallow(
      <LessonGroupCard {...defaultProps} allowMajorCurriculumChanges={false} />
    );

    expect(wrapper.find('OrderControls')).toHaveLength(0);
  });

  it('hides button when not allowed to make major curriculum changes and not the last LessonGroupCard', () => {
    const wrapper = shallow(
      <LessonGroupCard
        {...defaultProps}
        allowMajorCurriculumChanges={false}
        lessonGroupsCount={2}
      />
    );

    expect(wrapper.find('button')).toHaveLength(0);
  });

  it('shows button when not allowed to make major curriculum changes and is the last LessonGroupCard', () => {
    const wrapper = shallow(
      <LessonGroupCard
        {...defaultProps}
        allowMajorCurriculumChanges={false}
        lessonGroupsCount={1}
      />
    );

    expect(wrapper.find('button')).toHaveLength(1);
  });

  it('displays LessonGroupCard correctly when not user facing', () => {
    const wrapper = shallow(
      <LessonGroupCard {...defaultProps} lessonGroup={nonUserFacingGroup} />
    );

    expect(wrapper.find('OrderControls')).toHaveLength(0);
    expect(wrapper.find('LessonToken')).toHaveLength(2);
    expect(wrapper.find('button')).toHaveLength(1);
    expect(wrapper.find('input')).toHaveLength(0);
    expect(wrapper.find('MarkdownEnabledTextarea')).toHaveLength(0);

    expect(wrapper.contains('Lesson Group Name:')).toBe(false);
    expect(wrapper.contains('Big Questions')).toBe(false);
    expect(wrapper.contains('Description')).toBe(false);
  });

  it('adds lesson when button pressed', () => {
    const prompt = jest
      .spyOn(window, 'prompt')
      .mockClear()
      .mockImplementation();
    prompt.mockReturnValue('Lesson Name');

    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);

    const button = wrapper.find('button');
    expect(button.text()).toContain('Lesson');
    button.simulate('mouseDown');

    expect(addLesson).toHaveBeenCalledTimes(1);
    window.prompt.mockRestore();
  });

  it('displays clone lesson dialog when cloning a lesson', () => {
    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);
    wrapper.instance().handleCloneLesson(0);
    expect(wrapper.find('CloneLessonDialog')).toHaveLength(1);
  });
});
