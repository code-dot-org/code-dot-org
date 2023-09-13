import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import StudentRubricView from '@cdo/apps/templates/rubrics/StudentRubricView';

describe('StudentRubricView', () => {
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
    level: {
      name: 'test_level',
      position: 7,
    },
  };

  it('shows learning goals', () => {
    const wrapper = shallow(<StudentRubricView rubric={defaultRubric} />);
    const renderedLearningGoals = wrapper.find('LearningGoal');
    expect(renderedLearningGoals).to.have.lengthOf(2);
    expect(
      renderedLearningGoals.at(0).props().learningGoal.learningGoal
    ).to.equal('goal 1');
    expect(renderedLearningGoals.at(0).props().canProvideFeedback).to.be.false;
    expect(
      renderedLearningGoals.at(1).props().learningGoal.learningGoal
    ).to.equal('goal 2');
    expect(renderedLearningGoals.at(1).props().canProvideFeedback).to.be.false;
  });
});
