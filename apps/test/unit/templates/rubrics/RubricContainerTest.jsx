import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
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
  };

  it('shows learning goals', () => {
    const wrapper = shallow(
      <RubricContainer rubric={defaultRubric} teacherHasEnabledAi />
    );
    const renderedLearningGoals = wrapper.find('LearningGoal');
    expect(renderedLearningGoals).to.have.lengthOf(2);
    expect(
      renderedLearningGoals.at(0).props().learningGoal.learningGoal
    ).to.equal('goal 1');
    expect(
      renderedLearningGoals.at(1).props().learningGoal.learningGoal
    ).to.equal('goal 2');
  });

  it('shows level title', () => {
    // mount is needed in order for text() to work
    const wrapper = mount(
      <RubricContainer
        rubric={defaultRubric}
        teacherHasEnabledAi
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
        rubric={defaultRubric}
        teacherHasEnabledAi
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
        rubric={defaultRubric}
        teacherHasEnabledAi
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
});
