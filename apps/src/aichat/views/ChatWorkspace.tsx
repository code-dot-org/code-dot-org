import {Button} from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tabs, {TabsProps} from '@code-dot-org/component-library/tabs';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LevelPropertiesContext} from '../levelPropertiesContext';
import aichatI18n from '../locale';
import {
  clearChatMessages,
  clearStagedFiles,
  fetchUserChatHistory,
  getSelectMultimodalAvailable,
  selectAllVisibleMessages,
} from '../redux';
import {AichatLevelProperties, ChatButton} from '../types';
import {getShortName} from '../utils';

import StagedFilesPreview from './assets/StagedFilesPreview';
import UploadButton from './assets/UploadButton';
import ChatEventsList from './ChatEventsList';
import CopyChatHistoryButton from './CopyChatHistoryButton';
import UserChatMessageEditor from './UserChatMessageEditor';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatWorkspaceProps {
  // TODO: Temporary passing through level properties again because sub-components depend on the level properties context.
  // When fully modularizing this component, we will instead pass through necessary data through props.
  levelProperties: LevelProperties;
  chatButtons?: ChatButton[];
  hiddenContext?: string;
  onClear: () => void;
}

enum WorkspaceTeacherViewTab {
  STUDENT_CHAT_HISTORY = 'viewStudentChatHistory',
  TEST_STUDENT_MODEL = 'testStudentModel',
}

const eraserIcon: FontAwesomeV6IconProps = {
  iconName: 'eraser',
};

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent<ChatWorkspaceProps> = ({
  levelProperties,
  chatButtons,
  hiddenContext,
  onClear,
}) => {
  const [selectedTab, setSelectedTab] =
    useState<WorkspaceTeacherViewTab | null>(null);

  const {studentChatHistory} = useAppSelector(state => state.aichat);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const visibleItems = useSelector(selectAllVisibleMessages);
  const currentUserId = useAppSelector(state => state.currentUser.userId);

  const selectedStudent = useAppSelector(({teacherSections, progress}) => {
    const students = teacherSections.selectedStudents;
    if (progress.viewAsUserId && progress.currentLevelId) {
      return Object.values(students).find(
        student => student.id === progress.viewAsUserId
      );
    }
  });

  const dispatch = useAppDispatch();

  // This effect resets chat history and any staged uploads when:
  // a) a user switches levels, or
  // b) a teacher switches between viewing students (or their own project) on a given level.
  useEffect(() => {
    dispatch(clearChatMessages());
    dispatch(clearStagedFiles());

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
      setSelectedTab(WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY);
    } else if (!selectedStudent) {
      setSelectedTab(null);
    }
  }, [selectedStudent, selectedTab]);

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
        <ChatEventsList events={studentChatHistory} isTeacherView={true} />
      ),
      iconLeft: iconValue,
    },
    {
      value: 'testStudentModel',
      text: aichatI18n.testStudentModel(),
      tabContent: <ChatEventsList events={visibleItems} />,
    },
  ];

  const handleOnChange = useCallback(
    (value: string) => {
      setSelectedTab(value as WorkspaceTeacherViewTab);
    },
    [setSelectedTab]
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

  const multimodalEnabled = useAppSelector(
    getSelectMultimodalAvailable(
      (levelProperties as AichatLevelProperties).aichatSettings
        ?.multimodalEnabled
    )
  );

  return (
    <LevelPropertiesContext.Provider value={levelProperties}>
      <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
        {selectedStudent ? (
          <Tabs {...tabArgs} />
        ) : (
          <ChatEventsList events={visibleItems} />
        )}

        <div className={moduleStyles.footer}>
          {multimodalEnabled && <StagedFilesPreview />}
          {canChatWithModel && (
            <UserChatMessageEditor
              editorContainerClassName={moduleStyles.messageEditorContainer}
              chatButtons={chatButtons}
              hiddenContext={hiddenContext}
            />
          )}
          <div className={moduleStyles.buttonRow}>
            {multimodalEnabled && (
              <UploadButton
                isDisabled={!canChatWithModel || !!selectedStudent}
              />
            )}
            <Button
              text={aichatI18n.clearChatButtonText()}
              disabled={!canChatWithModel}
              iconLeft={eraserIcon}
              size="s"
              type="secondary"
              color="gray"
              onClick={onClear}
            />
            <CopyChatHistoryButton isDisabled={!canChatWithModel} />
          </div>
        </div>
      </div>
    </LevelPropertiesContext.Provider>
  );
};

export default ChatWorkspace;
