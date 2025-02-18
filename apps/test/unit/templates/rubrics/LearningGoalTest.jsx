import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import LearningGoal from '@cdo/apps/templates/rubrics/LearningGoal';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

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
    expect(wrapper.find('EvidenceLevels')).toHaveLength(1);
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).toEqual([
      {understanding: 1, teacherDescription: 'test'},
    ]);
    expect(wrapper.find('SafeMarkdown')).toHaveLength(0);
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
          aiConfidencePassFail: 2,
        }}
      />
    );
    expect(wrapper.find('AiAssessment')).toHaveLength(1);
    expect(wrapper.find('AiAssessment').props().studentName).toBe(
      studentLevelInfo.name
    );
    expect(wrapper.find('AiAssessment').props().aiConfidence).toBe(50);
    expect(wrapper.find('AiAssessment').props().aiUnderstandingLevel).toBe(3);
    expect(wrapper.find('AiAssessment').props().isAiAssessed).toBe(true);
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
    expect(wrapper.find('AiAssessment')).toHaveLength(0);
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
    expect(wrapper.find('Heading6')).toHaveLength(2);
    expect(wrapper.find('SafeMarkdown')).toHaveLength(1);
    expect(wrapper.find('SafeMarkdown').props().markdown).toBe('Tips');
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
        teacherHasEnabledAi={false}
        isStudent={true}
      />
    );
    expect(wrapper.find('Heading6')).toHaveLength(1);
    expect(wrapper.find('SafeMarkdown')).toHaveLength(0);
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
    expect(wrapper.find('Heading6').first().props().children).toBe('Testing');
    expect(wrapper.find('AiToken')).toHaveLength(1);
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
    expect(wrapper.find('Heading6').first().props().children).toBe('Testing');
    expect(wrapper.find('AiToken')).toHaveLength(0);
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
    expect(wrapper.find('Heading6').first().props().children).toBe('Testing');
    expect(wrapper.find('AiToken')).toHaveLength(0);
  });

  it('does not show AI token after teacher has submitted evaluation', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [],
        }}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.LIMITED,
        }}
        teacherHasEnabledAi={false}
      />
    );
    expect(wrapper.find('AiToken')).toHaveLength(0);
  });

  it('sends event when closed and opened', () => {
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          key: 'key',
          learningGoal: 'Testing',
          evidenceLevels: [],
        }}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
      />
    );
    wrapper.find('summary').simulate('click');
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_EXPANDED_EVENT,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'key',
        learningGoal: 'Testing',
      }
    );
    wrapper.find('summary').simulate('click');
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'key',
        learningGoal: 'Testing',
      }
    );
    sendEventSpy.mockRestore();
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
    expect(wrapper.find('BodyThreeText').first().text()).toContain('Evaluate');
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
    expect(wrapper.find('BodyThreeText').first().text()).toContain('Approve');
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
    expect(wrapper.find('textarea').props().value).toBe('test feedback');
    expect(wrapper.find('textarea').props().disabled).toBe(true);
    expect(wrapper.find('FontAwesome').at(0).props().icon).toBe('message');
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
    expect(wrapper.find('textarea').props().disabled).toBe(false);
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
    expect(wrapper.find('BodyThreeText').props().children).toBe(
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
    expect(wrapper.find('BodyThreeText').props().children).toBe('No Evidence');
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
    expect(wrapper.find('EvidenceLevels').props().isStudent).toBe(true);
    expect(wrapper.find('EvidenceLevels').props().submittedEvaluation).toBe(
      props.submittedEvaluation
    );
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).toBe(
      props.learningGoal.evidenceLevels
    );
  });
});
