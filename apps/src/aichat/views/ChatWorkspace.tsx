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

  const {showWarningModal, isWaitingForChatResponse} = useAppSelector(
    state => state.aichat
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const items = useSelector(selectAllMessages);

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
  }, [viewAsUserId, viewMode, setViewMode]);

  const dispatch = useAppDispatch();

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

  const studentShortName = 'Sam';
  const tabs = [
    {
      value: 'viewStudentChatHistory',
      text: `View ${studentShortName} chat history`,
      tabContent: <div>Viewing {studentShortName} chat history</div>,
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
    tabPanelsContainerClassName: moduleStyles.conversationArea,
  };

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
        <UserChatMessageEditor />
      )}
      <div className={moduleStyles.buttonRow}>
        <Button
          text="Clear chat"
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

export default ChatWorkspace;
