import React from 'react';
import style from './interactions-table.module.scss';
import {
  StudentChatRow,
  AITutorTypes as TutorTypes,
} from '@cdo/apps/aiTutor/types';
import {
  genericCompilation,
  genericValidation,
} from '@cdo/apps/aiTutor/constants';

interface InteractionsTableRowProps {
  chatMessage: StudentChatRow;
}

const InteractionsTableRow: React.FC<InteractionsTableRowProps> = ({
  chatMessage,
}) => {
  const getTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPrompt = (chatMessage: StudentChatRow) => {
    if (chatMessage.type === TutorTypes.COMPILATION) {
      return genericCompilation;
    } else if (chatMessage.type === TutorTypes.VALIDATION) {
      return genericValidation;
    } else {
      return chatMessage.prompt;
    }
  };

  return (
    <tr className={style.row}>
      <td className={style.cell}>{chatMessage.id}</td>
      <td className={style.cell}>{chatMessage.studentName}</td>
      <td className={style.cell}>
        <div>{getTimestamp(chatMessage.createdAt)}</div>
      </td>
      <td className={style.lastCell}>
        <div>{getPrompt(chatMessage)}</div>
        <br />
        <div className={style.response}>{chatMessage.aiResponse}</div>
      </td>
    </tr>
  );
};

export default InteractionsTableRow;
