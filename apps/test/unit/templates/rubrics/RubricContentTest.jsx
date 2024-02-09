import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import HttpClient from '@cdo/apps/util/HttpClient';
import RubricContent from '@cdo/apps/templates/rubrics/RubricContent';
import experiments from '@cdo/apps/util/experiments';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';

describe('RubricContent', () => {
  let store;
  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  const defaultRubric = {
    id: 1,
    learningGoals: [
      {
        id: 1,
        key: '1',
        learningGoal: 'goal 1',
        aiEnabled: false,
        evidenceLevels: [],
      },
      {
        id: 2,
        key: '2',
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

  const studentLevelInfo = {
    name: 'Grace Hopper',
    timeSpent: 305,
    lastAttempt: '1980-07-31T00:00:00.000Z',
    attempts: 6,
  };

  const defaultProps = {
    rubric: defaultRubric,
    teacherHasEnabledAi: true,
    studentLevelInfo: studentLevelInfo,
    canProvideFeedback: true,
    onLevelForEvaluation: true,
    visible: true,
  };

  const aiEvaluations = [
    {id: 2, learning_goal_id: 2, understanding: 2, ai_confidence: 2},
  ];

  const processEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));

  it('displays LearningGoals component with correct props when viewing student work on assessment level', () => {
    const wrapper = mount(
      <Provider store={store}>
        <RubricContent {...defaultProps} aiEvaluations={aiEvaluations} />
      </Provider>
    );
    expect(wrapper.find('LearningGoals').length).to.equal(1);
    expect(wrapper.find('LearningGoals').prop('studentLevelInfo')).to.equal(
      studentLevelInfo
    );
    expect(wrapper.find('LearningGoals').prop('learningGoals')).to.equal(
      defaultRubric.learningGoals
    );
    expect(wrapper.find('LearningGoals').prop('aiEvaluations')).to.equal(
      aiEvaluations
    );
  });

  it('displays Student and Section selectors', () => {
    experiments.setEnabled('ai-rubrics-redesign', true);
    const wrapper = mount(
      <Provider store={store}>
        <RubricContent {...defaultProps} />
      </Provider>
    );
    expect(wrapper.find('SectionSelector').length).to.equal(1);
    expect(wrapper.find('StudentSelector').length).to.equal(1);
    experiments.setEnabled('ai-rubrics-redesign', false);
  });

  it('shows learning goals with correct props when viewing student work on non assessment level', () => {
    const wrapper = shallow(
      <RubricContent
        {...defaultProps}
        studentLevelInfo={{name: 'Grace Hopper', timeSpent: 706}}
        canProvideFeedback={false}
        onLevelForEvaluation={false}
      />
    );
    const renderedLearningGoals = wrapper.find('LearningGoals');
    expect(renderedLearningGoals).to.have.lengthOf(1);
    expect(renderedLearningGoals.props().learningGoals).to.equal(
      defaultRubric.learningGoals
    );
    expect(renderedLearningGoals.props().canProvideFeedback).to.equal(false);
  });

  it('shows learning goals with correct props when not viewing student work', () => {
    const wrapper = shallow(
      <RubricContent
        {...defaultProps}
        studentLevelInfo={null}
        canProvideFeedback={false}
      />
    );
    const renderedLearningGoals = wrapper.find('LearningGoals');
    expect(renderedLearningGoals).to.have.lengthOf(1);
    expect(renderedLearningGoals.props().learningGoals).to.equal(
      defaultRubric.learningGoals
    );
    expect(renderedLearningGoals.props().canProvideFeedback).to.equal(false);
  });

  it('shows level title when teacher is viewing student work', () => {
    const wrapper = shallow(<RubricContent {...defaultProps} />);
    expect(wrapper.find('Heading5').at(0).props().children).to.equal(
      'Lesson 3: Data Structures'
    );
  });

  it('shows level title when teacher is not viewing student work', () => {
    const wrapper = shallow(
      <RubricContent {...defaultProps} studentLevelInfo={null} />
    );
    expect(wrapper.find('Heading5').at(0).props().children).to.equal(
      'Lesson 3: Data Structures'
    );
  });

  it('shows student data if provided', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <Provider store={store}>
        <RubricContent {...defaultProps} />
      </Provider>
    );
    expect(wrapper.text()).to.include('time spent 5m 5s');
    expect(wrapper.text()).to.include('6 attempts');
    expect(wrapper.text()).to.include('last updated');
  });

  it('handles missing student data', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <Provider store={store}>
        <RubricContent
          {...defaultProps}
          studentLevelInfo={{
            name: 'Grace Hopper',
          }}
        />
      </Provider>
    );
    expect(wrapper.text()).to.not.include('time spent');
    expect(wrapper.text()).to.include('0 attempts');
    expect(wrapper.text()).to.not.include('last updated');
  });

  it('doesnt show student level data if not on level for evaluation', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <Provider store={store}>
        <RubricContent
          {...defaultProps}
          studentLevelInfo={{
            name: 'Grace Hopper',
            attempts: 6,
          }}
          canProvideFeedback={false}
          onLevelForEvaluation={false}
        />
      </Provider>
    );
    expect(wrapper.text()).to.not.include('6 attempts');
    expect(wrapper.text()).to.include('Feedback will be available on Level 7');
  });

  it('shows submit button if has student data and on level for evaluation', () => {
    const wrapper = shallow(
      <RubricContent
        rubric={defaultRubric}
        studentLevelInfo={{name: 'Grace Hopper'}}
        canProvideFeedback
      />
    );
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('handles successful submit button click', async () => {
    const wrapper = shallow(
      <RubricContent
        rubric={defaultRubric}
        teacherHasEnabledAi
        canProvideFeedback
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
      <RubricContent
        rubric={defaultRubric}
        teacherHasEnabledAi
        studentLevelInfo={{name: 'Grace Hopper'}}
        canProvideFeedback
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

  it('does not pass down AI analysis to components when teacher has disabled AI', () => {
    const wrapper = mount(
      <Provider store={store}>
        <RubricContent {...defaultProps} teacherHasEnabledAi={false} />
      </Provider>
    );

    expect(wrapper.find('LearningGoals').prop('aiEvaluations')).to.not.equal(
      aiEvaluations
    );
  });

  it('shows info alert when not viewing project level', () => {
    const wrapper = shallow(
      <RubricContent {...defaultProps} onLevelForEvaluation={false} />
    );
    expect(wrapper.find('InfoAlert').length).to.equal(1);
    expect(wrapper.find('InfoAlert').props().text).to.equal(
      'Rubrics can only be evaluated on project levels.'
    );
  });

  it('shows info alert when not viewing student work', () => {
    const wrapper = shallow(
      <RubricContent {...defaultProps} studentLevelInfo={null} />
    );
    expect(wrapper.find('InfoAlert').length).to.equal(1);
    expect(wrapper.find('InfoAlert').props().text).to.equal(
      'Select a student from the Teacher Panel to view and evaluate their work.'
    );
  });
});
