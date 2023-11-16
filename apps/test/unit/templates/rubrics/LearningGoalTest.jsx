import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import LearningGoal from '@cdo/apps/templates/rubrics/LearningGoal';

describe('LearningGoal', () => {
  const studentLevelInfo = {name: 'Grace Hopper', timeSpent: 706};

  it('renders EvidenceLevels', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [{understanding: 1, teacherDescription: 'test'}],
        }}
        teacherHasEnabledAi
      />
    );
    expect(wrapper.find('EvidenceLevels')).to.have.lengthOf(1);
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).to.deep.equal(
      [{understanding: 1, teacherDescription: 'test'}]
    );
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(0);
  });

  it('renders AiAssessment when teacher has AiEnabled and the learning goal can be tested by AI', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          evidenceLevels: [{understanding: 1, teacherDescription: 'test'}],
          aiEnabled: true,
        }}
        teacherHasEnabledAi={true}
        aiConfidence={50}
        aiUnderstanding={3}
        studentLevelInfo={studentLevelInfo}
        aiEvalInfo={{
          id: 2,
          learning_goal_id: 2,
          understanding: 2,
          ai_confidence: 2,
        }}
      />
    );
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(1);
    expect(wrapper.find('AiAssessment').props().studentName).to.equal(
      studentLevelInfo.name
    );
    expect(wrapper.find('AiAssessment').props().aiConfidence).to.equal(50);
    expect(wrapper.find('AiAssessment').props().aiUnderstandingLevel).to.equal(
      3
    );
    expect(wrapper.find('AiAssessment').props().isAiAssessed).to.equal(true);
  });

  it('does not renders AiAssessment when teacher has disabled ai', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          evidenceLevels: [{understanding: 1, teacherDescription: 'test'}],
          aiEnabled: true,
        }}
        teacherHasEnabledAi={false}
        studentLevelInfo={studentLevelInfo}
      />
    );
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(0);
  });

  it('renders tips for teachers', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [],
          tips: 'Tips',
        }}
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
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [],
          tips: 'Tips',
        }}
        isStudent={true}
      />
    );
    expect(wrapper.find('Heading6')).to.have.lengthOf(0);
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(0);
  });

  it('shows AI token when AI is enabled', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [],
        }}
        teacherHasEnabledAi
      />
    );
    expect(wrapper.find('StrongText').props().children).to.equal('Testing');
    expect(wrapper.find('AiToken')).to.have.lengthOf(1);
  });

  it('does not show AI token when AI is disabled', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: false,
          evidenceLevels: [],
        }}
        teacherHasEnabledAi
      />
    );
    expect(wrapper.find('StrongText').props().children).to.equal('Testing');
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token when teacher has disabled AI', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [],
        }}
        teacherHasEnabledAi={false}
      />
    );
    expect(wrapper.find('StrongText').props().children).to.equal('Testing');
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token after teacher has submitted evaluation', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          evidenceLevels: [],
        }}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.LIMITED,
        }}
      />
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('sends event when closed and opened', () => {
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');

    const wrapper = shallow(
      <LearningGoal
        learningGoal={{key: 'key', learningGoal: 'Testing', evidenceLevels: []}}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
      />
    );
    wrapper.find('summary').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_EXPANDED_EVENT,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'key',
        learningGoal: 'Testing',
      }
    );
    wrapper.find('summary').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'key',
        learningGoal: 'Testing',
      }
    );
    sendEventSpy.restore();
  });

  it('displays Evaluate when AI is disabled and no understanding has been selected', () => {
    const wrapper = mount(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: false,
          evidenceLevels: [],
        }}
        teacherHasEnabledAi
        canProvideFeedback
      />
    );
    wrapper.update();
    expect(wrapper.find('BodyThreeText').text()).to.include('Evaluate');
    wrapper.unmount();
  });

  it('displays Approve when AI is enabled and no understanding has been selected', () => {
    const wrapper = mount(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [],
        }}
        teacherHasEnabledAi
        canProvideFeedback
      />
    );
    wrapper.update();
    expect(wrapper.find('BodyThreeText').text()).to.include('Approve');
    wrapper.unmount();
  });

  it('shows feedback in disabled textbox when available', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          evidenceLevels: [],
        }}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: 1,
        }}
      />
    );
    expect(wrapper.find('textarea').props().value).to.equal('test feedback');
    expect(wrapper.find('textarea').props().disabled).to.equal(true);
    expect(wrapper.find('FontAwesome').at(0).props().icon).to.equal('message');
  });

  it('shows editable textbox for feedback when the teacher can provide feedback', () => {
    const wrapper = shallow(
      <LearningGoal
        canProvideFeedback={true}
        studentLevelInfo={studentLevelInfo}
        learningGoal={{
          learningGoal: 'Testing',
          evidenceLevels: [],
        }}
      />
    );
    expect(wrapper.find('textarea').props().disabled).to.equal(false);
  });

  it('shows understanding in header if submittedEvaluation contains understand', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          evidenceLevels: [],
        }}
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
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          evidenceLevels: [],
        }}
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
    const props = {
      learningGoal: {
        learningGoal: 'Testing',
        evidenceLevels: [{understanding: 1, teacherDescription: 'test'}],
      },
      submittedEvaluation: {
        feedback: 'test feedback',
        understanding: RubricUnderstandingLevels.LIMITED,
      },
      canProvideFeedback: false,
      isStudent: true,
    };
    const wrapper = shallow(<LearningGoal {...props} />);
    expect(wrapper.find('EvidenceLevels').props().isStudent).to.equal(true);
    expect(wrapper.find('EvidenceLevels').props().submittedEvaluation).to.equal(
      props.submittedEvaluation
    );
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).to.equal(
      props.learningGoal.evidenceLevels
    );
  });
});
