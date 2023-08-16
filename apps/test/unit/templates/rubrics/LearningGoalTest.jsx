import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import LearningGoal from '@cdo/apps/templates/rubrics/LearningGoal';

describe('LearningGoal', () => {
  it('shows AI token when AI is enabled', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{learningGoal: 'Testing', aiEnabled: true}}
        teacherHasEnabledAi
      />
    );
    expect(wrapper.text()).to.include('Testing');
    expect(wrapper.find('AiToken')).to.have.lengthOf(1);
  });

  it('does not show AI token when AI is disabled', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{learningGoal: 'Testing', aiEnabled: false}}
        teacherHasEnabledAi
      />
    );
    expect(wrapper.text()).to.include('Testing');
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token when teacher has disabled AI', () => {
    const wrapper = shallow(
      <LearningGoal
        learningGoal={{learningGoal: 'Testing', aiEnabled: true}}
        teacherHasEnabledAi={false}
      />
    );
    expect(wrapper.text()).to.include('Testing');
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('shows down arrow when closed and up arrow when open', () => {
    const wrapper = shallow(
      <LearningGoal learningGoal={{learningGoal: 'Testing'}} />
    );
    expect(wrapper.find('FontAwesome').props().icon).to.equal('angle-down');
    wrapper.find('details').simulate('click');
    expect(wrapper.find('FontAwesome').props().icon).to.equal('angle-up');
  });

  it('sends event when closed and opened', () => {
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');

    const wrapper = shallow(
      <LearningGoal
        learningGoal={{key: 'key', learningGoal: 'Testing'}}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
      />
    );
    wrapper.find('details').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.RUBRIC_LEARNING_GOAL_EXPANDED_EVENT,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'key',
        learningGoal: 'Testing',
      }
    );
    wrapper.find('details').simulate('click');
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
