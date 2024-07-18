import React from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatItems/ChatMessage';
import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

import {hideNotification} from '../redux/aichatRedux';
import {timestampToLocalTime} from '../redux/utils';
import {ChatItem, isChatMessage, isNotification} from '../types';

interface ChatItemViewProps {
  item: ChatItem;
}

/**
 * Renders AI Chat {@link ChatItem}s using common AI design components.
 */
const ChatItemView: React.FunctionComponent<ChatItemViewProps> = ({item}) => {
  const dispatch = useAppDispatch();

  if (isChatMessage(item)) {
    return <ChatMessage {...item} />;
  }

  if (isNotification(item) && !item.hidden) {
    const {id, text, status, timestamp} = item;
    return (
      <Alert
        text={`${text} ${timestampToLocalTime(timestamp)}`}
        type={
          status === Status.OK || status === Status.UNKNOWN
            ? 'success'
            : 'danger'
        }
        onClose={() => dispatch(hideNotification(id))}
        size="s"
      />
    );
  }

  return null;
};

export default ChatItemView;
