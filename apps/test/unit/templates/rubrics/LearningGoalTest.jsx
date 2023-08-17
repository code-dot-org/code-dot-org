import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
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
});
