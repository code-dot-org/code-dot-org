import React from 'react';
import {StudentChatRow} from '@cdo/apps/aiTutor/types';

interface AITutorChatMessagesTableRowProps {
  chatMessage: StudentChatRow;
}

const AITutorChatMessagesTableRow: React.FunctionComponent<
  AITutorChatMessagesTableRowProps
> = ({chatMessage}) => {
  return (
    <tr>
      <td>{chatMessage.studentName}</td>
      <td>{chatMessage.createdAt}</td>
      <td>
        <div>{chatMessage.prompt}</div>
        <div>{chatMessage.aiResponse}</div>
      </td>
    </tr>
  );
};

export default AITutorChatMessagesTableRow;
