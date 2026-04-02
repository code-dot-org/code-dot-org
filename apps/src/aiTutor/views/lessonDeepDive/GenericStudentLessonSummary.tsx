import React, {FC} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

interface GenericStudentLessonSummaryProps {
  lessonSummary: string;
}

const GenericStudentLessonSummary: FC<GenericStudentLessonSummaryProps> = ({
  lessonSummary,
}) => {
  return <ChatMessage text={lessonSummary} role={Role.ASSISTANT} />;
};

export default GenericStudentLessonSummary;
