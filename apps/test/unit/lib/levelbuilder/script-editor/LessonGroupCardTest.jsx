import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedLessonGroupCard as LessonGroupCard} from '@cdo/apps/lib/levelbuilder/unit-editor/LessonGroupCard';
import sinon from 'sinon';

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
      levels: []
    },
    {
      name: 'B',
      id: 101,
      position: 2,
      key: 'lesson-2',
      levels: []
    }
  ]
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
    addLesson = sinon.spy();
    moveGroup = sinon.spy();
    removeGroup = sinon.spy();
    moveLesson = sinon.spy();
    removeLesson = sinon.spy();
    setLessonGroup = sinon.spy();
    reorderLesson = sinon.spy();
    updateLessonGroupField = sinon.spy();
    setTargetLessonGroup = sinon.spy();
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
            levels: []
          },
          {
            name: 'B',
            id: 101,
            position: 2,
            key: 'lesson-2',
            levels: []
          }
        ]
      }
    };
  });

  it('displays LessonGroupCard correctly when user facing', () => {
    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);

    expect(wrapper.find('OrderControls')).to.have.lengthOf(1);
    expect(wrapper.find('LessonToken')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(1);
    expect(wrapper.find('input')).to.have.lengthOf(1);
    expect(wrapper.find('MarkdownEnabledTextarea')).to.have.lengthOf(2);

    expect(wrapper.contains('Lesson Group Name:')).to.be.true;

    expect(
      wrapper
        .find('MarkdownEnabledTextarea')
        .at(0)
        .props().markdown
    ).to.equal('Lesson group description');
    expect(
      wrapper
        .find('MarkdownEnabledTextarea')
        .at(1)
        .props().markdown
    ).to.equal('Big questions');
  });

  it('displays LessonGroupCard correctly when not user facing', () => {
    const wrapper = shallow(
      <LessonGroupCard {...defaultProps} lessonGroup={nonUserFacingGroup} />
    );

    expect(wrapper.find('OrderControls')).to.have.lengthOf(0);
    expect(wrapper.find('LessonToken')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(1);
    expect(wrapper.find('input')).to.have.lengthOf(0);
    expect(wrapper.find('MarkdownEnabledTextarea')).to.have.lengthOf(0);

    expect(wrapper.contains('Lesson Group Name:')).to.be.false;
    expect(wrapper.contains('Big Questions')).to.be.false;
    expect(wrapper.contains('Description')).to.be.false;
  });

  it('adds lesson when button pressed', () => {
    const prompt = sinon.stub(window, 'prompt');
    prompt.returns('Lesson Name');

    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);

    const button = wrapper.find('button');
    expect(button.text()).to.include('Lesson');
    button.simulate('mouseDown');

    expect(addLesson).to.have.been.calledOnce;
    window.prompt.restore();
  });

  it('displays clone lesson dialog when cloning a lesson', () => {
    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);
    wrapper.instance().handleCloneLesson(0);
    expect(wrapper.find('CloneLessonDialog')).to.have.lengthOf(1);
  });
});
