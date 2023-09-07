import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import LearningGoal from '@cdo/apps/templates/rubrics/LearningGoal';

describe('LearningGoal', () => {
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

  it('renders tips', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{
          learningGoal: 'Testing',
          aiEnabled: true,
          evidenceLevels: [],
          tips: 'Tips',
        }}
        teacherHasEnabledAi
      />
    );
    expect(wrapper.find('Heading6')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown').props().markdown).to.equal('Tips');
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
    expect(wrapper.text()).to.include('Testing');
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
    expect(wrapper.text()).to.include('Testing');
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
    expect(wrapper.text()).to.include('Testing');
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('shows down arrow when closed and up arrow when open', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{learningGoal: 'Testing', evidenceLevels: []}}
      />
    );
    expect(wrapper.find('FontAwesome').props().icon).to.equal('angle-down');
    wrapper.find('summary').simulate('click');
    expect(wrapper.find('FontAwesome').props().icon).to.equal('angle-up');
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
      EVENTS.RUBRIC_LEARNING_GOAL_EXPANDED_EVENT,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'key',
        learningGoal: 'Testing',
      }
    );
    wrapper.find('summary').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'key',
        learningGoal: 'Testing',
      }
    );
    sendEventSpy.restore();
  });
});
