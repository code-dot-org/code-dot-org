import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  aichatReducer,
  setThreadId,
  setThreadTitle,
  setThreadType,
  setThreadMessages,
  setInitialChatMessage,
} from '@cdo/apps/aichat/redux/slice';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiDiffChat from '@cdo/apps/aiDifferentiation/AiDiffChat';
import {THREAD_TYPES} from '@cdo/apps/aiDifferentiation/constants';
import {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  EXIT_TICKET_PROMPT,
  MINI_LESSON_PROMPT,
  APCSP_DUMMY_CREATE,
  APCSP_DUMMY_EXAM,
  SUGGESTED_PROMPTS_FOR_SELECTION,
} from '@cdo/apps/aiDifferentiation/predefinedPrompts';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
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

const DEFAULT_SUGGESTED_PROMPTS = [
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  MINI_LESSON_PROMPT,
  EXIT_TICKET_PROMPT,
];

const defaultProps = {
  closeTutor: () => {},
  open: true,
  context: {
    type: AiDiffContext.LESSON,
    lessonId: 2,
  },
  scriptName: 'test_lesson',
  personalizationData: {},
};

const defaultChatResponse = {
  chat_message_text: "Beep boop I'm a bot",
  status: Status.OK,
  thread_id: 3,
  message_id: 42,
};

const defaultFeedbackResponse = {
  chatContext: {
    type: AiDiffContext.LESSON,
    lessonId: 2,
  },
  scriptName: 'test_lesson',
  thumbsUp: true,
  thumbsDown: false,
  flagged: false,
  text: "Beep boop I'm a bot",
  messageId: 42,
};

