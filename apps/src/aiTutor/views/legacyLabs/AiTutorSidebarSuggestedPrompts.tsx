import Button from '@code-dot-org/component-library/button';
import React from 'react';

import {AiTutorSuggestedPrompt} from '../../suggestedPrompts';

import styles from './AiTutorSidebar.module.scss';

interface AiTutorSidebarSuggestedPromptsProps {
  onPromptSelect?: (prompt: AiTutorSuggestedPrompt) => void;
  className?: string;
  suggestedPrompts?: Array<AiTutorSuggestedPrompt>;
}

const AiTutorSidebarSuggestedPrompts: React.FC<
  AiTutorSidebarSuggestedPromptsProps
> = ({onPromptSelect, className = '', suggestedPrompts = []}) => {
  const handlePromptClick = (prompt: AiTutorSuggestedPrompt) => {
    if (onPromptSelect) {
      onPromptSelect(prompt);
    }
  };

  return (
    <div className={`ai-tutor-suggested-prompts ${className}`}>
      <div className="ai-tutor-suggested-prompts-list">
        {suggestedPrompts.map(prompt => (
          <Button
            className={styles['ai-tutor-suggested-prompt-item']}
            aria-label={prompt.label}
            isIconOnly
            icon={prompt.icon}
            onClick={() => handlePromptClick(prompt)}
            key={prompt.id}
            size="m"
            type="primary"
            color="white"
          />
        ))}
      </div>
    </div>
  );
};

export default AiTutorSidebarSuggestedPrompts;
