import {fetchStudentChatMessages} from '@cdo/apps/aiTutor/interactionsApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import React, {useEffect, useState} from 'react';

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
      <h3>Table of chat messages will go here</h3>
      {chatMessages.map(msg => (
        <div>{msg.aiResponse}</div>
      ))}
    </div>
  );
};

export default AITutorChatMessagesTable;
