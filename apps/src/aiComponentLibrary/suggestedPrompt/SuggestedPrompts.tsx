import classNames from 'classnames';
import React from 'react';

import moduleStyles from './suggested-prompt.module.scss';

/**
 * Renders clickable tags that can be customized with list of suggested prompts.
 */
export interface SuggestedPrompt {
  onClick: (prompt: SuggestedPrompt) => void;
  label: string;
  show: boolean;
  selected: boolean;
}

interface SuggestedPromptsProps {
  suggestedPrompts: Array<SuggestedPrompt>;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  suggestedPrompts,
}) => {
  const hasSelection = suggestedPrompts.some(prompt => prompt.selected);
  const visiblePrompts = suggestedPrompts.filter(prompt => prompt.show);

  return (
    <div
      className={moduleStyles.prompts}
      role="group"
      aria-label="Suggested Prompts"
    >
      {visiblePrompts.map(prompt => {
        const isDisabled = hasSelection && !prompt.selected;

        return (
          <button
            key={prompt.label}
            type="button"
            className={classNames(moduleStyles.prompt, {
              [moduleStyles.selected]: prompt.selected,
              [moduleStyles.disabled]: isDisabled,
            })}
            onClick={() => !isDisabled && prompt.onClick(prompt)}
            aria-disabled={isDisabled}
            aria-pressed={prompt.selected}
            aria-label={prompt.label}
          >
            <span>{prompt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
export default SuggestedPrompts;
