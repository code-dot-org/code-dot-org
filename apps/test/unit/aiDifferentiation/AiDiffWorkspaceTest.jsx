import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {aichatReducer, setThreadMessages} from '@cdo/apps/aichat/redux/slice';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiDiffWorkspace from '@cdo/apps/aiDifferentiation/AiDiffWorkspace';
import {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  EXIT_TICKET_PROMPT,
  MINI_LESSON_PROMPT,
  SUGGESTED_PROMPTS_FOR_SELECTION,
} from '@cdo/apps/aiDifferentiation/predefinedPrompts';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setInitialData,
} from '@cdo/apps/templates/currentUserRedux';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {
  AiInteractionStatus as Status,
  AiDiffContext,
} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

jest.mock('@react-pdf/renderer', () => {
  return {
    PDFDownloadLink: () => null,
    StyleSheet: {
      create: () => null,
    },
  };
});

const defaultProps = {
  open: true,
  context: {
    type: AiDiffContext.LESSON,
    lessonId: 2,
  },
  scriptName: 'test_lesson',
  curriculumCourses: [],
  personalizationData: {},
};

const DEFAULT_SUGGESTED_PROMPTS = [
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  MINI_LESSON_PROMPT,
  EXIT_TICKET_PROMPT,
];

const defaultChatResponse = {
  chat_message_text: "Beep boop I'm a bot",
  status: Status.OK,
  thread_id: 3,
  message_id: 42,
};

describe('AiDiffWorkspace', () => {
  let fetchJsonStub;
  let postStub;

  beforeEach(() => {
    stubRedux();
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();

    fetchJsonStub = jest.fn();
    HttpClient.fetchJson = fetchJsonStub;
    postStub = jest.spyOn(HttpClient, 'post').mockResolvedValue({
      json: jest.fn(() => defaultChatResponse),
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
    restoreRedux();
  });

  function renderDefault(propOverrides = {}) {
    const store = getStore();

    registerReducers({
      currentUser,
      teacherSections,
      aichat: aichatReducer,
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
      })
    );
    store.dispatch(setSections([]));
    store.dispatch(
      setThreadMessages([
        {
          role: Role.ASSISTANT,
          chatMessageText:
            SUGGESTED_PROMPTS_FOR_SELECTION['default'].initialMessage,
          status: Status.OK,
        },
        DEFAULT_SUGGESTED_PROMPTS,
      ])
    );

    render(
      <Provider store={store}>
        <AiDiffWorkspace {...defaultProps} {...propOverrides} />
      </Provider>
    );
  }

  it('Shows initial messages and prompts', () => {
    renderDefault();

    // initial message and prompts in (new) chat are displayed
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    // suggested prompts
    const suggestedPromptsGroup = screen.getByRole('group', {
      name: 'Suggested Prompts',
    });
    expect(within(suggestedPromptsGroup).getAllByRole('button')).toHaveLength(
      5
    );
    screen.getByRole('button', {name: 'Give me an example'});
    screen.getByRole('button', {name: 'Explain a concept'});
    screen.getByRole('button', {name: 'Debug common mistakes'});
    screen.getByRole('button', {name: 'Generate a mini lesson'});
    screen.getByRole('button', {name: 'Write an exit ticket'});
  });

  it('Send a message in new thread', async () => {
    renderDefault();

    const submit_btn = screen.getByRole('button', {name: i18n.submit()});
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, {target: {value: 'starting new thread'}});
    fireEvent.click(submit_btn);

    await waitFor(() => {
      expect(postStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        JSON.stringify({
          inputText: 'starting new thread',
          isPreset: false,
          presetChipText: null,
          context: {
            type: AiDiffContext.LESSON,
            lessonId: 2,
          },
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
    });

    // one user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      'starting new thread'
    );
    // second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");
  });
});
