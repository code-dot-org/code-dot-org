import {render, screen, fireEvent, waitFor} from '@testing-library/react';
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
    });
    store.dispatch(
      setInitialData({
        id: 1,
        name: 'test_user',
      })
    );

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
    //suggested prompts
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    screen.getByRole('checkbox', {name: 'Give me an example'});
    screen.getByRole('checkbox', {name: 'Explain a concept'});
    screen.getByRole('checkbox', {name: 'Debug common mistakes'});
    screen.getByRole('checkbox', {name: 'Generate a mini lesson'});
    screen.getByRole('checkbox', {name: 'Write an exit ticket'});
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
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    screen.getByRole('checkbox', {name: 'Give me an example'});
    screen.getByRole('checkbox', {name: 'Explain a concept'});
    screen.getByRole('checkbox', {name: 'Debug common mistakes'});
    screen.getByRole('checkbox', {name: 'Generate a mini lesson'});
    screen.getByRole('checkbox', {name: 'Write an exit ticket'});
    screen.getByRole('checkbox', {name: 'Create task support'});
    screen.getByRole('checkbox', {name: 'AP exam support'});
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
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    screen.getByRole('checkbox', {name: 'Suggest a curriculum'});
    screen.getByRole('checkbox', {name: 'Get started with Code.org'});
    screen.getByRole('checkbox', {name: 'Learn about Professional Learning'});
    screen.getByRole('checkbox', {name: 'How to create a section?'});
    screen.getByRole('checkbox', {name: 'Get help using Code.org'});
  });

  it('Selecting a suggested prompt gives response', async () => {
    renderDefault();

    //click a suggested prompt
    const prompt = screen.getByRole('checkbox', {name: 'Explain a concept'});
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

    //sends the api call then logs the suggested prompt and the bot message
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

    //bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent("Beep boop I'm a bot");
  });

  it('Selecting a 2-stage APCSP suggested prompt gives response and second set of prompts', async () => {
    const overrideProps = {
      ...defaultProps,
      curriculumCourses: ['csp-year', 'csp'],
    };
    renderDefault(overrideProps);

    //click a suggested prompt
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    const prompt = screen.getByRole('checkbox', {name: 'Create task support'});
    fireEvent.click(prompt);

    //bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent(
      'Let’s chat about the Create Task! Here are some ideas you can ask me, or type your question below'
    );

    //second set of suggested prompts
    expect(screen.getAllByRole('checkbox')).toHaveLength(13);
    screen.getByRole('checkbox', {name: 'Create Performance Task samples'});
    screen.getByRole('checkbox', {
      name: 'Can teachers review student submissions?',
    });
    screen.getByRole('checkbox', {
      name: 'Student collaboration on the Create Task',
    });
    screen.getByRole('checkbox', {name: 'AI Tools on the Create Task'});
    screen.getByRole('checkbox', {name: 'Can I grade the Create Task'});
    screen.getByRole('checkbox', {
      name: 'Resources to prepare for written responses',
    });

    //click a second step suggested prompt
    const prompt2 = screen.getByRole('checkbox', {
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

    //clicking feedback on the inital dummy message doesn't log or call api
    const thumbsUpBtn = screen.getByRole('button', {
      name: i18n.aiDifferentiationThumbsUp(),
    });
    fireEvent.click(thumbsUpBtn);
    expect(fetchStub).not.toHaveBeenCalled();

    //click a suggested prompt
    const prompt = screen.getByRole('checkbox', {name: 'Explain a concept'});
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

    //bot message should show in the chat
    const message = screen.getAllByLabelText(i18n.aiChatMessageBot())[1];
    expect(message).toHaveTextContent("Beep boop I'm a bot");

    //click thumbs up for actual chat message
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

    //sends the api call then logs the user message and the bot message
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
    //one user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      userMessage
    );
    //second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    //Try to click an old suggested prompt
    const prompt = screen.getByRole('checkbox', {name: 'Explain a concept'});
    //reset spies so we can check it hasn't been called again
    jest.clearAllMocks();
    fireEvent.click(prompt);
    expect(fetchStub).not.toHaveBeenCalled();
    expect(sendEventSpy).not.toHaveBeenCalled();
  });

  it('Suggest prompt button is present and works', () => {
    renderDefault();
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    const suggest_prompt = screen.getByRole('button', {
      name: i18n.aiDifferentiation_suggest_prompt(),
    });
    fireEvent.click(suggest_prompt);
    expect(screen.getAllByRole('checkbox')).toHaveLength(10);
    // Check the last new prompt is from the second set.
    expect(screen.getAllByRole('checkbox').pop()).toHaveAccessibleName(
      'Real world connection'
    );
    fireEvent.click(suggest_prompt);
    expect(screen.getAllByRole('checkbox')).toHaveLength(15);
    // Check the last new prompt is from the first set.
    expect(screen.getAllByRole('checkbox').pop()).toHaveAccessibleName(
      'Write an exit ticket'
    );
  });
});
