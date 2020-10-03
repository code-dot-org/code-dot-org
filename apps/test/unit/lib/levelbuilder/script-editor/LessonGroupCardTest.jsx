import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedLessonGroupCard as LessonGroupCard} from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroupCard';
import sinon from 'sinon';

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
      lessonGroup: {
        key: 'lg-key',
        display_name: 'Display Name',
        position: 1,
        user_facing: true,
        description: 'Lesson group description',
        big_questions: 'Big questions',
        lessons: [
          {
            id: 100,
            name: 'A',
            position: 1,
            key: 'lesson-1'
          },
          {
            name: 'B',
            id: 101,
            position: 2,
            key: 'lesson-2'
          }
        ]
      }
    };
  });

  it('displays LessonGroupCard correctly', () => {
    const wrapper = mount(<LessonGroupCard {...defaultProps} />);

    expect(wrapper.find('OrderControls')).to.have.lengthOf(1);
    expect(wrapper.find('LessonToken')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(1);
    expect(wrapper.find('input')).to.have.lengthOf(1);
    expect(wrapper.find('textarea')).to.have.lengthOf(2);

    expect(wrapper.contains('Lesson Group Name:')).to.be.true;
    expect(wrapper.contains('Big Questions')).to.be.true;
    expect(wrapper.contains('Description')).to.be.true;

    expect(
      wrapper
        .find('textarea')
        .at(0)
        .props().value
    ).to.equal('Lesson group description');
    expect(
      wrapper
        .find('textarea')
        .at(1)
        .props().value
    ).to.equal('Big questions');
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

  it('edit lesson group description', () => {
    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);

    const textArea = wrapper.find('textarea').at(0);
    textArea.simulate('change', {target: {value: 'New Description'}});
    expect(updateLessonGroupField).to.have.been.calledWith(
      1,
      'description',
      'New Description'
    );
  });

  it('edit lesson group big questions', () => {
    const wrapper = shallow(<LessonGroupCard {...defaultProps} />);

    const textArea = wrapper.find('textarea').at(1);
    textArea.simulate('change', {target: {value: 'New Big Questions'}});
    expect(updateLessonGroupField).to.have.been.calledWith(
      1,
      'big_questions',
      'New Big Questions'
    );
  });
});
