import {
  weblab2Adapter,
  workFromBuild,
} from '@cdo/apps/adaptive/ai/validation/weblab2';
import {AcceptedBuild, ChatHandle} from '@cdo/apps/aichat/host/ChatHostContext';

jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({
    getState: () => ({
      lab2Project: {projectSources: {source: '<h1>Bakery</h1>'}},
    }),
  }),
}));

const file = (name: string, contents: string) => ({
  id: name,
  name,
  contents,
  folderId: '0',
});

describe('workFromBuild', () => {
  it('describes the built files as the change, the way the project is, and the exchange as the process', () => {
    const build: AcceptedBuild = {
      at: 7,
      files: [file('index.html', '<h1>Hi</h1>'), file('style.css', 'h1 {}')],
      transcript: 'Student: Add a heading',
    };
    const work = workFromBuild(build);
    expect(work.at).toBe(7);
    expect(work.process).toBe('Student: Add a heading');
    expect(work.change).toContain('filename: index.html');
    expect(work.change).toContain('<h1>Hi</h1>');
    expect(work.change).toContain('filename: style.css');
    expect(work.change).toContain('h1 {}');
  });
});

describe('weblab2Adapter', () => {
  it('reports each accepted build as work and unsubscribes with the chat', () => {
    let listener: ((build: AcceptedBuild) => void) | undefined;
    const unsubscribe = jest.fn();
    const chat: ChatHandle = {
      post: jest.fn(),
      onBuildAccepted: jest.fn(l => {
        listener = l;
        return unsubscribe;
      }),
      disableSend: jest.fn(),
      enableSend: jest.fn(),
    };
    const work = jest.fn();

    const off = weblab2Adapter.observeWork({chat}, work);
    listener!({
      at: 3,
      files: [file('a.html', '<p/>')],
      transcript: 'Student: hi',
    });
    off();

    expect(work).toHaveBeenCalledWith({
      at: 3,
      change: expect.stringContaining('filename: a.html'),
      process: 'Student: hi',
      project: '<h1>Bakery</h1>',
    });
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('does nothing without a chat', () => {
    const work = jest.fn();
    expect(weblab2Adapter.observeWork({}, work)).toEqual(expect.any(Function));
    expect(work).not.toHaveBeenCalled();
    weblab2Adapter.reportAttempt?.(
      {},
      {pass: true, evidenceLevel: 1, reason: 'Fine.'}
    );
  });

  it('says a check is running and stops sending, until the caller takes that back', () => {
    const dismiss = jest.fn();
    const chat: ChatHandle = {
      post: jest.fn(() => dismiss),
      onBuildAccepted: jest.fn(),
      disableSend: jest.fn(),
      enableSend: jest.fn(),
    };
    const done = weblab2Adapter.notifyChecking!({chat});
    expect(chat.post).toHaveBeenCalledWith({
      notificationType: 'info',
      includeInChatHistory: false,
      hideTimestamp: true,
      text: 'Checking your work...',
    });
    expect(chat.disableSend).toHaveBeenCalledTimes(1);
    expect(dismiss).not.toHaveBeenCalled();
    expect(chat.enableSend).not.toHaveBeenCalled();

    done();
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(chat.enableSend).toHaveBeenCalledTimes(1);
    expect(weblab2Adapter.notifyChecking?.({})).toEqual(expect.any(Function));
  });

  it('reports a verdict as a success or warning alert, kept in the history', () => {
    const chat: ChatHandle = {
      post: jest.fn(),
      onBuildAccepted: jest.fn(),
      disableSend: jest.fn(),
      enableSend: jest.fn(),
    };
    weblab2Adapter.reportAttempt?.(
      {chat},
      {pass: true, evidenceLevel: 2, reason: 'Success! Nice heading.'}
    );
    weblab2Adapter.reportAttempt?.(
      {chat},
      {pass: false, evidenceLevel: 1, reason: 'Not quite! Add a heading.'}
    );
    expect(chat.post).toHaveBeenNthCalledWith(1, {
      notificationType: 'success',
      includeInChatHistory: true,
      hideTimestamp: true,
      text: 'Success! Nice heading.',
    });
    expect(chat.post).toHaveBeenNthCalledWith(2, {
      notificationType: 'warning',
      includeInChatHistory: true,
      hideTimestamp: true,
      text: 'Not quite! Add a heading.',
    });
  });
});
