import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tabs, {TabsProps} from '@code-dot-org/component-library/tabs';
import React, {useCallback, useEffect, useMemo} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {
  isModelUpdate,
  SystemPromptSettings,
  WorkspaceTeacherViewTab,
} from '@cdo/apps/aichat/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import usePrevious from '@cdo/apps/util/usePrevious';

import ChatEventLogger from '../chatEventLogger';
import {
  modelDescriptions,
  RESET_CONVERSATION_CUSTOMIZATION_UPDATES,
} from '../constants';
import aichatI18n from '../locale';
import {
  addChatEvent,
  clearChatMessages,
  clearStagedFiles,
  fetchUserChatHistory,
  selectAllVisibleMessages,
  setClientType,
  setNewChatSession,
  setChatWorkspaceSelectedTab,
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
import UploadButton from './assets/UploadButton';
import UserAddedSelectionContextPreview from './assets/UserAddedSelectionContextPreview';
import ChatEventsList from './ChatEventsList';
import ChatModeDropdown from './ChatModeDropdown';
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

  // Options for changing system prompt (used in Web Lab 2)
  systemPromptSettings?: SystemPromptSettings;
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
  systemPromptSettings,
  hideModelChangeMessage = false,
}) => {
  const {chatDisabled} = useAiChatDisabled();
  if (multimodalEnabled && (!levelName || !channelId)) {
    console.warn(
      'Multimodal support requires level name and channel ID. Multimodal features will not be available.'
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
  const visibleItems = useAppSelector(state => {
    if (hideModelChangeMessage) {
      return selectAllVisibleMessages(state).filter(
        message => !isModelUpdate(message)
      );
    } else {
      return selectAllVisibleMessages(state);
    }
  });
  const currentUserId = useAppSelector(state => state.currentUser.userId);

  const selectedStudent = useAppSelector(({teacherSections, progress}) => {
    const students = teacherSections.selectedStudents;
    if (progress.viewAsUserId && progress.currentLevelId) {
      return Object.values(students).find(
        student => student.id === progress.viewAsUserId
      );
    }
  });

  const multimodalSupported = useMemo(() => {
    return modelDescriptions.find(
      model => model.id === modelParameters.selectedModelId
    )?.multimodal;
  }, [modelParameters.selectedModelId]);

  const multimodalAvailable =
    multimodalSupported && multimodalEnabled && !!levelName && !!channelId;

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
    });
  }, [clientType, currentLevelId, scriptId, channelId]);

  // This effect resets chat history and any staged uploads or user selections when:
  // a) a user switches levels, or
  // b) a teacher switches between viewing students (or their own project) on a given level.
  useEffect(() => {
    dispatch(clearChatMessages());
    dispatch(clearStagedFiles());
    dispatch(clearUserAddedSelectionContext());

    if (selectedStudent) {
      dispatch(
        fetchUserChatHistory({userId: selectedStudent.id, isOwnHistory: false})
      );
    } else {
      dispatch(
        fetchUserChatHistory({userId: currentUserId, isOwnHistory: true})
      );
    }
  }, [dispatch, currentUserId, currentLevelId, selectedStudent]);

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

  const iconValue: FontAwesomeV6IconProps = {
    iconName: 'lock',
    iconStyle: 'solid',
  };

  const tabs = [
    {
      value: 'viewStudentChatHistory',
      text:
        selectedTab === WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY
          ? aichatI18n.viewOnlyTabLabel({
              fieldLabel: aichatI18n.viewStudentChatHistory({
                selectedStudentName: selectedStudentName ?? '',
              }),
            })
          : aichatI18n.viewStudentChatHistory({
              selectedStudentName: selectedStudentName ?? '',
            }),
      tabContent: (
        <ChatEventsList
          events={studentChatHistory}
          isTeacherView={true}
          buildAssetUrl={multimodalAvailable ? buildAssetUrl : undefined}
        />
      ),
      iconLeft: iconValue,
    },
    {
      value: 'testStudentModel',
      text: aichatI18n.testStudentModel(),
      tabContent: (
        <ChatEventsList
          events={visibleItems}
          buildAssetUrl={multimodalAvailable ? buildAssetUrl : undefined}
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

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      {selectedStudent ? (
        <Tabs {...tabArgs} />
      ) : (
        <ChatEventsList
          events={visibleItems}
          buildAssetUrl={multimodalAvailable ? buildAssetUrl : undefined}
        />
      )}

      <div className={moduleStyles.footer}>
        {multimodalAvailable && (
          <StagedFilesPreview buildAssetUrl={buildAssetUrl} />
        )}
        <UserAddedSelectionContextPreview />
        <ChatModeDropdown
          className={moduleStyles.modeDropdown}
          systemPromptSettings={systemPromptSettings}
        />
        {canChatWithModel && (
          <UserChatMessageEditor
            clientType={clientType}
            modelParameters={modelParameters}
            editorContainerClassName={moduleStyles.messageEditorContainer}
            chatButtons={chatButtons}
            hiddenContextCallback={hiddenContextCallback}
            multimodalAvailable={multimodalAvailable}
          />
        )}
        <div className={moduleStyles.buttonRow}>
          {multimodalAvailable && (
            <UploadButton
              isDisabled={uploadDisabled}
              levelName={levelName}
              hasStarterAssets={hasStarterAssets}
              buildAssetUrl={buildAssetUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWorkspace;
