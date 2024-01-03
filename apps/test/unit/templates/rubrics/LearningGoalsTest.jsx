import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import LearningGoals from '@cdo/apps/templates/rubrics/LearningGoals';

describe('LearningGoals', () => {
  const studentLevelInfo = {name: 'Grace Hopper', timeSpent: 706};

  const learningGoals = [
    {
      id: 2,
      key: 'abcd',
      learningGoal: 'Testing 1',
      aiEnabled: true,
      evidenceLevels: [{id: 1, understanding: 1, teacherDescription: 'test'}],
      tips: 'Tips',
    },
    {
      key: 'efgh',
      learningGoal: 'Testing 2',
      aiEnabled: false,
      evidenceLevels: [{id: 1, understanding: 1, teacherDescription: 'test'}],
      tips: 'Tips',
    },
  ];

  const submittedEvaluation = {
    feedback: 'test feedback',
    understanding: RubricUnderstandingLevels.LIMITED,
  };

  const aiEvaluations = [
    {
      id: 2,
      learning_goal_id: 2,
      understanding: 2,
      ai_confidence: 50,
    },
  ];

  it('renders EvidenceLevels', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('EvidenceLevels')).to.have.lengthOf(1);
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).to.deep.equal(
      [{id: 1, understanding: 1, teacherDescription: 'test'}]
    );
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
  });

  it('changes learning goal when left and right buttons are pressed', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('StrongText').props().children).to.equal(
      learningGoals[0].learningGoal
    );
    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('StrongText').props().children).to.equal(
      learningGoals[1].learningGoal
    );
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('StrongText').props().children).to.equal(
      learningGoals[0].learningGoal
    );
  });

  it('renders AiAssessment when teacher has AiEnabled and the learning goal can be tested by AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={true}
        aiConfidence={50}
        aiUnderstanding={3}
        studentLevelInfo={studentLevelInfo}
        aiEvaluations={aiEvaluations}
      />
    );
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(1);
    expect(wrapper.find('AiAssessment').props().studentName).to.equal(
      studentLevelInfo.name
    );
    expect(wrapper.find('AiAssessment').props().aiConfidence).to.equal(50);
    expect(wrapper.find('AiAssessment').props().aiUnderstandingLevel).to.equal(
      2
    );
    expect(wrapper.find('AiAssessment').props().isAiAssessed).to.equal(true);
  });

  it('does not renders AiAssessment when teacher has disabled ai', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
        studentLevelInfo={studentLevelInfo}
      />
    );
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(0);
  });

  it('renders tips for teachers', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        isStudent={false}
      />
    );
    expect(wrapper.find('Heading6')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown').props().markdown).to.equal('Tips');
  });

  it('does not render tips for students', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} isStudent={true} />
    );
    expect(wrapper.find('Heading6')).to.have.lengthOf(0);
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(0);
  });

  it('shows AI token when AI is enabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('StrongText').props().children).to.equal(
      learningGoals[0].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(1);
  });

  it('does not show AI token when AI is disabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('StrongText').props().children).to.equal(
      learningGoals[1].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token when teacher has disabled AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
      />
    );
    expect(wrapper.find('StrongText').props().children).to.equal(
      learningGoals[0].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token after teacher has submitted evaluation', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.LIMITED,
        }}
      />
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('sends event when new learning goal is selected', () => {
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');

    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
      />
    );
    wrapper.find('button').first().simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'efgh',
        learningGoal: 'Testing 2',
      }
    );
    wrapper.find('button').first().simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'abcd',
        learningGoal: 'Testing 1',
      }
    );
    sendEventSpy.restore();
  });

  it('displays Evaluate when AI is disabled and no understanding has been selected', () => {
    const wrapper = mount(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        canProvideFeedback
      />
    );
    wrapper.update();
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('BodyThreeText').first().text()).to.include('Evaluate');
    wrapper.unmount();
  });

  it('displays Approve when AI is enabled and no understanding has been selected', () => {
    const wrapper = mount(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        canProvideFeedback
      />
    );
    wrapper.update();
    expect(wrapper.find('BodyThreeText').first().text()).to.include('Approve');
    wrapper.unmount();
  });

  it('shows feedback in disabled textbox when available', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: 1,
        }}
      />
    );
    expect(wrapper.find('textarea').props().value).to.equal('test feedback');
    expect(wrapper.find('textarea').props().disabled).to.equal(true);
    expect(wrapper.find('FontAwesome').at(1).props().icon).to.equal('message');
  });

  it('shows editable textbox for feedback when the teacher can provide feedback', () => {
    const wrapper = shallow(
      <LearningGoals
        canProvideFeedback={true}
        studentLevelInfo={studentLevelInfo}
        learningGoals={learningGoals}
      />
    );
    expect(wrapper.find('textarea').props().disabled).to.equal(false);
  });

  it('shows understanding in header if submittedEvaluation contains understand', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.LIMITED,
        }}
      />
    );
    expect(wrapper.find('BodyThreeText').props().children).to.equal(
      'Limited Evidence'
    );
  });

  it('shows No Evidence understanding in header if submittedEvaluation contains understand', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.NONE,
        }}
      />
    );
    expect(wrapper.find('BodyThreeText').props().children).to.equal(
      'No Evidence'
    );
  });

  it('passes isStudent down to EvidenceLevels', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
        isStudent
      />
    );
    expect(wrapper.find('EvidenceLevels').props().isStudent).to.equal(true);
    expect(wrapper.find('EvidenceLevels').props().submittedEvaluation).to.equal(
      submittedEvaluation
    );
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).to.equal(
      learningGoals[0]['evidenceLevels']
    );
  });
});