describe('AiDiffChat', () => {
  let postStub;
  let sendEventSpy;

  beforeEach(() => {
    stubRedux();
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
    postStub = jest.spyOn(HttpClient, 'post').mockImplementation(url => {
      if (url.includes('aidiff_threads')) {
        return Promise.resolve(
          new Response(JSON.stringify(defaultChatResponse))
        );
      }
      if (url.includes('submit_feedback')) {
        return Promise.resolve(
          new Response(JSON.stringify(defaultFeedbackResponse))
        );
      }
      return Promise.resolve(new Response(JSON.stringify(defaultChatResponse)));
    });

    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
    restoreRedux();
  });

  function renderDefault(overrideThreadId = 0, overrideThreadMessages = []) {
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
    store.dispatch(setThreadId(overrideThreadId));
    store.dispatch(setThreadTitle('Sample title'));
    store.dispatch(setThreadType(THREAD_TYPES.default));
    store.dispatch(
      setInitialChatMessage(
        SUGGESTED_PROMPTS_FOR_SELECTION['default'].initialMessage
      )
    );
    store.dispatch(
      setThreadMessages(
        overrideThreadMessages.length > 0
          ? overrideThreadMessages
          : [
              {
                role: Role.ASSISTANT,
                chatMessageText:
                  SUGGESTED_PROMPTS_FOR_SELECTION['default'].initialMessage,
                status: Status.OK,
              },
              DEFAULT_SUGGESTED_PROMPTS,
            ]
      )
    );

    render(
      <Provider store={store}>
        <AiDiffChat {...defaultProps} />
      </Provider>
    );
  }

  it('initial message and suggested prompts are rendered', () => {
    renderDefault();
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      SUGGESTED_PROMPTS_FOR_SELECTION['default'].initialMessage
    );
    //suggested prompts
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

  it('Selecting a suggested prompt gives response', async () => {
    renderDefault();

    //click a suggested prompt
    const prompt = screen.getByRole('button', {name: 'Explain a concept'});
    fireEvent.click(prompt);

    const responseEventData = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.USER,
      isPreset: true,
      text: 'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };
    const responseEventData2 = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.ASSISTANT,
      isPreset: true,
      text: "Beep boop I'm a bot",
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };

    //sends the api call then logs the suggested prompt and the bot message
    await waitFor(() => {
      expect(postStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        JSON.stringify({
          inputText: responseEventData.text,
          isPreset: true,
          presetChipText: 'Explain a concept',
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
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData,
        PLATFORMS.STATSIG
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData2,
        PLATFORMS.STATSIG
      );
    });

    //bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent("Beep boop I'm a bot");
  });

  it('Selecting a 2-stage APCSP suggested prompt gives response and adds second set of prompts to thread messages', async () => {
    const overrideThreadMessages = [
      {
        role: Role.ASSISTANT,
        chatMessageText:
          SUGGESTED_PROMPTS_FOR_SELECTION['default'].initialMessage,
        status: Status.OK,
      },
      [...DEFAULT_SUGGESTED_PROMPTS, APCSP_DUMMY_CREATE, APCSP_DUMMY_EXAM],
    ];
    renderDefault(0, overrideThreadMessages);

    //click a suggested prompt
    const suggestedPromptsGroup = screen.getByRole('group', {
      name: 'Suggested Prompts',
    });
    expect(within(suggestedPromptsGroup).getAllByRole('button')).toHaveLength(
      7
    );
    const prompt = screen.getByRole('button', {name: 'Create task support'});
    fireEvent.click(prompt);

    //bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent(
      'Let’s chat about the Create Task! Here are some ideas you can ask me, or type your question below'
    );

    //second set of suggested prompts
    // Re-query the group after new prompts are added
    const updatedGroup = screen.getByRole('group', {
      name: 'Suggested Prompts',
    });
    expect(within(updatedGroup).getAllByRole('button')).toHaveLength(13);
    screen.getByRole('button', {name: 'Create Performance Task samples'});
    screen.getByRole('button', {
      name: 'Can teachers review student submissions?',
    });
    screen.getByRole('button', {
      name: 'Student collaboration on the Create Task',
    });
    screen.getByRole('button', {name: 'AI Tools on the Create Task'});
    screen.getByRole('button', {name: 'Can I grade the Create Task'});
    screen.getByRole('button', {
      name: 'Resources to prepare for written responses',
    });

    //click a second step suggested prompt
    const prompt2 = screen.getByRole('button', {
      name: 'Can I grade the Create Task',
    });
    fireEvent.click(prompt2);

    const responseEventData = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.USER,
      isPreset: true,
      text: 'Can I give students a grade on their Create PT?',
      threadId: 3,
      url: window.location.href,
    };
    const responseEventData2 = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.ASSISTANT,
      isPreset: true,
      text: "Beep boop I'm a bot",
      threadId: 3,
      url: window.location.href,
    };

    //sends the api call then logs the suggested prompt and the bot message
    await waitFor(() => {
      expect(postStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        JSON.stringify({
          inputText: responseEventData.text,
          isPreset: true,
          presetChipText: 'Can I grade the Create Task',
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
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData,
        PLATFORMS.STATSIG
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData2,
        PLATFORMS.STATSIG
      );
    });
  });

  it('Feedback on initial message has no API call, Feedback on actual assistant messages does', async () => {
    renderDefault();

    //clicking feedback on the inital dummy message doesn't log or call api
    const thumbsUpBtn = screen.getByRole('button', {
      name: i18n.aiDifferentiationThumbsUp(),
    });
    fireEvent.click(thumbsUpBtn);
    expect(postStub).not.toHaveBeenCalled();

    //click a suggested prompt
    const prompt = screen.getByRole('button', {name: 'Explain a concept'});
    fireEvent.click(prompt);

    const responseEventData = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.USER,
      isPreset: true,
      text: 'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
      threadId: 3,
      url: window.location.href,
    };
    const responseEventData2 = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.ASSISTANT,
      isPreset: true,
      text: "Beep boop I'm a bot",
      threadId: 3,
      url: window.location.href,
    };
    const feedbackEventData = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      thumbsUp: true,
      thumbsDown: false,
      flagged: false,
      text: "Beep boop I'm a bot",
      messageId: 42,
    };

    //sends the api call then logs the suggested prompt and the bot message
    await waitFor(() => {
      expect(postStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        JSON.stringify({
          inputText: responseEventData.text,
          isPreset: true,
          presetChipText: 'Explain a concept',
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
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData,
        PLATFORMS.STATSIG
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData2,
        PLATFORMS.STATSIG
      );
    });

    jest.clearAllMocks();

    //bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent("Beep boop I'm a bot");

    //click thumbs up for actual chat message
    const thumbsUpBtn2 = screen.getAllByRole('button', {
      name: i18n.aiDifferentiationThumbsUp(),
    })[1];
    fireEvent.click(thumbsUpBtn2);

    await waitFor(() => {
      expect(postStub).toHaveBeenCalled();
      expect(postStub).toHaveBeenCalledWith(
        '/aidiff_messages/42/submit_feedback',
        JSON.stringify({
          approval: true,
          flagged: false,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_FEEDBACK_EVENT,
        feedbackEventData,
        PLATFORMS.STATSIG
      );
    });
  });

  it('Typing a message shows in chat, then gets a response', async () => {
    renderDefault();
    const userMessage = 'Hello this is a user message';
    const textbox = screen.getByRole('textbox');
    const submit_btn = screen.getByRole('button', {name: i18n.submit()});

    //submit button not enabled until there is user text
    expect(submit_btn).not.toBeEnabled();
    fireEvent.change(textbox, {target: {value: userMessage}});
    expect(submit_btn).toBeEnabled();
    fireEvent.click(submit_btn);

    //After click, but before server response, user message editor should be disabled
    expect(submit_btn).not.toBeEnabled();
    expect(textbox).not.toBeEnabled();

    const responseEventData = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.USER,
      isPreset: false,
      text: userMessage,
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };
    const responseEventData2 = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.ASSISTANT,
      isPreset: false,
      text: "Beep boop I'm a bot",
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };

    //sends the api call then logs the user message and the bot message
    await waitFor(() => {
      expect(postStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        JSON.stringify({
          inputText: responseEventData.text,
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
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData,
        PLATFORMS.STATSIG
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData2,
        PLATFORMS.STATSIG
      );
    });
    //one user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      userMessage
    );
    //second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    //User message editor should be enabled once we have a server response
    expect(submit_btn).not.toBeEnabled();
  });

  it('Provided message history is displayed, typing message calls chat_completion with thread id', async () => {
    const threadId = 3;
    const overrideThreadMessages = [
      {
        role: 'user',
        chatMessageText: 'hello help please',
        status: Status.OK,
        id: 0,
      },
      {
        role: 'assistant',
        chatMessageText: 'beep boop',
        status: Status.OK,
        id: 1,
      },
    ];
    renderDefault(threadId, overrideThreadMessages);
    const userMessage = 'Hello this is a user message';
    const textbox = screen.getByRole('textbox');
    const submit_btn = screen.getByRole('button', {name: i18n.submit()});

    //should display only the provided messages, not the default initial msg and prompts
    expect(screen.queryByRole('group', {name: 'Suggested Prompts'})).toBeNull();
    const bot_messages = screen.getAllByLabelText(i18n.aiChatMessageBot());
    expect(bot_messages).toHaveLength(1);
    expect(bot_messages[0]).toHaveTextContent('beep boop');
    const user_messages = screen.getAllByLabelText(i18n.aiChatMessageUser());
    expect(user_messages).toHaveLength(1);
    expect(user_messages[0]).toHaveTextContent('hello help please');

    //submit button not enabled until there is user text
    expect(submit_btn).not.toBeEnabled();
    fireEvent.change(textbox, {target: {value: userMessage}});
    expect(submit_btn).toBeEnabled();
    fireEvent.click(submit_btn);

    //After click, but before server response, user message editor should be disabled
    expect(submit_btn).not.toBeEnabled();
    expect(textbox).not.toBeEnabled();

    const responseEventData = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.USER,
      isPreset: false,
      text: userMessage,
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };
    const responseEventData2 = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.ASSISTANT,
      isPreset: false,
      text: "Beep boop I'm a bot",
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };

    //sends the api call then logs the user message and the bot message
    await waitFor(() => {
      expect(postStub).toHaveBeenCalledWith(
        `/aidiff_threads/${threadId}/chat_completion`,
        JSON.stringify({
          inputText: responseEventData.text,
          isPreset: false,
          presetChipText: null,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData,
        PLATFORMS.STATSIG
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData2,
        PLATFORMS.STATSIG
      );
    });
    //two user message
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageUser())[1]
    ).toHaveTextContent(userMessage);
    //second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    //User message editor should not be enabled once we have a server response
    expect(submit_btn).not.toBeEnabled();
  });

  it('Selecting a prompt does nothing if there are more recent messages', async () => {
    renderDefault();
    const userMessage = 'Hello this is a user message';
    const textbox = screen.getByRole('textbox');
    const submit_btn = screen.getByRole('button', {name: i18n.submit()});
    //submit button not enabled until there is user text
    expect(submit_btn).not.toBeEnabled();
    fireEvent.change(textbox, {target: {value: userMessage}});
    expect(submit_btn).toBeEnabled();
    fireEvent.click(submit_btn);

    const responseEventData = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.USER,
      isPreset: false,
      text: userMessage,
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };
    const responseEventData2 = {
      chatContext: {
        type: AiDiffContext.LESSON,
        lessonId: 2,
      },
      scriptName: 'test_lesson',
      role: Role.ASSISTANT,
      isPreset: false,
      text: "Beep boop I'm a bot",
      threadId: defaultChatResponse.thread_id,
      url: window.location.href,
    };
    await waitFor(() => {
      expect(postStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        JSON.stringify({
          inputText: responseEventData.text,
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
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData,
        PLATFORMS.STATSIG
      );
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.AI_DIFF_CHAT_EVENT,
        responseEventData2,
        PLATFORMS.STATSIG
      );
    });
    //one user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      userMessage
    );
    //second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    //Try to click an old suggested prompt
    const prompt = screen.getByRole('button', {name: 'Explain a concept'});
    //reset spies so we can check it hasn't been called again
    jest.clearAllMocks();
    fireEvent.click(prompt);
    expect(postStub).not.toHaveBeenCalled();
    expect(sendEventSpy).not.toHaveBeenCalled();
  });

  it('Suggest prompt button is present and works', () => {
    renderDefault();
    const suggestedPromptsGroup = screen.getByRole('group', {
      name: 'Suggested Prompts',
    });
    expect(within(suggestedPromptsGroup).getAllByRole('button')).toHaveLength(
      5
    );
    const suggest_prompt = screen.getByRole('button', {
      name: i18n.aiDifferentiation_suggest_prompt(),
    });
    fireEvent.click(suggest_prompt);
    const getStartedButton = screen.getByRole('button', {
      name: /Get Started/i,
    });
    fireEvent.click(getStartedButton);

    // Re-query the group after new prompts are added
    const updatedGroup1 = screen.getByRole('group', {
      name: 'Suggested Prompts',
    });
    expect(within(updatedGroup1).getAllByRole('button')).toHaveLength(10);
    // Check the last new prompt is from the second set.
    expect(
      within(updatedGroup1).getAllByRole('button').pop()
    ).toHaveAccessibleName('Get help using Code.org');

    fireEvent.click(suggest_prompt);
    const createButton = screen.getByRole('button', {name: /Create/i});
    fireEvent.click(createButton);

    // Re-query the group again after more prompts are added
    const updatedGroup2 = screen.getByRole('group', {
      name: 'Suggested Prompts',
    });
    expect(within(updatedGroup2).getAllByRole('button')).toHaveLength(15);
    // Check the last new prompt is from the first set.
    expect(
      within(updatedGroup2).getAllByRole('button').pop()
    ).toHaveAccessibleName('Write a lesson hook');
  });
});
