import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import EvidenceDescriptions from '@cdo/apps/lib/levelbuilder/rubrics/EvidenceDescriptions';
import sinon from 'sinon';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';

describe('EvidenceDescriptions', () => {
  let defaultProps;
  const updateLearningGoal = sinon.spy();
  const learningGoalData = {
    key: 'learningGoal-1',
    id: '1',
    learningGoal: 'Testing Learning Goal',
    learningGoalEvidenceLevelsAttributes: [
      {
        aiPrompt: 'aiPrompt for evidence level 1',
        id: 1,
        learningGoalId: 1,
        teacherDescription: 'Teacher description for evidence level 1',
        understanding: 0,
      },
      {
        aiPrompt: 'aiPrompt for evidence level 2',
        id: 2,
        learningGoalId: 1,
        teacherDescription: 'Teacher description for evidence level 2',
        understanding: 1,
      },
      {
        aiPrompt: 'aiPrompt for evidence level 3',
        id: 3,
        learningGoalId: 1,
        teacherDescription: 'Teacher description for evidence level 3',
        understanding: 2,
      },
      {
        aiPrompt: 'aiPrompt for evidence level 4',
        id: 4,
        learningGoalId: 1,
        teacherDescription: 'Teacher description for evidence level 4',
        understanding: 3,
      },
    ],
    aiEnabled: false,
  };

  beforeEach(() => {
    defaultProps = {
      updateLearningGoal: updateLearningGoal,
      learningGoalData: learningGoalData,
    };
  });

  it('renders correctly', () => {
    const wrapper = shallow(<EvidenceDescriptions {...defaultProps} />);
    expect(wrapper.find('EvidenceDescriptionsRow').length).to.equal(4);
    expect(
      wrapper.find('EvidenceDescriptionsRow').at(0).props().isAiEnabled
    ).to.equal(learningGoalData.aiEnabled);
    expect(
      wrapper.find('EvidenceDescriptionsRow').at(0).props().evidenceLabel
    ).to.equal(
      UNDERSTANDING_LEVEL_STRINGS[RubricUnderstandingLevels.EXTENSIVE]
    );
    expect(
      wrapper.find('EvidenceDescriptionsRow').at(0).props().updateLearningGoal
    ).to.equal(updateLearningGoal);
    expect(
      wrapper.find('EvidenceDescriptionsRow').at(0).props().evidenceLevelData
    ).to.equal(
      learningGoalData.learningGoalEvidenceLevelsAttributes[
        [RubricUnderstandingLevels.EXTENSIVE]
      ]
    );
    expect(
      wrapper.find('EvidenceDescriptionsRow').at(0).props().learningGoalId
    ).to.equal(learningGoalData.id);
    expect(wrapper.find('Heading6').length).to.equal(3);
  });
});
