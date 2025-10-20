import Button from '@code-dot-org/component-library/button';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {FC} from 'react';
import {useSelector} from 'react-redux';

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
import {LegacyLabsState} from '@cdo/apps/redux/legacyLabs';

const aiTutorHelper = new AiTutorLegacyLabContextHelper();

interface CommonLab {
  getCode?: () => Promise<string | undefined>;
  channel?: string;
}

export const AiTutorContainer: FC<{
  toggleAiChat: () => void;
  aiChatOpen: boolean;
}> = ({toggleAiChat, aiChatOpen}) => {
  const labState = useSelector(
    (state: {pageConstants: LegacyLabsState}) => state.pageConstants
  );

  const inLevel = !!labState.serverScriptId;
  const allPrompts = inLevel
    ? [...levelPrompts, ...defaultPrompts]
    : [...standaloneProjectPrompts, ...defaultPrompts];

  const lab: CommonLab | undefined =
    labState.appType === 'weblab' ? window.getWebLab?.() : studioApp()?.config;

  const getHiddenContext = async () => {
    const code = await lab?.getCode?.();
    aiTutorHelper.setAiTutorContext({source: code ?? ''});
    const callback = aiTutorHelper.getHiddenContextCallback();
    return callback();
  };

  const analyticsData = {
    labType: labState.appType,
    channelId: labState.channelId,
    location: window.location.href,
    levelId: labState.serverLevelId,
    unitId: labState.serverScriptId,
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
          channelId={lab?.channel}
        />
      </div>
      {!aiChatOpen && (
        <AiTutorSidebar
          toggleAiChat={toggleAiChat}
          suggestedPrompts={allPrompts}
          hiddenContextCallback={getHiddenContext}
          analyticsData={analyticsData}
        />
      )}
    </>
  );
};
