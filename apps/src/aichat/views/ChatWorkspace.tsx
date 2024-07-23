import React, {useCallback, useRef, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {
  AichatState,
  selectAllMessages,
  setShowWarningModal,
} from '@cdo/apps/aichat/redux/aichatRedux';
import ChatWarningModal from '@cdo/apps/aiComponentLibrary/warningModal/ChatWarningModal';
import {Button} from '@cdo/apps/componentLibrary/button';
import Tabs, {TabsProps} from '@cdo/apps/componentLibrary/tabs/Tabs';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import ChatItemView from './ChatItemView';
import CopyButton from './CopyButton';
import UserChatMessageEditor from './UserChatMessageEditor';

import moduleStyles from './chatWorkspace.module.scss';
import {ChatItem} from '../types';

interface ChatWorkspaceProps {
  onClear: () => void;
}

/**
 * Renders the AI Chat Lab main chat workspace component.
 */
const ChatWorkspace: React.FunctionComponent<ChatWorkspaceProps> = ({
  onClear,
}) => {
  const showWarningModal = useSelector(
    (state: {aichat: AichatState}) => state.aichat.showWarningModal
  );

  const items = useSelector(selectAllMessages);

  const isWaitingForChatResponse = useSelector(
    (state: {aichat: AichatState}) => state.aichat.isWaitingForChatResponse
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
      value: 'viewStudentChatHIstory',
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

  const handleOnChange = (value: string) => {
    console.log(value);
  };

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
      <Tabs {...tabArgs} />

      <UserChatMessageEditor />
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
