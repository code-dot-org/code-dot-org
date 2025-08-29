import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import AiDiffWorkspace from '@cdo/apps/aiDifferentiation/AiDiffWorkspace';
import {
  chatThreadMessagesValidator,
  chatThreadValidator,
} from '@cdo/apps/aiDifferentiation/types';
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
  open: true,
  context: {
    type: AiDiffContext.LESSON,
    lessonId: 2,
  },
  scriptName: 'test_lesson',
  curriculumCourses: [],
};

const now = new Date();
const sixDaysAgo = new Date(now);
sixDaysAgo.setDate(now.getDate() - 7);
const tenDaysAgo = new Date(now);
tenDaysAgo.setDate(now.getDate() - 10);

const defaultThreadListResponse = [
  {
    id: 1,
    title: 'blah thread one',
    updatedAt: now,
    contextType: 'lesson',
  },
  {
    id: 2,
    title: 'blah thread two',
    updatedAt: sixDaysAgo,
    contextType: 'unit',
  },
  {
    id: 3,
    title: 'blah thread three',
    updatedAt: tenDaysAgo,
    contextType: 'course',
  },
];

const defaultThreadMessagesResponse = {
  id: 2,
  title: 'blah thread two',
  updatedAt: new Date(new Date().getDate() - 6),
  contextType: 'unit',
  messages: [
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
    {
      role: 'user',
      chatMessageText: 'hello help again',
      status: Status.OK,
      id: 7,
    },
    {
      role: 'assistant',
      chatMessageText: 'modem noises',
      status: Status.OK,
      id: 8,
    },
  ],
};

const defaultChatResponse = {
  chat_message_text: "Beep boop I'm a bot",
  status: Status.OK,
  thread_id: 3,
  message_id: 42,
};

