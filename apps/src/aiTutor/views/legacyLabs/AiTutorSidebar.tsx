import Button from '@code-dot-org/component-library/button';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {AiTutorSuggestedPrompt, defaultPrompts} from '../../suggestedPrompts';
import {AnalyticsData} from '../../types';

import AiTutorSidebarSuggestedPrompts from './AiTutorSidebarSuggestedPrompts';

import styles from './AiTutorSidebar.module.scss';

interface AiTutorSidebarProps {
  toggleAiChat: () => void;
  suggestedPrompts?: Array<AiTutorSuggestedPrompt>;
  hiddenContextCallback: () => Promise<string>;
  analyticsData: AnalyticsData;
}

const AiTutorSidebar: React.FC<AiTutorSidebarProps> = ({
  toggleAiChat,
  suggestedPrompts = defaultPrompts,
  hiddenContextCallback,
  analyticsData,
}) => {
  const openTutor = () => {
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_SIDEBAR_OPEN, {
      labType: analyticsData.labType,
      levelId: analyticsData.levelId,
      unitId: analyticsData.unitId,
      channelId: analyticsData.channelId,
      url: analyticsData.location,
    });
    toggleAiChat();
  };

  return (
    <div className={styles['ai-tutor-sidebar']}>
      <div
        role="button"
        onClick={openTutor}
        tabIndex={-1}
        className={styles['ai-tutor-sidebar-header']}
      >
        <img src={aiBotOutlineIcon} alt="" className={styles['bot-icon']} />
      </div>
      <div className={styles['ai-tutor-sidebar-content']}>
        <Button
          className={styles['ai-tutor-suggested-prompt-item']}
          aria-label="Open AI tutor"
          isIconOnly
          icon={{iconName: 'arrow-from-right'}}
          onClick={openTutor}
          size="m"
          type="primary"
          color="white"
        />
        <AiTutorSidebarSuggestedPrompts
          suggestedPrompts={suggestedPrompts}
          hiddenContextCallback={hiddenContextCallback}
          toggleAiChat={toggleAiChat}
          analyticsData={analyticsData}
        />
      </div>
    </div>
  );
};

export default AiTutorSidebar;
