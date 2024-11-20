import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiDiffContainer from '@cdo/apps/aiDifferentiation/AiDiffContainer';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';
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
  lessonId: 2,
  lessonName: 'test_lesson',
  unitDisplayName: 'test unit name',
};

const defaultChatResponse = {
  chat_message_text: "Beep boop I'm a bot",
  status: Status.OK,
  session_id: '123abc',
};

describe('AiDiffContainer', () => {
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

  it('visible when open', () => {
    render(<AiDiffContainer {...defaultProps} />);
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('moves rubric container when user clicks and drags component', () => {
    const {getByTestId} = render(<AiDiffContainer {...defaultProps} />);
    const handle_element = screen.getByText('AI Teaching Assistant');
    const element = getByTestId('draggable-test-id');

    const initialPosition = element.style.transform;

    // simulate dragging
    fireEvent.mouseDown(handle_element, {clientX: 0, clientY: 0});
    fireEvent.mouseMove(handle_element, {clientX: 100, clientY: 100});
    fireEvent.mouseUp(handle_element);

    const newPosition = element.style.transform;

    expect(newPosition).not.toEqual(initialPosition);
  });

  it('initial message and suggested prompts are rendered', () => {
    render(<AiDiffContainer {...defaultProps} />);
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    //suggested prompts
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    screen.getByRole('checkbox', {name: 'Explain a concept'});
    screen.getByRole('checkbox', {
      name: 'Give an example to use with my class',
    });
    screen.getByRole('checkbox', {
      name: 'Write an extension activity for students who finish early',
    });
    screen.getByRole('checkbox', {
      name: 'Write an extension activity for students who need extra practice',
    });
  });

  it('Selecting a suggested prompt gives response', async () => {
    render(<AiDiffContainer {...defaultProps} />);

    //click a suggested prompt
    const prompt = screen.getByRole('checkbox', {name: 'Explain a concept'});
    fireEvent.click(prompt);

    const responseEventData = {
      lessonId: 2,
      lessonName: 'test_lesson',
      unitName: 'test unit name',
      role: Role.USER,
      isPreset: true,
      text: 'I need an explanation of a concept. You can ask me a follow-up question to find out what concept needs to be explained.',
      sessionId: '123abc',
    };
    const responseEventData2 = {
      lessonId: 2,
      lessonName: 'test_lesson',
      unitName: 'test unit name',
      role: Role.ASSISTANT,
      isPreset: true,
      text: "Beep boop I'm a bot",
      sessionId: '123abc',
    };

    //sends the api call then logs the suggested prompt and the bot message
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/ai_diff/chat_completion',
        JSON.stringify({
          inputText: responseEventData.text,
          lessonId: responseEventData.lessonId,
          unitDisplayName: responseEventData.unitName,
          sessionId: null,
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

  it('Typing a message shows in chat, then gets a response', async () => {
    render(<AiDiffContainer {...defaultProps} />);
    const userMessage = 'Hello this is a user message';
    const textbox = screen.getByRole('textbox');
    const submit_btn = screen.getByRole('button', {name: i18n.submit()});

    //submit button not enabled until there is user text
    expect(submit_btn).not.toBeEnabled();
    fireEvent.change(textbox, {target: {value: userMessage}});
    expect(submit_btn).toBeEnabled();
    fireEvent.click(submit_btn);

    const responseEventData = {
      lessonId: 2,
      lessonName: 'test_lesson',
      unitName: 'test unit name',
      role: Role.USER,
      isPreset: false,
      text: userMessage,
      sessionId: '123abc',
    };
    const responseEventData2 = {
      lessonId: 2,
      lessonName: 'test_lesson',
      unitName: 'test unit name',
      role: Role.ASSISTANT,
      isPreset: false,
      text: "Beep boop I'm a bot",
      sessionId: '123abc',
    };

    //sends the api call then logs the user message and the bot message
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/ai_diff/chat_completion',
        JSON.stringify({
          inputText: responseEventData.text,
          lessonId: responseEventData.lessonId,
          unitDisplayName: responseEventData.unitName,
          sessionId: null,
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
  });

  it('Selecting a prompt does nothing if there are more recent messages', async () => {
    render(<AiDiffContainer {...defaultProps} />);
    const userMessage = 'Hello this is a user message';
    const textbox = screen.getByRole('textbox');
    const submit_btn = screen.getByRole('button', {name: i18n.submit()});
    //submit button not enabled until there is user text
    expect(submit_btn).not.toBeEnabled();
    fireEvent.change(textbox, {target: {value: userMessage}});
    expect(submit_btn).toBeEnabled();
    fireEvent.click(submit_btn);

    const responseEventData = {
      lessonId: 2,
      lessonName: 'test_lesson',
      unitName: 'test unit name',
      role: Role.USER,
      isPreset: false,
      text: userMessage,
      sessionId: '123abc',
    };
    const responseEventData2 = {
      lessonId: 2,
      lessonName: 'test_lesson',
      unitName: 'test unit name',
      role: Role.ASSISTANT,
      isPreset: false,
      text: "Beep boop I'm a bot",
      sessionId: '123abc',
    };
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/ai_diff/chat_completion',
        JSON.stringify({
          inputText: responseEventData.text,
          lessonId: responseEventData.lessonId,
          unitDisplayName: responseEventData.unitName,
          sessionId: null,
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
    render(<AiDiffContainer {...defaultProps} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    const suggest_prompt = screen.getByRole('button', {
      name: i18n.aiDifferentiation_suggest_prompt(),
    });
    fireEvent.click(suggest_prompt);
    expect(screen.getAllByRole('checkbox')).toHaveLength(8);
  });
});
