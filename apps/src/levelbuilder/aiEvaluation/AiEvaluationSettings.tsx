import React from 'react';

import AccuracyCheck from './AccuracyCheck';
import SystemPromptModificationField from './SystemPromptModificationField';
import ViewSystemPrompt from './ViewSystemPrompt';

interface Props {
  levelId: number;
  systemPrompt: string;
  additionalAiEvaluationInstructions?: string;
  updateAdditionalAiEvaluationInstructions: (value: string) => void;
}

const AiEvaluationSettings: React.FC<Props> = ({
  levelId,
  systemPrompt,
  additionalAiEvaluationInstructions,
  updateAdditionalAiEvaluationInstructions,
}) => {
  return (
    <div className="ai-evaluation-settings">
      <AccuracyCheck levelId={levelId} />
      <br />
      <ViewSystemPrompt systemPrompt={systemPrompt} />
      <br />
      <SystemPromptModificationField
        initialValue={additionalAiEvaluationInstructions}
        onChange={updateAdditionalAiEvaluationInstructions}
      />
      <br />
      <br />
    </div>
  );
};

export default AiEvaluationSettings;
