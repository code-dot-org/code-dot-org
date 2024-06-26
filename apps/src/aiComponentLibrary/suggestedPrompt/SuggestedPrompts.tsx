import React from 'react';

import SuggestedPrompt, {SuggestedPromptProps} from './SuggestedPrompt';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders clickable tags that can be customized with list of suggested prompts.
 */

interface SuggestedPromptsProps {
  suggestedPrompts: Array<SuggestedPromptProps>;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  suggestedPrompts,
}) => (
  <div className={moduleStyles.prompts}>
    {suggestedPrompts.map(prompt => (
      <SuggestedPrompt
        key={prompt.label}
        onClick={prompt.onClick}
        label={prompt.label}
        show={prompt.show}
      />
    ))}
  </div>
);
export default SuggestedPrompts;
