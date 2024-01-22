import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {act} from 'react-dom/test-utils';
import RubricContainer from '@cdo/apps/templates/rubrics/RubricContainer';

describe('RubricContainer', () => {
  const defaultRubric = {
    learningGoals: [],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
  };

  it('renders a RubricContent component when the rubric tab is selected', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{}}
        teacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
        open
      />
    );
    expect(wrapper.find('RubricContent')).to.have.lengthOf(1);
  });

  it('fetches AI evaluations and passes them to children', async () => {
    const mockFetch = sinon.stub(window, 'fetch');
    const mockAiEvaluations = [
      {id: 2, learning_goal_id: 2, understanding: 2, ai_confidence: 2},
    ];
    mockFetch.returns(
      Promise.resolve(new Response(JSON.stringify(mockAiEvaluations)))
    );
    const wrapper = mount(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{}}
        teacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
        open
      />
    );
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(mockFetch).to.have.been.calledOnce;
    expect(wrapper.find('RubricContent').props().aiEvaluations).to.eql(
      mockAiEvaluations
    );
  });

  it('switches components when tabs are clicked', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{}}
        teacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
        open
      />
    );
    expect(wrapper.find('RubricContent').props().visible).to.be.true;
    expect(wrapper.find('RubricSettings').props().visible).to.be.false;
    wrapper.find('HeaderTab').at(1).simulate('click');
    expect(wrapper.find('RubricContent').props().visible).to.be.false;
    expect(wrapper.find('RubricSettings').props().visible).to.be.true;
    wrapper.find('HeaderTab').at(0).simulate('click');
    expect(wrapper.find('RubricContent').props().visible).to.be.true;
    expect(wrapper.find('RubricSettings').props().visible).to.be.false;
  });
});
