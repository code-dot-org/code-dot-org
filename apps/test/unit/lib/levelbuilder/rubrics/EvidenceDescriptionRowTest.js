import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    expect(wrapper.find('div').length).toBe(1);
    expect(wrapper.find('label').length).toBe(1);
    expect(wrapper.find('textarea').length).toBe(2);
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
    expect(aiPromptTextbox.prop('disabled')).toBe(false);
    expect(aiPromptTextbox.prop('required')).toBe(true);
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
    expect(aiPromptTextbox.prop('disabled')).toBe(true);
    expect(aiPromptTextbox.prop('required')).toBe(false);
  });
});
