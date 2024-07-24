import React, {useCallback, useRef, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  selectAllMessages,
  setShowWarningModal,
} from '@cdo/apps/aichat/redux/aichatRedux';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {Button} from '@cdo/apps/componentLibrary/button';
import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs/Tabs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatItem} from '../types';

import ChatItemView from './ChatItemView';
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

const WORKSPACE_VIEW_MODE = {
  STUDENT_CHAT_HISTORY: 'viewStudentChatHistory',
  TEST_STUDENT_MODEL: 'testStudentModel',
  PARTICIPANT: 'participant',
};

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent<ChatWorkspaceProps> = ({
  onClear,
}) => {
  const [viewMode, setViewMode] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(
    null
  );

  const {showWarningModal, isWaitingForChatResponse} = useAppSelector(
    state => state.aichat
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const items = useSelector(selectAllMessages);

  const students = useSelector(
    (state: {teacherSections: {selectedStudents: Students}}) =>
      state.teacherSections.selectedStudents
  );

  // Compare the messages as a string since the object reference will change on every update.
  // This way we will only scroll when the contents of the messages have changed.
  const messagesString = JSON.stringify(items);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTo({
        top: conversationContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messagesString, isWaitingForChatResponse]);

  useEffect(() => {
    let selectedStudentName = null;
    if (viewAsUserId) {
      const selectedStudent = Object.values(students).find(
        student => student.id === viewAsUserId
      );
      if (selectedStudent) {
        selectedStudentName = getShortName(selectedStudent.name);
      }
    }
    setSelectedStudentName(selectedStudentName);
  }, [viewAsUserId, students]);

  useEffect(() => {
    // If a teacher is viewing workspace as a student when level first loads (user_id param included in url)
    // or from when viewing workspace as a participant, default to the student chat history view.
    if (
      viewAsUserId &&
      (!viewMode || viewMode === WORKSPACE_VIEW_MODE.PARTICIPANT)
    ) {
      setViewMode(WORKSPACE_VIEW_MODE.STUDENT_CHAT_HISTORY);
    } else if (!viewAsUserId) {
      setViewMode(WORKSPACE_VIEW_MODE.PARTICIPANT);
    }
  }, [viewAsUserId, viewMode]);

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

  const tabs = [
    {
      value: 'viewStudentChatHistory',
      text: `View ${selectedStudentName}'s chat history`,
      tabContent: (
        <div>Viewing {selectedStudentName}'s chat history - TODO</div>
      ),
    },
    {
      value: 'testStudentModel',
      text: 'Test student model',
      tabContent: (
        <TestModel
          items={items}
          showWaitingAnimation={showWaitingAnimation}
          conversationContainerRef={conversationContainerRef}
        />
      ),
    },
  ];

  const handleOnChange = useCallback(
    (value: string) => {
      setViewMode(value);
    },
    [setViewMode]
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

  const dispatch = useAppDispatch();

  const onCloseWarningModal = useCallback(
    () => dispatch(setShowWarningModal(false)),
    [dispatch]
  );

  return (
    <div id="chat-workspace-area" className={moduleStyles.chatWorkspace}>
      {showWarningModal && <ChatWarningModal onClose={onCloseWarningModal} />}
      {viewMode !== WORKSPACE_VIEW_MODE.PARTICIPANT && <Tabs {...tabArgs} />}
      {viewMode === WORKSPACE_VIEW_MODE.PARTICIPANT && (
        <TestModel
          items={items}
          showWaitingAnimation={showWaitingAnimation}
          conversationContainerRef={conversationContainerRef}
        />
      )}

      {viewMode !== WORKSPACE_VIEW_MODE.STUDENT_CHAT_HISTORY && (
        <UserChatMessageEditor className={moduleStyles.messageEditor} />
      )}
      <div className={moduleStyles.buttonRow}>
        <Button
          text="Clear chat"
          disabled={viewMode === WORKSPACE_VIEW_MODE.STUDENT_CHAT_HISTORY}
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

interface TestModelProps {
  conversationContainerRef: React.RefObject<HTMLDivElement>;
  items: ChatItem[];
  showWaitingAnimation: () => React.ReactNode;
}

const TestModel: React.FunctionComponent<TestModelProps> = ({
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
        <ChatItemView item={item} key={index} />
      ))}
      {showWaitingAnimation()}
    </div>
  );
};

const MAX_NAME_LENGTH = 15;
const getShortName = (studentName: string): string => {
  // If the student name contains a first and last name separated by whitespace, only use the first name.
  const first = studentName.split(/\s/)[0];
  // If the first name is longer than 10 characters, only use the first 10 characters.
  return first.length > 10 ? first.slice(0, MAX_NAME_LENGTH) : first;
};

export default ChatWorkspace;
