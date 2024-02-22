import React, {useEffect, useState} from 'react';
import {fetchStudentChatMessages} from '@cdo/apps/aiTutor/interactionsApi';
import AITutorChatMessagesTableRow from './aiTutorChatMessageTableRow';
import style from './chat-messages-table.module.scss';

/**
 * Renders a table showing the section's students' chat messages with AI Tutor.
 */
interface AITutorChatMessagesTableProps {
  sectionId: number;
}

const AITutorChatMessagesTable: React.FunctionComponent<
  AITutorChatMessagesTableProps
> = ({sectionId}) => {
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const chatMessages = await fetchStudentChatMessages(sectionId);
        console.log('chatMessages', chatMessages);
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
