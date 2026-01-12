import {createAsyncThunk} from '@reduxjs/toolkit';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  THREAD_TYPES,
  ThreadTypeFields,
  DEFAULT_THREAD_TITLE,
} from '@cdo/apps/aiDifferentiation/constants';
import {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  EXIT_TICKET_PROMPT,
  MINI_LESSON_PROMPT,
  APCSP_DUMMY_CREATE,
  APCSP_DUMMY_EXAM,
  DEBUG_THIS_CODE,
  IMPROVE_THIS_CODE,
  SUGGESTED_PROMPTS_FOR_SELECTION,
  SUGGEST_CURRICULUM_PROMPT,
  GET_STARTED_PROMPT,
  CREATE_SECTION_PROMPT,
} from '@cdo/apps/aiDifferentiation/predefinedPrompts';
import {
  ChatPrompt,
  ChatTextMessage,
  ChatThread,
  chatThreadMessagesValidator,
} from '@cdo/apps/aiDifferentiation/types';
import {RootState} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {
  AiDiffContext,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';

import {
  setThreadId,
  setThreadTitle,
  setThreadType,
  setThreadMessages,
  setThreadKeyId,
  setInitialChatMessage,
  setInitialThreadPrompt,
  setSelectedPrompt,
  setArtifactType,
} from '../slice';

interface FetchThreadMessagesParams {
  contextType: string;
  thread: number;
  threadType?: ThreadTypeFields;
  initialThreadPrompt?: ChatPrompt;
  curriculumCourses: string[] | undefined;
}

const APCSP_PROMPTS = [APCSP_DUMMY_CREATE, APCSP_DUMMY_EXAM];

const SUGGESTED_PROMPTS = [
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  MINI_LESSON_PROMPT,
  EXIT_TICKET_PROMPT,
];

const getDefaultSuggestedPrompts = (
  contextType: string,
  teacherHasSections: boolean,
  teacherHasSectionWithCurriculum: boolean,
  teacherHasSectionWithStudents: boolean
) =>
  contextType === AiDiffContext.GENERAL
    ? SUGGESTED_PROMPTS_FOR_SELECTION['support'].suggestedPrompts.filter(
        ({label}) => {
          // Hide some new thread default prompts based on teacher's sections
          if (
            (label === GET_STARTED_PROMPT.label ||
              label === CREATE_SECTION_PROMPT.label) &&
            teacherHasSections &&
            teacherHasSectionWithCurriculum &&
            teacherHasSectionWithStudents
          ) {
            return false;
          }

          if (
            label === SUGGEST_CURRICULUM_PROMPT.label &&
            teacherHasSectionWithCurriculum
          ) {
            return false;
          }

          return true;
        }
      )
    : SUGGESTED_PROMPTS;

async function asyncFetchThreadMessages(thread: number): Promise<ChatThread> {
  const response = await HttpClient.fetchJson<ChatThread>(
    `/aidiff_threads/${thread}`,
    {},
    chatThreadMessagesValidator
  );
  return response.value;
}

export const fetchThreadMessages = createAsyncThunk(
  'aichat/fetchThreadMessages',
  async (
    {
      contextType,
      thread,
      threadType = THREAD_TYPES.default,
      initialThreadPrompt,
      curriculumCourses = [] as string[],
    }: FetchThreadMessagesParams,
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const teacherSectionData = state.teacherSections?.sections;
    const teacherSections = teacherSectionData
      ? Object.values(teacherSectionData)
      : [];
    const teacherHasSections = teacherSections.length > 0;
    const teacherHasSectionWithCurriculum = !!teacherSections.find(
      section => section.courseId !== null
    );
    const teacherHasSectionWithStudents = !!teacherSections.find(
      section => section.studentCount > 0
    );
    const defaultSuggestedPrompts = getDefaultSuggestedPrompts(
      contextType,
      teacherHasSections,
      teacherHasSectionWithCurriculum,
      teacherHasSectionWithStudents
    );
    const additionalPrompts: ChatPrompt[] = [];
    if (curriculumCourses?.includes('csp')) {
      additionalPrompts.push(...APCSP_PROMPTS);
    }
    if (contextType === AiDiffContext.LEVEL) {
      additionalPrompts.push(DEBUG_THIS_CODE, IMPROVE_THIS_CODE);
    }
    const suggestedPrompts = defaultSuggestedPrompts.concat(additionalPrompts);

    thunkAPI.dispatch(setThreadType(threadType));

    if (thread === 0) {
      thunkAPI.dispatch(setThreadId(0));
      thunkAPI.dispatch(setThreadTitle(DEFAULT_THREAD_TITLE));
      thunkAPI.dispatch(setInitialChatMessage(threadType.initialMessage));
      thunkAPI.dispatch(setSelectedPrompt(null));
      thunkAPI.dispatch(setArtifactType(undefined));

      if (initialThreadPrompt) {
        thunkAPI.dispatch(setInitialThreadPrompt(initialThreadPrompt));
        thunkAPI.dispatch(
          setThreadMessages([
            {
              role: Role.USER,
              chatMessageText: initialThreadPrompt.prompt,
              status: Status.OK,
            },
          ])
        );
      } else {
        const initialAIMessage = {
          role: Role.ASSISTANT,
          chatMessageText: threadType.initialMessage,
          status: Status.OK,
        };
        thunkAPI.dispatch(setInitialThreadPrompt(null));
        thunkAPI.dispatch(
          setThreadMessages(
            suggestedPrompts && threadType.showSuggestedPrompts
              ? [initialAIMessage, suggestedPrompts]
              : [initialAIMessage, SUGGESTED_PROMPTS]
          )
        );
      }

      // changing the keyId resets the component state.
      // if key is already 0 (i.e. starting a new thread from a new thread)
      // then we need to alternate to a different key value to reset state
      // -1 is safe because it won't accidentally match a threadID value
      if (state.aichat.threadKeyId === 0) {
        thunkAPI.dispatch(setThreadKeyId(-1));
      } else {
        thunkAPI.dispatch(setThreadKeyId(thread));
      }
    } else {
      asyncFetchThreadMessages(thread).then(response => {
        thunkAPI.dispatch(setThreadMessages(response.messages || []));
        thunkAPI.dispatch(setThreadId(thread));
        thunkAPI.dispatch(setThreadTitle(response.title));
        thunkAPI.dispatch(setThreadKeyId(thread));
        thunkAPI.dispatch(setArtifactType(undefined));
        const thread_messages = response.messages || [];
        if (thread_messages.length > 1) {
          const last_msg = thread_messages[
            thread_messages.length - 1
          ] as ChatTextMessage;
          const second_last_msg = thread_messages[
            thread_messages.length - 2
          ] as ChatTextMessage;
          if (last_msg.isArtifactCandidate) {
            thunkAPI.dispatch(setArtifactType(last_msg.artifactCandidateType));
          } else {
            thunkAPI.dispatch(
              setArtifactType(second_last_msg.artifactCandidateType)
            );
          }
        }
      });
    }
  }
);
