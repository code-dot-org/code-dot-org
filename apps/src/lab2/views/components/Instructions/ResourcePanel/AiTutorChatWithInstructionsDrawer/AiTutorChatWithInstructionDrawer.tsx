import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {ChatButtonData, ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import type {JsonVideoFileObject} from '@cdo/apps/jsonVideo/jsonVideoPrompt';
import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import {useInstructionsDrawer} from './useInstructionsDrawer';

import styles from './ai-tutor-chat-with-instructions-drawer.module.scss';

interface AiTutorChatWithInstructionDrawerProps {
  hiddenContextCallback: () => Promise<string>;
  aiTutorMultimodalEnabled?: boolean;
  levelName?: string;
  channelId?: string;
  aiTutorChatButtonData?: ChatButtonData[];
  aiTutorSystemPrompt?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
  instructionsContent?: React.ReactNode;
  isCollapsedByDefault: boolean;
  tutorVideos?: JsonVideoFileObject[];
  isPredictLevel?: boolean;
}

const AiTutorChatWithInstructionDrawer: React.FunctionComponent<
  AiTutorChatWithInstructionDrawerProps
> = ({
  hiddenContextCallback,
  aiTutorMultimodalEnabled,
  levelName,
  channelId,
  aiTutorChatButtonData,
  aiTutorSystemPrompt,
  aiTutorResponseSchemaSettings,
  instructionsContent,
  isCollapsedByDefault,
  tutorVideos,
  isPredictLevel,
}) => {
  const {
    containerRef,
    instructionsScrollAreaRef,
    instructionsContentRef,
    instructionsHeight,
    chatHeight,
    isCollapsed,
    showScrollFade,
    separatorProps,
    isDragging,
    toggleInstructions,
  } = useInstructionsDrawer({isCollapsedByDefault, isPredictLevel});

  return (
    <div ref={containerRef} className={styles.container}>
      {!isCollapsed && (
        <div
          id="instructions-drawer"
          className={styles.instructionsDrawer}
          style={{height: instructionsHeight}}
        >
          <div
            ref={instructionsScrollAreaRef}
            className={styles.instructionsScrollArea}
          >
            <div ref={instructionsContentRef}>{instructionsContent}</div>
          </div>
          {showScrollFade && <div className={styles.scrollFade} aria-hidden />}
        </div>
      )}
      <div
        className={styles.toggleButtonContainer}
        style={{top: instructionsHeight}}
      >
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          className={styles.toggleButton}
          onClick={toggleInstructions}
          type="button"
          startIcon={
            <FontAwesomeV6Icon iconName="info-circle" iconStyle="solid" />
          }
          endIcon={
            <FontAwesomeV6Icon
              iconName={isCollapsed ? 'chevron-down' : 'chevron-up'}
              iconStyle="solid"
            />
          }
        >
          {isCollapsed ? 'Show Instructions' : 'Hide Instructions'}
        </MuiButton>
      </div>
      {!isCollapsed && (
        <ResizeBar
          className={classNames(
            styles.resizeBar,
            isDragging && styles.resizeBarDragging
          )}
          isVertical={false}
          separatorProps={separatorProps}
          isDragging={isDragging}
        />
      )}
      <div className={styles.chatPanel} style={{height: chatHeight}}>
        <div className={styles.chatContent}>
          <AiTutorChat
            hiddenContextCallback={hiddenContextCallback}
            aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
            levelName={levelName}
            channelId={channelId}
            aiTutorChatButtonData={aiTutorChatButtonData}
            aiTutorSystemPrompt={aiTutorSystemPrompt}
            aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
            hasInstructionsDrawer={true}
            tutorVideos={tutorVideos}
          />
        </div>
      </div>
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