describe('AiDiffWorkspace', () => {
  let fetchJsonStub;
  let fetchStub;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();

    fetchJsonStub = jest.fn();
    HttpClient.fetchJson = fetchJsonStub;
    fetchStub = jest.spyOn(HttpClient, 'post').mockResolvedValue({
      json: jest.fn(() => defaultChatResponse),
    });
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
        <AiDiffWorkspace {...defaultProps} {...propOverrides} />
      </Provider>
    );
  }

  it('Shows thread list in sidebar, starts with new thread messages and prompts', async () => {
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
    renderDefault();

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });

    //threads in sidebar are fetched and displayed
    screen.getByText('blah thread one');
    screen.getByText('blah thread two');
    screen.getByText('blah thread three');

    //initial message and prompts in (new) chat are displayed
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

  it('Click on thread shows thread messages', async () => {
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
    renderDefault();

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });

    screen.getByText('blah thread one');
    const thread = screen.getByText('blah thread two');
    screen.getByText('blah thread three');

    fetchJsonStub.mockClear();

    fetchJsonStub.mockResolvedValue({
      value: defaultThreadMessagesResponse,
      response: new Response(),
    });

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

    fireEvent.click(thread);

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads/2',
        {},
        chatThreadMessagesValidator
      );
    });

    //no prompt checkboxes, now shows thread messages
    expect(screen.queryByRole('checkbox')).toBeNull();

    const bot_messages = screen.getAllByLabelText(i18n.aiChatMessageBot());
    expect(bot_messages).toHaveLength(2);
    expect(bot_messages[0]).toHaveTextContent('beep boop');
    expect(bot_messages[1]).toHaveTextContent('modem noises');

    const user_messages = screen.getAllByLabelText(i18n.aiChatMessageUser());
    expect(user_messages).toHaveLength(2);
    expect(user_messages[0]).toHaveTextContent('hello help please');
    expect(user_messages[1]).toHaveTextContent('hello help again');
  });

  it('Show old thread, add message', async () => {
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
    renderDefault();

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });

    screen.getByText('blah thread one');
    const thread = screen.getByText('blah thread two');
    screen.getByText('blah thread three');

    fetchJsonStub.mockClear();

    fetchJsonStub.mockResolvedValue({
      value: defaultThreadMessagesResponse,
      response: new Response(),
    });

    fireEvent.click(thread);

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads/2',
        {},
        chatThreadMessagesValidator
      );
    });

    const submit_btn = screen.getByRole('button', {name: i18n.submit()});
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, {target: {value: 'new message on old thread'}});
    fireEvent.click(submit_btn);

    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads/2/chat_completion',
        JSON.stringify({
          inputText: 'new message on old thread',
          isPreset: false,
          presetChipText: null,
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      );
    });

    const bot_messages = screen.getAllByLabelText(i18n.aiChatMessageBot());
    expect(bot_messages).toHaveLength(3);
    expect(bot_messages[0]).toHaveTextContent('beep boop');
    expect(bot_messages[1]).toHaveTextContent('modem noises');
    expect(bot_messages[2]).toHaveTextContent("Beep boop I'm a bot");

    const user_messages = screen.getAllByLabelText(i18n.aiChatMessageUser());
    expect(user_messages).toHaveLength(3);
    expect(user_messages[0]).toHaveTextContent('hello help please');
    expect(user_messages[1]).toHaveTextContent('hello help again');
    expect(user_messages[2]).toHaveTextContent('new message on old thread');
  });

  it('Start new thread from old thread', async () => {
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
    renderDefault();

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });

    screen.getByText('blah thread one');
    const thread = screen.getByText('blah thread two');
    screen.getByText('blah thread three');

    fetchJsonStub.mockClear();

    fetchJsonStub.mockResolvedValue({
      value: defaultThreadMessagesResponse,
      response: new Response(),
    });

    fireEvent.click(thread);

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads/2',
        {},
        chatThreadMessagesValidator
      );
    });

    expect(screen.queryByRole('checkbox')).toBeNull();

    const bot_messages = screen.getAllByLabelText(i18n.aiChatMessageBot());
    expect(bot_messages).toHaveLength(2);
    expect(bot_messages[0]).toHaveTextContent('beep boop');
    expect(bot_messages[1]).toHaveTextContent('modem noises');

    const user_messages = screen.getAllByLabelText(i18n.aiChatMessageUser());
    expect(user_messages).toHaveLength(2);
    expect(user_messages[0]).toHaveTextContent('hello help please');
    expect(user_messages[1]).toHaveTextContent('hello help again');

    //click button for a new chat
    const new_thread_btn = screen.getByRole('button', {
      name: i18n.aiDifferentiation_new_chat(),
    });
    fireEvent.click(new_thread_btn);

    //initial messages for a new thread
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    //suggested prompts
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);

    fetchJsonStub.mockClear();
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });

    const submit_btn = screen.getByRole('button', {name: i18n.submit()});
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, {target: {value: 'starting new thread'}});
    fireEvent.click(submit_btn);

    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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
      // callback to refresh thread list
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });

    //one user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      'starting new thread'
    );
    //second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");
  });

  it('Start new thread from new thread', async () => {
    fetchJsonStub.mockResolvedValue({
      value: defaultThreadListResponse,
      response: new Response(),
    });
    renderDefault();

    await waitFor(() => {
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });

    screen.getByText('blah thread one');
    screen.getByText('blah thread two');
    screen.getByText('blah thread three');

    //initial messages
    const message = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    //suggested prompts
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);

    fetchJsonStub.mockClear();

    const submit_btn = screen.getByRole('button', {name: i18n.submit()});
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, {target: {value: 'starting new thread'}});
    fireEvent.click(submit_btn);

    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
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
      // callback to refresh thread list
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });
    //one user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      'starting new thread'
    );
    //second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");

    //click button for a new chat
    const new_thread_btn = screen.getByRole('button', {
      name: i18n.aiDifferentiation_new_chat(),
    });
    fireEvent.click(new_thread_btn);

    //initial messages for a new thread
    const message2 = screen.getByLabelText(i18n.aiChatMessageBot());
    expect(message2).toHaveTextContent(
      "Hi! I'm your AI Teaching Assistant. What can I help you with? Here are some things you can ask me."
    );
    //suggested prompts
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    //should have 0 user messages because it's a new thread
    expect(screen.queryByLabelText(i18n.aiChatMessageUser())).toBeNull();

    fetchJsonStub.mockClear();
    fetchStub.mockClear();

    const submit_btn2 = screen.getByRole('button', {name: i18n.submit()});
    const textbox2 = screen.getByRole('textbox');
    fireEvent.change(textbox2, {target: {value: 'starting 2nd thread'}});
    fireEvent.click(submit_btn2);

    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        JSON.stringify({
          inputText: 'starting 2nd thread',
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
      // callback to refresh thread list
      expect(fetchJsonStub).toHaveBeenCalledTimes(1);
      expect(fetchJsonStub).toHaveBeenCalledWith(
        '/aidiff_threads',
        {},
        chatThreadValidator
      );
    });
    // one user message
    expect(screen.getByLabelText(i18n.aiChatMessageUser())).toHaveTextContent(
      'starting 2nd thread'
    );
    //second bot message has the response
    expect(
      screen.getAllByLabelText(i18n.aiChatMessageBot())[1]
    ).toHaveTextContent("Beep boop I'm a bot");
  });
});
