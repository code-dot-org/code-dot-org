import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import StudentRubricView from '@cdo/apps/templates/rubrics/StudentRubricView';

describe('StudentRubricView', () => {
  const defaultRubric = {
    learningGoals: [
      {
        id: 1,
        key: 'goal1',
        learningGoal: 'goal 1',
        aiEnabled: false,
        evidenceLevels: [],
      },
      {
        id: 2,
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
    expect(renderedLearningGoals.at(1).props().isStudent).to.be.true;
  });

  it('passes evaluation down to learning goals', async () => {
    const wrapper = shallow(
      <StudentRubricView
        rubric={defaultRubric}
        submittedEvaluation={[
          {
            id: 1,
            learning_goal_id: 1,
            understanding: 2,
            feedback: 'feedback for learning goal 1',
          },
          {
            id: 2,
            learning_goal_id: 2,
            understanding: 3,
            feedback: 'feedback for learning goal 2',
          },
        ]}
      />
    );

    const renderedLearningGoals = wrapper.find('LearningGoal');
    expect(renderedLearningGoals).to.have.lengthOf(2);
    expect(
      renderedLearningGoals.at(0).props().submittedEvaluation.understanding
    ).to.equal(2);
    expect(
      renderedLearningGoals.at(0).props().submittedEvaluation.feedback
    ).to.equal('feedback for learning goal 1');

    expect(
      renderedLearningGoals.at(1).props().submittedEvaluation.understanding
    ).to.equal(3);
    expect(
      renderedLearningGoals.at(1).props().submittedEvaluation.feedback
    ).to.equal('feedback for learning goal 2');
  });
});
