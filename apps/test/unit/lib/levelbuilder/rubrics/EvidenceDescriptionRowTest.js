import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import EvidenceDescriptionsRow from '@cdo/apps/lib/levelbuilder/rubrics/EvidenceDescriptionsRow.jsx';

describe('EvidenceDescriptionsRow', () => {
  const evidenceLevelData = {
    learningGoalId: 'learningGoal-1',
    teacherDescription: 'description',
    understanding: 0,
    aiPrompt: '',
  };
  it('renders correctly', () => {
    const wrapper = shallow(
      <EvidenceDescriptionsRow
        isAiEnabled={true}
        evidenceLabel="Test"
        evidenceLevelData={evidenceLevelData}
      />
    );
    expect(wrapper.find('div').length).to.equal(1);
    expect(wrapper.find('label').length).to.equal(1);
    expect(wrapper.find('textarea').length).to.equal(2);
  });

  it('enables the AI prompt textbox when isAiEnabled is true', () => {
    const wrapper = shallow(
      <EvidenceDescriptionsRow
        isAiEnabled={true}
        evidenceLabel="Test"
        evidenceLevelData={evidenceLevelData}
      />
    );
    const aiPromptTextbox = wrapper.find('.ui-test-ai-prompt-textbox');
    expect(aiPromptTextbox.prop('disabled')).to.be.false;
    expect(aiPromptTextbox.prop('required')).to.be.true;
  });

  it('disables the AI prompt textbox when isAiEnabled is false', () => {
    const wrapper = shallow(
      <EvidenceDescriptionsRow
        isAiEnabled={false}
        evidenceLabel="Test"
        evidenceLevelData={evidenceLevelData}
      />
    );
    const aiPromptTextbox = wrapper.find('.ui-test-ai-prompt-textbox');
    expect(aiPromptTextbox.prop('disabled')).to.be.true;
    expect(aiPromptTextbox.prop('required')).to.be.false;
  });
});
