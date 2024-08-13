import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  fetchStudentChatHistory,
  selectAllVisibleMessages,
  setShowWarningModal,
} from '@cdo/apps/aichat/redux/aichatRedux';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {Button} from '@cdo/apps/componentLibrary/button';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs/Tabs';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatEvent} from '../types';
import {getShortName} from '../utils';

import ChatEventView from './ChatEventView';
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

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent<ChatWorkspaceProps> = ({
  onClear,
}) => {
  const [selectedTab, setSelectedTab] =
    useState<WorkspaceTeacherViewTab | null>(null);

  const {showWarningModal, isWaitingForChatResponse, studentChatHistory} =
    useAppSelector(state => state.aichat);
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const visibleItems = useSelector(selectAllVisibleMessages);

  const students = useSelector(
    (state: {teacherSections: {selectedStudents: Students}}) =>
      state.teacherSections.selectedStudents
  );

  const dispatch = useAppDispatch();

  // Compare the messages as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the messages have changed.
  const messagesString = JSON.stringify(visibleItems);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messagesString, isWaitingForChatResponse]);

  const selectedStudentName = useMemo(() => {
    if (viewAsUserId) {
      const selectedStudent = Object.values(students).find(
        student => student.id === viewAsUserId
      );
      if (selectedStudent) {
        dispatch(fetchStudentChatHistory(selectedStudent.id));
        return getShortName(selectedStudent.name);
      }
    }
    return null;
  }, [viewAsUserId, students, dispatch]);

  // Teacher user is able to interact with chatbot.
  const canChatWithModel = useMemo(
    () =>
      selectedTab !== WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY ||
      !experiments.isEnabled(experiments.VIEW_CHAT_HISTORY),
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

  const showWaitingAnimation = () => {
    if (isWaitingForChatResponse) {
      return (
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={moduleStyles.waitingForResponse}
        />
      );
    }
  };

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
        <StudentChatHistory
          events={studentChatHistory}
          conversationContainerRef={conversationContainerRef}
        />
      ),
      iconLeft: iconValue,
    },
    {
      value: 'testStudentModel',
      text: 'Test student model',
      tabContent: (
        <ChatWithModel
          items={visibleItems}
          showWaitingAnimation={showWaitingAnimation}
          conversationContainerRef={conversationContainerRef}
        />
      ),
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
    tabPanelsContainerClassName: moduleStyles.tabPanels,
  };

  const onCloseWarningModal = useCallback(
    () => dispatch(setShowWarningModal(false)),
    [dispatch]
  );

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      {showWarningModal && <ChatWarningModal onClose={onCloseWarningModal} />}
      {experiments.isEnabled(experiments.VIEW_CHAT_HISTORY) && viewAsUserId ? (
        <Tabs {...tabArgs} />
      ) : (
        <ChatWithModel
          items={visibleItems}
          showWaitingAnimation={showWaitingAnimation}
          conversationContainerRef={conversationContainerRef}
        />
      )}

      {canChatWithModel && (
        <UserChatMessageEditor
          editorContainerClassName={moduleStyles.messageEditorContainer}
        />
      )}
      <div className={moduleStyles.buttonRow}>
        <Button
          text="Clear chat"
          disabled={!canChatWithModel}
          iconLeft={{iconName: 'eraser'}}
          size="s"
          type="secondary"
          color="gray"
          onClick={onClear}
        />
        <CopyButton />
      </div>
    </div>
  );
};

interface ChatWithModelProps {
  conversationContainerRef: React.RefObject<HTMLDivElement>;
  items: ChatEvent[];
  showWaitingAnimation: () => React.ReactNode;
}

const ChatWithModel: React.FunctionComponent<ChatWithModelProps> = ({
  items,
  showWaitingAnimation,
  conversationContainerRef,
}) => {
  return (
    <div
      id="chat-workspace-conversation"
      className={moduleStyles.conversationArea}
      ref={conversationContainerRef}
    >
      {items.map((item, index) => (
        <ChatEventView event={item} key={index} />
      ))}
      {showWaitingAnimation()}
    </div>
  );
};

interface StudentChatHistoryProps {
  events: ChatEvent[];
  conversationContainerRef: React.RefObject<HTMLDivElement>;
}

const StudentChatHistory: React.FunctionComponent<StudentChatHistoryProps> = ({
  events,
  conversationContainerRef,
}) => {
  const studentChatHistoryEvents = events.map(
    event =>
      ({
        ...event,
        isTeacherView: true,
      } as ChatEvent)
  );
  return (
    <ChatWithModel
      items={studentChatHistoryEvents}
      showWaitingAnimation={() => null}
      conversationContainerRef={conversationContainerRef}
    />
  );
};

export default ChatWorkspace;
