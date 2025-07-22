import React from 'react';

import {clearChatMessages} from '@cdo/apps/aichat/redux';
import {ModelParameters} from '@cdo/apps/aichat/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {aiTutorModelId} from '../../ai/AiTutorModelId';

import moduleStyles from './AiTutor2Chat.module.scss';

const MODEL_PARAMETERS: ModelParameters = {
  systemPrompt:
    'You are an AI Computer Science Tutor that supports students through scaffolded learning, metacognitive reflection, and problem-solving strategies. Target the reading age of an American 7th grader. By default, when a student asks a question, you should respond with a clarifying question, a small hint, or a reflective nudge—to help them take the next step without solving the task for them. Do not give them the answer directly. If the student appears frustrated, you may include syntax or pseudocode. If the student explicitly asks for a HINT, provide a tip that nudges them forward to take the next step. If they ask for an EXAMPLE, give a short (1–3 line) conceptual code snippet from a different context that illustrates the relevant idea without solving the actual task. If they request DOCUMENTATION, share 1–3 concise and relevant references formatted with a clear keyword, short explanation and example code. Always work within the provided instructions, student code, and question, and tailor your support to encourage confidence, independence, and thoughtful programming.',
  selectedModelId: aiTutorModelId,
  temperature: 0.5,
  retrievalContexts: [],
};

// Some pre-canned chat buttons.
const CHAT_BUTTONS = [
  {
    label: 'example',
    value: 'Can you give me an example?',
  },
  {
    label: 'hint',
    value: 'Can you give me a hint?',
  },
  {
    label: 'doc',
    value: 'Can you give me some documentation?',
  },
];

interface AiTutor2ChatProps {
  hiddenContext: string;
}

// A free chat with lab-supplied context added to each question.
const AiTutor2Chat: React.FunctionComponent<AiTutor2ChatProps> = ({
  hiddenContext,
}) => {
  const dispatch = useAppDispatch();

  return (
    <div className={moduleStyles.container}>
      <ChatWorkspace
        clientType={AiChatClientTypes.AI_TUTOR}
        modelParameters={MODEL_PARAMETERS}
        chatButtons={CHAT_BUTTONS}
        hiddenContext={hiddenContext}
        onClear={() => {
          dispatch(clearChatMessages());
        }}
      />
    </div>
  );
};

export default AiTutor2Chat;
