import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiDiffChat from '@cdo/apps/aiDifferentiation/AiDiffChat';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore, registerReducers} from '@cdo/apps/redux';
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

describe('AiDiffChat', () => {
  let fetchStub;
  let sendEventSpy;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
    fetchStub = jest
      .spyOn(HttpClient, 'post')
      .mockResolvedValue(
        Promise.resolve(new Response(JSON.stringify(defaultChatResponse)))
      );

    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  function renderDefault(propOverrides = {}) {
    const store = getStore();

    registerReducers({
      currentUser,
      teacherSections,
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
      })
    );
    store.dispatch(setSections([]));

    render(
      <Provider store={store}>
        <AiDiffChat {...defaultProps} {...propOverrides} />
      </Provider>
    );
  }

  it('initial message and suggested prompts are rendered', () => {
    renderDefault();
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    // Suggested prompts
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

  it('initial message and suggested prompts are rendered, APCSP prompts included if csp in context', () => {
    const overrideProps = {
      ...defaultProps,
      curriculumCourses: ['csp-year', 'csp'],
    };
    renderDefault(overrideProps);
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    //suggested prompts
    screen.getByRole('button', {name: 'Give me an example'});
    screen.getByRole('button', {name: 'Explain a concept'});
    screen.getByRole('button', {name: 'Debug common mistakes'});
    screen.getByRole('button', {name: 'Generate a mini lesson'});
    screen.getByRole('button', {name: 'Write an exit ticket'});
    screen.getByRole('button', {name: 'Create task support'});
    screen.getByRole('button', {name: 'AP exam support'});
  });

  it('initial message and suggested prompts are rendered for general context', () => {
    const overrideProps = {
      ...defaultProps,
      context: {type: AiDiffContext.GENERAL},
    };
    renderDefault(overrideProps);
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    //suggested prompts
    screen.getByRole('button', {name: 'Suggest a curriculum'});
    screen.getByRole('button', {name: 'Get started with Code.org'});
    screen.getByRole('button', {name: 'Learn about Professional Learning'});
    screen.getByRole('button', {name: 'How to create a section?'});
    screen.getByRole('button', {name: 'Get help using Code.org'});
  });

  it('Selecting a suggested prompt gives response', async () => {
    renderDefault();

    // Click a suggested prompt
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

    // Sends the api call then logs the suggested prompt and the bot message
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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

    // Bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent("Beep boop I'm a bot");
  });

  it('Selecting a 2-stage APCSP suggested prompt gives response and second set of prompts', async () => {
    const overrideProps = {
      ...defaultProps,
      curriculumCourses: ['csp-year', 'csp'],
    };
    renderDefault(overrideProps);

    // Click a suggested prompt
    const suggestedPromptsGroup = screen.getByRole('group', {
      name: 'Suggested Prompts',
    });
    expect(within(suggestedPromptsGroup).getAllByRole('button')).toHaveLength(
      7
    );
    const prompt = screen.getByRole('button', {name: 'Create task support'});
    fireEvent.click(prompt);

    // Bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent(
      'Let’s chat about the Create Task! Here are some ideas you can ask me, or type your question below'
    );

    // Second set of suggested prompts
    // Count buttons across all groups after new prompts are added
    const allGroups = screen.getAllByRole('group', {
      name: 'Suggested Prompts',
    });
    const totalButtons = allGroups.flatMap(group =>
      within(group).getAllByRole('button')
    );
    expect(totalButtons).toHaveLength(13);
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

    // Click a second step suggested prompt
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

    // Sends the api call then logs the suggested prompt and the bot message
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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

    // Clicking feedback on the inital dummy message doesn't log or call api
    const thumbsUpBtn = screen.getByRole('button', {
      name: i18n.aiDifferentiationThumbsUp(),
    });
    fireEvent.click(thumbsUpBtn);
    expect(fetchStub).not.toHaveBeenCalled();

    // Click a suggested prompt
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

    // Sends the api call then logs the suggested prompt and the bot message
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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

    // Bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent("Beep boop I'm a bot");

    // Click thumbs up for actual chat message
    const thumbsUpBtn2 = screen.getAllByRole('button', {
      name: i18n.aiDifferentiationThumbsUp(),
    })[1];
    fireEvent.click(thumbsUpBtn2);

    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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

    // Submit button not enabled until there is user text
    expect(submit_btn).not.toBeEnabled();
    fireEvent.change(textbox, {target: {value: userMessage}});
    expect(submit_btn).toBeEnabled();
    fireEvent.click(submit_btn);

    // After click, but before server response, user message editor should be disabled
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
      isPreset: false,
      text: "Beep boop I'm a bot",
      threadId: 3,
      url: window.location.href,
    };

    // Sends the api call then logs the user message and the bot message
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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
    // One user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      userMessage
    );
    // Second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    // User message editor should be enabled once we have a server response
    expect(submit_btn).not.toBeEnabled();
  });

  it('Provided message history is displayed, typing message calls chat_completion with thread id', async () => {
    const overrideProps = {
      ...defaultProps,
      threadId: 3,
      threadMessages: [
        {
          role: 'user',
          chatMessageText: 'hello help please',
          status: Status.OK,
          id: 5,
        },
        {
          role: 'assistant',
          chatMessageText: 'beep boop',
          status: Status.OK,
          id: 6,
        },
      ],
    };
    renderDefault(overrideProps);
    const userMessage = 'Hello this is a user message';
    const textbox = screen.getByRole('textbox');
    const submit_btn = screen.getByRole('button', {name: i18n.submit()});

    // Should display only the provided messages, not the default initial msg and prompts
    expect(screen.queryByRole('group', {name: 'Suggested Prompts'})).toBeNull();
    const bot_messages = screen.getAllByLabelText(i18n.aiChatMessageBot());
    expect(bot_messages).toHaveLength(1);
    expect(bot_messages[0]).toHaveTextContent('beep boop');
    const user_messages = screen.getAllByLabelText(i18n.aiChatMessageUser());
    expect(user_messages).toHaveLength(1);
    expect(user_messages[0]).toHaveTextContent('hello help please');

    // Submit button not enabled until there is user text
    expect(submit_btn).not.toBeEnabled();
    fireEvent.change(textbox, {target: {value: userMessage}});
    expect(submit_btn).toBeEnabled();
    fireEvent.click(submit_btn);

    // After click, but before server response, user message editor should be disabled
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
      isPreset: false,
      text: "Beep boop I'm a bot",
      threadId: 3,
      url: window.location.href,
    };

    // Sends the api call then logs the user message and the bot message
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads/3/chat_completion',
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
    // Two user message
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageUser())[1]
    ).toHaveTextContent(userMessage);
    // Second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    // User message editor should not be enabled once we have a server response
    expect(submit_btn).not.toBeEnabled();
  });

  it('Selecting a prompt does nothing if there are more recent messages', async () => {
    renderDefault();
    const userMessage = 'Hello this is a user message';
    const textbox = screen.getByRole('textbox');
    const submit_btn = screen.getByRole('button', {name: i18n.submit()});
    // Submit button not enabled until there is user text
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
      isPreset: false,
      text: "Beep boop I'm a bot",
      threadId: 3,
      url: window.location.href,
    };
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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
    // One user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      userMessage
    );
    // Second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    // Try to click an old suggested prompt
    const prompt = screen.getByRole('button', {name: 'Explain a concept'});
    // Reset spies so we can check it hasn't been called again
    jest.clearAllMocks();
    fireEvent.click(prompt);
    expect(fetchStub).not.toHaveBeenCalled();
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

    // Count buttons across all groups after new prompts are added
    const allGroups1 = screen.getAllByRole('group', {
      name: 'Suggested Prompts',
    });
    const totalButtons1 = allGroups1.flatMap(group =>
      within(group).getAllByRole('button')
    );
    expect(totalButtons1).toHaveLength(10);
    // Check the last new prompt is from the second set.
    expect(totalButtons1.pop()).toHaveAccessibleName('Get help using Code.org');

    fireEvent.click(suggest_prompt);
    const createButtons = screen.getAllByRole('button', {name: /Create/i});
    fireEvent.click(createButtons[0]);

    // Count buttons across all groups after more prompts are added
    const allGroups2 = screen.getAllByRole('group', {
      name: 'Suggested Prompts',
    });
    const totalButtons2 = allGroups2.flatMap(group =>
      within(group).getAllByRole('button')
    );
    expect(totalButtons2).toHaveLength(15);
    // Check the last new prompt is from the first set.
    expect(totalButtons2.pop()).toHaveAccessibleName('Write a lesson hook');
  });
});
