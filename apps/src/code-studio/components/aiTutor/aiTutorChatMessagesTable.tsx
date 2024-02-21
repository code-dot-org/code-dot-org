import {getSectionAITutorInteractions} from '@cdo/apps/aiTutor/interactionsApi';
import React from 'react';

/**
 * Renders a table showing the section's students' chat messages with AI Tutor.
 */
interface AITutorChatMessagesTableProps {
  sectionId: number;
}

const AITutorChatMessagesTable: React.FunctionComponent<
  AITutorChatMessagesTableProps
> = async ({sectionId}) => {
  const aiTutorInteractions = await getSectionAITutorInteractions(sectionId);

  console.log('sectionId: ', sectionId);
  console.log('aiTutorInteractions ', aiTutorInteractions);
  return <div>Table of chat messages will go here.</div>;
};

export default AITutorChatMessagesTable;
