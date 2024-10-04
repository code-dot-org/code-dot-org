import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  fetchStudentChatHistory,
  selectAllVisibleMessages,
  setShowModal,
} from '@cdo/apps/aichat/redux/aichatRedux';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import TeacherOnboardingModal from '@cdo/apps/aiComponentLibrary/warningModal/TeacherOnboardingModal';
import {Button} from '@cdo/apps/componentLibrary/button';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs/Tabs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {getShortName} from '../utils';

import ChatEventsList from './ChatEventsList';
import CopyButton from './CopyButton';
import UserChatMessageEditor from './UserChatMessageEditor';

import moduleStyles from './chatWorkspace.module.scss';

interface ChatWorkspaceProps {
  onClear: () => void;
}
interface Students {
  [index: number]: {
    id: number;
    name: string;
  };
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
  onClear,
}) => {
  const [selectedTab, setSelectedTab] =
    useState<WorkspaceTeacherViewTab | null>(null);

  const {showModal, studentChatHistory} = useAppSelector(state => state.aichat);
  const isUserTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const visibleItems = useSelector(selectAllVisibleMessages);

  const students = useSelector(
    (state: {teacherSections: {selectedStudents: Students}}) =>
      state.teacherSections.selectedStudents
  );

  const dispatch = useAppDispatch();

  const selectedStudentName = useMemo(() => {
    if (viewAsUserId && currentLevelId) {
      const selectedStudent = Object.values(students).find(
        student => student.id === viewAsUserId
      );
      if (selectedStudent) {
        dispatch(fetchStudentChatHistory(selectedStudent.id));
        return getShortName(selectedStudent.name);
      }
    }
    return null;
  }, [viewAsUserId, students, dispatch, currentLevelId]);

  // Teacher user is able to interact with chatbot.
  const canChatWithModel = useMemo(
    () => selectedTab !== WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY,
    [selectedTab]
  );

  useEffect(() => {
    // If we are viewing as a student, default to the student chat history tab if tab is not yet selected.
    if (viewAsUserId && !selectedTab) {
      setSelectedTab(WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY);
    } else if (!viewAsUserId) {
      setSelectedTab(null);
    }
  }, [viewAsUserId, selectedTab]);

  const iconValue: FontAwesomeV6IconProps = {
    iconName: 'lock',
    iconStyle: 'solid',
  };

  const tabs = [
    {
      value: 'viewStudentChatHistory',
      text:
        `${selectedStudentName}'s chat history` +
        (selectedTab === WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY
          ? ' (view only)'
          : ''),

      tabContent: (
        <ChatEventsList events={studentChatHistory} isTeacherView={true} />
      ),
      iconLeft: iconValue,
    },
    {
      value: 'testStudentModel',
      text: 'Test student model',
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

  const onCloseModal = useCallback(() => {
    if (
      isUserTeacher &&
      tryGetLocalStorage('teacherSawOnboarding', 'no') !== 'yes'
    ) {
      trySetLocalStorage('teacherSawOnboarding', 'yes');
    }
    dispatch(setShowModal(false));
  }, [dispatch, isUserTeacher]);

  const isTeacherFirstAichatEncounter = useCallback(() => {
    if (isUserTeacher) {
      // trySetLocalStorage('teacherSawOnboarding', 'no'); // For testing - set back to 'no'.
      const teacherSawOnboarding = tryGetLocalStorage(
        'teacherSawOnboarding',
        'no'
      );
      if (teacherSawOnboarding !== 'yes') {
        if (showModal) {
          trySetLocalStorage('teacherSawOnboarding', 'inProgress');
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }, [isUserTeacher, showModal]);

  const displayAichatModal = useCallback(() => {
    if (showModal) {
      return isTeacherFirstAichatEncounter() ? (
        <TeacherOnboardingModal onClose={onCloseModal} />
      ) : (
        <ChatWarningModal onClose={onCloseModal} />
      );
    }
  }, [isTeacherFirstAichatEncounter, onCloseModal, showModal]);

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      {displayAichatModal()}
      {viewAsUserId ? (
        <Tabs {...tabArgs} />
      ) : (
        <ChatEventsList events={visibleItems} />
      )}

      <div className={moduleStyles.footer}>
        {canChatWithModel && (
          <UserChatMessageEditor
            editorContainerClassName={moduleStyles.messageEditorContainer}
          />
        )}
        <div className={moduleStyles.buttonRow}>
          <Button
            text="Clear chat"
            disabled={!canChatWithModel}
            iconLeft={eraserIcon}
            size="s"
            type="secondary"
            color="gray"
            onClick={onClear}
          />
          <CopyButton isDisabled={!canChatWithModel} />
        </div>
      </div>
    </div>
  );
};

export default ChatWorkspace;
