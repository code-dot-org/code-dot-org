import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import HttpClient from '@cdo/apps/util/HttpClient';
import RubricContainer from '@cdo/apps/templates/rubrics/RubricContainer';

describe('RubricContainer', () => {
  const defaultRubric = {
    learningGoals: [
      {
        key: 'goal1',
        learningGoal: 'goal 1',
        aiEnabled: false,
        evidenceLevels: [],
      },
      {
        key: 'goal2',
        learningGoal: 'goal 2',
        aiEnabled: true,
        evidenceLevels: [],
      },
    ],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
  };

  const defaultProps = {
    rubric: defaultRubric,
    teacherHasEnabledAi: true,
    studentLevelInfo: {},
    currentLevelName: 'test_level',
  };

  const processEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));

  it('shows learning goals with correct props when viewing student work on assessment level', () => {
    const wrapper = shallow(
      <RubricContainer
        {...defaultProps}
        studentLevelInfo={{name: 'Grace Hopper', timeSpent: 706}}
      />
    );
    const renderedLearningGoals = wrapper.find('LearningGoal');
    expect(renderedLearningGoals).to.have.lengthOf(2);
    expect(
      renderedLearningGoals.at(0).props().learningGoal.learningGoal
    ).to.equal('goal 1');
    expect(renderedLearningGoals.at(0).props().canProvideFeedback).to.equal(
      true
    );
    expect(
      renderedLearningGoals.at(1).props().learningGoal.learningGoal
    ).to.equal('goal 2');
    expect(renderedLearningGoals.at(1).props().canProvideFeedback).to.equal(
      true
    );
  });

  it('shows learning goals with correct props when viewing student work on non assessment level', () => {
    const wrapper = shallow(
      <RubricContainer
        {...defaultProps}
        studentLevelInfo={{name: 'Grace Hopper', timeSpent: 706}}
        currentLevelName="non_assessment_level"
      />
    );
    const renderedLearningGoals = wrapper.find('LearningGoal');
    expect(renderedLearningGoals).to.have.lengthOf(2);
    expect(
      renderedLearningGoals.at(0).props().learningGoal.learningGoal
    ).to.equal('goal 1');
    expect(renderedLearningGoals.at(0).props().canProvideFeedback).to.equal(
      false
    );
    expect(
      renderedLearningGoals.at(1).props().learningGoal.learningGoal
    ).to.equal('goal 2');
    expect(renderedLearningGoals.at(1).props().canProvideFeedback).to.equal(
      false
    );
  });

  it('shows learning goals with correct props when not viewing student work', () => {
    const wrapper = shallow(
      <RubricContainer {...defaultProps} studentLevelInfo={null} />
    );
    const renderedLearningGoals = wrapper.find('LearningGoal');
    expect(renderedLearningGoals).to.have.lengthOf(2);
    expect(
      renderedLearningGoals.at(0).props().learningGoal.learningGoal
    ).to.equal('goal 1');
    expect(renderedLearningGoals.at(0).props().canProvideFeedback).to.equal(
      false
    );
    expect(
      renderedLearningGoals.at(1).props().learningGoal.learningGoal
    ).to.equal('goal 2');
    expect(renderedLearningGoals.at(1).props().canProvideFeedback).to.equal(
      false
    );
  });

  it('shows level title', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <RubricContainer
        {...defaultProps}
        studentLevelInfo={{
          name: 'Grace Hopper',
        }}
      />
    );
    expect(wrapper.text()).to.include('Lesson 3: Data Structures');
  });

  it('shows student data if provided', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <RubricContainer
        {...defaultProps}
        studentLevelInfo={{
          name: 'Grace Hopper',
          timeSpent: 305,
          lastAttempt: '1980-07-31T00:00:00.000Z',
          attempts: 6,
        }}
      />
    );
    expect(wrapper.text()).to.include('Grace Hopper');
    expect(wrapper.text()).to.include('time spent 5m 5s');
    expect(wrapper.text()).to.include('6 attempts');
    expect(wrapper.text()).to.include('last updated');
  });

  it('handles missing student data', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <RubricContainer
        {...defaultProps}
        studentLevelInfo={{
          name: 'Grace Hopper',
        }}
      />
    );
    expect(wrapper.text()).to.include('Grace Hopper');
    expect(wrapper.text()).to.not.include('time spent');
    expect(wrapper.text()).to.include('0 attempts');
    expect(wrapper.text()).to.not.include('last updated');
  });

  it('doesnt show student level data if not on level for evaluation', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <RubricContainer
        {...defaultProps}
        studentLevelInfo={{
          name: 'Grace Hopper',
          attempts: 6,
        }}
        currentLevelName="not_test_level"
      />
    );
    expect(wrapper.text()).to.include('Grace Hopper');
    expect(wrapper.text()).to.not.include('6 attempts');
    expect(wrapper.text()).to.include('Feedback will be available on Level 7');
  });

  it('shows submit button if has student data and on level for evaluation', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        currentLevelName="test_level"
        studentLevelInfo={{name: 'Grace Hopper'}}
        canProvideFeedback
      />
    );
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('handles successful submit button click', async () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        teacherHasEnabledAi
        currentLevelName="test_level"
        studentLevelInfo={{name: 'Grace Hopper'}}
      />
    );
    const postStub = sinon.stub(HttpClient, 'post').returns(
      Promise.resolve({
        json: () => {
          return {submittedAt: '1990-07-31T00:00:00.000Z'};
        },
      })
    );
    wrapper.find('Button').simulate('click');
    expect(postStub).to.have.been.calledOnce;
    postStub.restore();
    expect(wrapper.find('Button').props().disabled).to.be.true;
    await processEventLoop();
    wrapper.update();
    expect(wrapper.find('Button').props().disabled).to.be.false;
    expect(wrapper.find('BodyThreeText').at(1).props().children).to.include(
      'Feedback submitted at'
    );
  });

  it('handles error on submit button click', async () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        teacherHasEnabledAi
        studentLevelInfo={{name: 'Grace Hopper'}}
        currentLevelName="test_level"
      />
    );
    const postStub = sinon.stub(HttpClient, 'post').returns(Promise.reject());
    wrapper.find('Button').simulate('click');
    expect(postStub).to.have.been.calledOnce;
    postStub.restore();
    expect(wrapper.find('Button').props().disabled).to.be.true;
    await processEventLoop();
    expect(wrapper.find('BodyThreeText').at(1).props().children).to.equal(
      'Error submitting feedback to student.'
    );
  });
});
