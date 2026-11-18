import React, {FC} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';

const noHiddenContext = async () => '';

interface TutorChatProps {
  systemPrompt: string;
  lessonId: number;
}

const TutorChat: FC<TutorChatProps> = ({systemPrompt, lessonId}) => (
  <AiTutorChat
    hiddenContextCallback={noHiddenContext}
    aiTutorSystemPrompt={systemPrompt}
    aiTutorChatButtonData={[]}
    isLessonDeepDive={true}
    levelId={null}
    lessonId={lessonId}
  />
);

export default TutorChat;
