import Button from '@code-dot-org/component-library/button';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {FC} from 'react';

import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {
  defaultPrompts,
  levelPrompts,
  standaloneProjectPrompts,
} from '../../suggestedPrompts';

import {AiTutorLegacyLabContextHelper} from './aiTutorContextHelper';
import AiTutorSidebar from './AiTutorSidebar';

import styles from './AiTutorContainer.module.scss';

const aiTutorHelper = new AiTutorLegacyLabContextHelper();

export const AiTutorContainer: FC<{
  toggleAiChat: () => void;
  aiChatOpen: boolean;
  inLevel: boolean;
}> = ({toggleAiChat, aiChatOpen, inLevel}) => {
  const allPrompts = inLevel
    ? [...levelPrompts, ...defaultPrompts]
    : [...standaloneProjectPrompts, ...defaultPrompts];

  const {config} = studioApp();

  const getHiddenContext = async () => {
    const code = config?.getCode();
    aiTutorHelper.setAiTutorContext({source: code});
    const callback = aiTutorHelper.getHiddenContextCallback();
    return callback();
  };

  return (
    <>
      <div
        className={classNames(styles.container, {
          [styles.displayNone]: !aiChatOpen,
        })}
      >
        <div className={styles.header}>
          <img
            src={aiBotOutlineIcon}
            alt=""
            className={styles['mini-bot-icon']}
          />
          <BodyThreeText noMargin className={styles['header-text']}>
            AI Tutor
          </BodyThreeText>
          <Button
            aria-label="Close AI tutor"
            isIconOnly
            icon={{iconName: 'close'}}
            onClick={toggleAiChat}
            size="xs"
            type="tertiary"
            color="black"
          />
        </div>
        <AiTutor2Chat
          hiddenContextCallback={getHiddenContext}
          aiTutorChatButtonData={allPrompts}
          channelId={config?.channel}
        />
      </div>
      {!aiChatOpen && (
        <AiTutorSidebar
          toggleAiChat={toggleAiChat}
          suggestedPrompts={allPrompts}
          hiddenContextCallback={getHiddenContext}
        />
      )}
    </>
  );
};
