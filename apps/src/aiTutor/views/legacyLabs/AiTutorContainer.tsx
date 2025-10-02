import Button from '@code-dot-org/component-library/button';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';

import {
  defaultPrompts,
  levelPrompts,
  standaloneProjectPrompts,
} from '../../suggestedPrompts';

import AiTutorSidebar from './AiTutorSidebar';

import styles from './AiTutorContainer.module.scss';

export const AiTutorContainer: FC<{
  toggleAiChat: () => void;
  aiChatOpen: boolean;
  inLevel: boolean;
}> = ({toggleAiChat, aiChatOpen, inLevel}) => {
  const allPrompts = inLevel
    ? [...levelPrompts, ...defaultPrompts]
    : [...standaloneProjectPrompts, ...defaultPrompts];
  return (
    <>
      {aiChatOpen ? (
        <div className={styles.container}>
          <div className={styles.header}>
            <BodyThreeText noMargin>AI Tutor</BodyThreeText>
            <Button
              aria-label="Close AI tutor"
              isIconOnly
              icon={{iconName: 'close'}}
              onClick={toggleAiChat}
              size="xs"
              type="secondary"
            />
          </div>
          <AiTutor2Chat
            hiddenContextCallback={() => Promise.resolve('')}
            aiTutorChatButtonData={allPrompts}
          />
        </div>
      ) : (
        <AiTutorSidebar
          toggleAiChat={toggleAiChat}
          suggestedPrompts={allPrompts}
        />
      )}
    </>
  );
};
