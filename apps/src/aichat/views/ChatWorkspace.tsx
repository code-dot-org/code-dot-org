import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tabs, {TabsProps} from '@code-dot-org/component-library/tabs';
import markdownToTxt from 'markdown-to-txt';
import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {isModelUpdate, WorkspaceTeacherViewTab} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import usePrevious from '@cdo/apps/util/usePrevious';
import {
  AiChatClientTypes,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import ChatEventLogger from '../chatEventLogger';
import {
  modelDescriptions,
  RESET_CONVERSATION_CUSTOMIZATION_UPDATES,
} from '../constants';
import {
  addChatEvent,
  clearChatMessages,
  clearStagedFiles,
  fetchUserChatHistory,
  selectAllVisibleMessages,
  sendInitialGreeting,
  setClientType,
  setNewChatSession,
  setChatWorkspaceSelectedTab,
  setLastAutoGreetKey,
} from '../redux';
import {clearUserAddedSelectionContext} from '../redux/slice';
import {findChangedProperties, getNewRemoveId} from '../redux/utils';
import {
  AiChatClientType,
  ChatAsset,
  ChatButtonAndKey,
  ModelParameters,
} from '../types';
import {getAssetUrl, getShortName} from '../utils';

import StagedFilesPreview from './assets/StagedFilesPreview';
import UserAddedSelectionContextPreview from './assets/UserAddedSelectionContextPreview';
import ChatEventsList from './ChatEventsList';
import UserChatMessageEditor from './UserChatMessageEditor';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatWorkspaceProps {
  modelParameters: ModelParameters;
  clientType: AiChatClientType;
  chatButtons?: ChatButtonAndKey[];
  hiddenContextCallback?: () => Promise<string>;
  hideModelChangeMessage?: boolean;

  // Multimodal support
  multimodalEnabled?: boolean;
  channelId?: string;
  levelName?: string;
  hasStarterAssets?: boolean;

  // Optional callback to process the model's response before it is recorded in chat
  // history (useful for structured outputs).
  responseCallback?: (response: string) => string;

  // Optional callback to log level activity
  logLevelActivity?: () => void;

  hasInstructionsDrawer?: boolean;
  lessonId?: number;
  initialAssistantMessage?: string;
  autoGreet?: boolean;
  // Opaque key that changes when a new reflection is submitted. When it
  // differs from `lastAutoGreetKey` in Redux, a fresh greeting fires even if
  // history already ends with an assistant message.
  autoGreetKey?: number;

  // Optional content to render after the last chat message (e.g. lab-specific actions).
  renderLastMessagePostText?: (
    onRequestScrollToBottom: () => void
  ) => React.ReactNode;
}

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent<ChatWorkspaceProps> = ({
  modelParameters,
  clientType,
  chatButtons,
  hiddenContextCallback,
  multimodalEnabled = false,
  levelName,
  channelId,
  hasStarterAssets = false,
  hideModelChangeMessage = false,
  responseCallback,
  logLevelActivity,
  hasInstructionsDrawer,
  lessonId,
  initialAssistantMessage,
  autoGreet,
  autoGreetKey,
  renderLastMessagePostText,
}) => {
  const lastAutoGreetKey = useAppSelector(
    state => state.aichat.lastAutoGreetKey
  );

  // Tracks whether the auto-greeting has been sent for the current mount.
  // Prevents double-firing if this effect re-runs while the component is still
  // mounted (e.g. due to dep changes).
  const hasSentGreetingRef = useRef(false);

  const {chatDisabled, chatDisabledMessage} = useAiChatDisabled();
  const canDisplayAssets = !!levelName && !!channelId;
  if (multimodalEnabled && !canDisplayAssets) {
    console.warn(
      'Multimodal support requires level name and channel ID. Asset uploads will not be available.'
    );
    multimodalEnabled = false;
  }

  const selectedTab = useAppSelector(
    state => state.aichat.chatWorkspaceSelectedTab
  );

  const studentChatHistory = useAppSelector(
    state => state.aichat.studentChatHistory
  );
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const unfilteredVisibleItems = useAppSelector(selectAllVisibleMessages);
  const visibleItems = useMemo(() => {
    if (hideModelChangeMessage) {
      return unfilteredVisibleItems.filter(message => !isModelUpdate(message));
    }
    return unfilteredVisibleItems;
  }, [hideModelChangeMessage, unfilteredVisibleItems]);
  const currentUserId = useAppSelector(state => state.currentUser.userId);

  const selectedStudent = useAppSelector(({teacherSections, progress}) => {
    const students = teacherSections.selectedStudents;
    if (progress.viewAsUserId && progress.currentLevelId) {
      return Object.values(students).find(
        student => student.id === progress.viewAsUserId
      );
    }
  });

  const supportsMultimodalInput = useMemo(() => {
    return modelDescriptions.find(
      model => model.id === modelParameters.selectedModelId
    )?.multimodal;
  }, [modelParameters.selectedModelId]);

  const canUploadAssets =
    supportsMultimodalInput && multimodalEnabled && canDisplayAssets;

  const buildAssetUrl = useCallback(
    (asset: ChatAsset) => {
      return getAssetUrl(asset, channelId, levelName);
    },
    [channelId, levelName]
  );

  const dispatch = useAppDispatch();

  // Initialize the ChatEventLogger with the current context, whenever it updates.
  useEffect(() => {
    ChatEventLogger.initialize({
      clientType,
      currentLevelId: parseInt(currentLevelId || ''),
      scriptId,
      channelId,
      lessonId,
    });
  }, [clientType, currentLevelId, scriptId, channelId, lessonId]);

  // This effect resets chat history and any staged uploads or user selections when:
  // a) a user switches levels, or
  // b) a teacher switches between viewing students (or their own project) on a given level.
  useEffect(() => {
    dispatch(clearChatMessages());
    dispatch(clearStagedFiles());
    dispatch(clearUserAddedSelectionContext());

    const historyFetch = selectedStudent
      ? dispatch(
          fetchUserChatHistory({
            userId: selectedStudent.id,
            isOwnHistory: false,
            channelId,
            lessonId,
          })
        )
      : dispatch(
          fetchUserChatHistory({
            userId: currentUserId,
            isOwnHistory: true,
            channelId,
            lessonId,
          })
        );

    if (!selectedStudent) {
      if (initialAssistantMessage) {
        historyFetch.then(() => {
          // Only inject the greeting when there is no prior history for this
          // session. Once saved, the greeting will be returned by the server on
          // future loads and chatEventsCurrent will already be populated.
          dispatch((innerDispatch, getState) => {
            if (getState().aichat.chatEventsCurrent.length === 0) {
              innerDispatch(
                addChatEvent({
                  role: Role.ASSISTANT,
                  status: Status.OK,
                  chatMessageText: initialAssistantMessage,
                  timestamp: Date.now(),
                  requestId: 0,
                })
              );
            }
          });
        });
      } else if (autoGreet && hiddenContextCallback && modelParameters) {
        historyFetch.then(() => {
          dispatch((innerDispatch, getState) => {
            if (hasSentGreetingRef.current) return;

            const {chatEventsCurrent} = getState().aichat;
            const lastEvent = chatEventsCurrent[chatEventsCurrent.length - 1];
            const lastIsAssistant =
              lastEvent &&
              'role' in lastEvent &&
              lastEvent.role === 'assistant';

            // A new reflection submission (autoGreetKey changed) forces a
            // fresh greeting even when history already ends with an assistant
            // message. Otherwise only greet when history is empty or ends with
            // a user message (first visit or conversation ended mid-student).
            const isNewReflection =
              autoGreetKey !== undefined &&
              autoGreetKey !== getState().aichat.lastAutoGreetKey;

            if (!lastIsAssistant || isNewReflection) {
              hasSentGreetingRef.current = true;
              // Clear the stale greeting key so the next re-render doesn't
              // re-enter this branch before sendInitialGreeting sets the key.
              if (isNewReflection) {
                innerDispatch(setLastAutoGreetKey(null));
              }
              hiddenContextCallback().then(hiddenContext => {
                innerDispatch(
                  sendInitialGreeting({
                    hiddenContext,
                    modelParameters,
                    clientType,
                    lessonId,
                    autoGreetKey,
                  })
                );
              });
            }
          });
        });
      }
    }
  }, [
    dispatch,
    currentUserId,
    currentLevelId,
    selectedStudent,
    channelId,
    lessonId,
    initialAssistantMessage,
    autoGreet,
    autoGreetKey,
    lastAutoGreetKey,
    hiddenContextCallback,
    modelParameters,
    clientType,
  ]);

  useEffect(() => {
    dispatch(setClientType(clientType));
  }, [dispatch, clientType]);

  const selectedStudentName =
    selectedStudent && getShortName(selectedStudent.name);

  // Teacher user is able to interact with chatbot.
  const canChatWithModel = useMemo(
    () => selectedTab !== WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY,
    [selectedTab]
  );

  useEffect(() => {
    // If we are viewing as a student, default to the student chat history tab if tab is not yet selected.
    if (selectedStudent && !selectedTab) {
      dispatch(
        setChatWorkspaceSelectedTab(
          WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY
        )
      );
    } else if (!selectedStudent) {
      dispatch(setChatWorkspaceSelectedTab(null));
    }
  }, [dispatch, selectedStudent, selectedTab]);

  // Whenever model parameters change, 1) reset the chat session if necessary,
  // and 2) log the changed properties to the chat history.
  const previousParameters: ModelParameters = usePrevious(modelParameters);
  useEffect(() => {
    const changedProperties = findChangedProperties(
      previousParameters,
      modelParameters
    );
    if (
      changedProperties.some(property =>
        RESET_CONVERSATION_CUSTOMIZATION_UPDATES.includes(property)
      )
    ) {
      dispatch(setNewChatSession());
    }

    changedProperties.forEach(property => {
      dispatch(
        addChatEvent({
          removeId: getNewRemoveId(),
          updatedField: property,
          updatedValue: modelParameters[property],
          timestamp: Date.now(),
        })
      );
    });
  }, [dispatch, previousParameters, modelParameters]);

  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const chatEvents = selectedStudent ? studentChatHistory : visibleItems;
  const hasChatHistory = chatEvents.length > 0;
  useEffect(() => {
    if (hasChatHistory) {
      const last = chatEvents[chatEvents.length - 1];
      if ('chatMessageText' in last && last.chatMessageText) {
        setLiveAnnouncement(markdownToTxt(last.chatMessageText));
      }
    }
  }, [hasChatHistory, chatEvents]);

  const iconValue: FontAwesomeV6IconProps = {
    iconName: 'lock',
    iconStyle: 'solid',
  };

  const buildAssetUrlValue = canDisplayAssets ? buildAssetUrl : undefined;

  const tabs = [
    {
      value: 'viewStudentChatHistory',
      text:
        selectedTab === WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY
          ? `${selectedStudentName ?? ''}'s chat history (view only)`
          : `${selectedStudentName ?? ''}'s chat history`,
      tabContent: (
        <ChatEventsList
          events={studentChatHistory}
          isTeacherView={true}
          buildAssetUrl={buildAssetUrlValue}
        />
      ),
      iconLeft: iconValue,
    },
    {
      value: 'testStudentModel',
      text: 'Test student model',
      tabContent: (
        <ChatEventsList
          events={visibleItems}
          buildAssetUrl={buildAssetUrlValue}
        />
      ),
    },
  ];

  const handleOnChange = useCallback(
    (value: string) => {
      dispatch(setChatWorkspaceSelectedTab(value as WorkspaceTeacherViewTab));
    },
    [dispatch]
  );

  const tabArgs: TabsProps = {
    name: 'teacherViewChatHistoryTabs',
    tabs,
    defaultSelectedTabValue: tabs[0].value,
    onChange: handleOnChange,
    type: 'secondary',
    tabsContainerClassName: moduleStyles.tabsContainer,
    tabPanelsContainerClassName: moduleStyles.tabPanelsContainer,
  };

  const uploadDisabled = !canChatWithModel || !!selectedStudent || chatDisabled;

  const isTeacherView = !!selectedStudent;

  const showTabs =
    selectedStudent && clientType === AiChatClientTypes.AI_CHAT_LAB;

  return (
    <div
      id="chat-workspace-area"
      className={moduleStyles.chatWorkspace}
      aria-live="polite"
    >
      <div className={moduleStyles.accessibilityHidden}>{liveAnnouncement}</div>
      {showTabs ? (
        <Tabs {...tabArgs} />
      ) : (
        <ChatEventsList
          events={chatEvents}
          isTeacherView={isTeacherView}
          buildAssetUrl={buildAssetUrlValue}
          clientType={clientType}
          modelParameters={modelParameters}
          hasInstructionsDrawer={hasInstructionsDrawer}
          renderLastMessagePostText={renderLastMessagePostText}
        />
      )}
      <div className={moduleStyles.footer}>
        {canUploadAssets && (
          <StagedFilesPreview buildAssetUrl={buildAssetUrl} />
        )}
        <UserAddedSelectionContextPreview />
        {canChatWithModel && (
          <UserChatMessageEditor
            clientType={clientType}
            modelParameters={modelParameters}
            editorContainerClassName={moduleStyles.messageEditorContainer}
            chatButtons={chatButtons}
            hiddenContextCallback={hiddenContextCallback}
            multimodalAvailable={canUploadAssets}
            responseCallback={responseCallback}
            levelName={levelName}
            hasStarterAssets={hasStarterAssets}
            buildAssetUrl={buildAssetUrlValue}
            logLevelActivity={logLevelActivity}
            uploadDisabled={uploadDisabled}
            currentLevelId={currentLevelId}
            lessonId={lessonId}
          />
        )}
      </div>
      {isTeacherView && hasChatHistory && chatDisabled && (
        <Alert
          type={alertTypes.info}
          text={chatDisabledMessage || ''}
          icon={{
            className: moduleStyles.chatDisabledAlertIcon,
            iconName: 'ai-locked',
            iconFamily: 'kit',
          }}
          className={moduleStyles.chatDisabledAlert}
        />
      )}
    </div>
  );
};

export default ChatWorkspace;
