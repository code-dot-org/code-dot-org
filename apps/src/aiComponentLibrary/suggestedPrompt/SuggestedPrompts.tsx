import React from 'react';

import SuggestedPrompt, {SuggestedPromptProps} from './SuggestedPrompt';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders a clickable tags that can be customized with a suggested prompt.
 */

interface SuggestedPromptsProps {
  suggestedPrompts: Array<SuggestedPromptProps>;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  suggestedPrompts,
}) => {
  return (
    <div className={moduleStyles.prompts}>
      {suggestedPrompts.map(prompt => (
        <SuggestedPrompt
          onClick={prompt.onClick}
          label={prompt.label}
          show={prompt.show}
        />
      ))}
    </div>
  );
};
export default SuggestedPrompts;
