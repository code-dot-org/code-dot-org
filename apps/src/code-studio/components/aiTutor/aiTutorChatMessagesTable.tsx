import React, {useEffect, useState} from 'react';
import {fetchAITutorInteractions} from '@cdo/apps/aiTutor/interactionsApi';
import AITutorChatMessagesTableRow from './aiTutorChatMessageTableRow';
import style from './chat-messages-table.module.scss';
import {StudentChatRow} from '@cdo/apps/aiTutor/types';

/**
 * Renders a table showing the section's students' chat messages with AI Tutor.
 */
interface AITutorChatMessagesTableProps {
  sectionId: number;
}

const AITutorChatMessagesTable: React.FunctionComponent<
  AITutorChatMessagesTableProps
> = ({sectionId}) => {
  const [chatMessages, setChatMessages] = useState<StudentChatRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const chatMessages = await fetchAITutorInteractions({sectionId});
        setChatMessages(chatMessages);
      } catch (error) {
        console.log('error', error);
      }
    })();
  }, [sectionId]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <td>
              <div className={style.header}>Id</div>
            </td>
            <td>
              <div className={style.header}>Student</div>
            </td>
            <td>
              <div className={style.header}>Timestamp</div>
            </td>
            <td>
              <div className={style.header}>AI Tutor Responses</div>
            </td>
          </tr>
        </thead>
        <tbody>
          {chatMessages.map(chatMessage => (
            <AITutorChatMessagesTableRow
              key={chatMessage.id}
              chatMessage={chatMessage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AITutorChatMessagesTable;
