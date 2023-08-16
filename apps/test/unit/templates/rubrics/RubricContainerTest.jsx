import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import RubricContainer from '@cdo/apps/templates/rubrics/RubricContainer';

describe('RubricContainer', () => {
  const defaultRubric = {
    learningGoals: [
      {
        key: 'goal1',
        learningGoal: 'goal 1',
        aiEnabled: false,
      },
      {
        key: 'goal2',
        learningGoal: 'goal 2',
        aiEnabled: true,
      },
    ],
    lesson: {
      name: 'A lesson with a project',
      position: 1,
    },
  };

  it('shows learning goals', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        canProvideFeedback={false}
        teacherHasEnabledAi
      />
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
});
