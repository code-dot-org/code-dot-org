import React from 'react';
import {StudentChatRow} from '@cdo/apps/aiTutor/types';

interface AITutorChatMessagesTableRowProps {
  chatMessage: StudentChatRow;
}

const AITutorChatMessagesTableRow: React.FunctionComponent<
  AITutorChatMessagesTableRowProps
> = ({chatMessage}) => {
  const getDate = (timestamp: string) => {
    return new Date(timestamp).toDateString();
  };

  const getTime = (timestamp: string) => {
    return new Date(timestamp).toTimeString();
  };

  return (
    <tr>
      <td>{chatMessage.studentName}</td>
      <td>
        <div>{getDate(chatMessage.createdAt)}</div>
        <div>{getTime(chatMessage.createdAt)}</div>
      </td>
      <td>
        <div>{chatMessage.prompt}</div>
        <div>{chatMessage.aiResponse}</div>
      </td>
    </tr>
  );
};

export default AITutorChatMessagesTableRow;
