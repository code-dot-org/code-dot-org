import Button from '@code-dot-org/component-library/button';
import React from 'react';

import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {AiTutorSuggestedPrompt, defaultPrompts} from '../../suggestedPrompts';

import AiTutorSidebarSuggestedPrompts from './AiTutorSidebarSuggestedPrompts';

import styles from './AiTutorSidebar.module.scss';

interface AiTutorSidebarProps {
  toggleAiChat: () => void;
  suggestedPrompts?: Array<AiTutorSuggestedPrompt>;
}

const AiTutorSidebar: React.FC<AiTutorSidebarProps> = ({
  toggleAiChat,
  suggestedPrompts = defaultPrompts,
}) => {
  return (
    <div className={styles['ai-tutor-sidebar']}>
      <div className={styles['ai-tutor-sidebar-header']}>
        <div className={styles['bot-icon-container']}>
          <img src={aiBotOutlineIcon} alt="" className={styles['bot-icon']} />
        </div>
      </div>
      <div className={styles['ai-tutor-sidebar-content']}>
        <Button
          className={styles['ai-tutor-suggested-prompt-item']}
          aria-label="Open AI tutor"
          isIconOnly
          icon={{iconName: 'arrow-from-right'}}
          onClick={toggleAiChat}
          size="m"
          type="primary"
          color="white"
        />
        <AiTutorSidebarSuggestedPrompts suggestedPrompts={suggestedPrompts} />
      </div>
    </div>
  );
};

export default AiTutorSidebar;
