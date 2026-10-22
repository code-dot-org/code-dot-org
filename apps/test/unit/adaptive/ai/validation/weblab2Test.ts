import {weblab2Adapter, workOf} from '@cdo/apps/adaptive/ai/validation/weblab2';
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

describe('workOf', () => {
  it('describes the built files as the change, the way the project is, and the exchange as the process', () => {
    const build: AcceptedBuild = {
      at: 7,
      files: [file('index.html', '<h1>Hi</h1>'), file('style.css', 'h1 {}')],
      transcript: 'Student: Add a heading',
    };
    const work = workOf(build);
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
    };
    const work = jest.fn();

    const off = weblab2Adapter.observe({chat}, work);
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
    expect(weblab2Adapter.observe({}, work)).toEqual(expect.any(Function));
    expect(work).not.toHaveBeenCalled();
    weblab2Adapter.report?.(
      {},
      {pass: true, evidenceLevel: 1, reason: 'Fine.'}
    );
  });

  it('reports a verdict into the chat as the tutor, kept in the history', () => {
    const chat: ChatHandle = {post: jest.fn(), onBuildAccepted: jest.fn()};
    weblab2Adapter.report?.(
      {chat},
      {pass: true, evidenceLevel: 2, reason: 'Nice heading.'}
    );
    weblab2Adapter.report?.(
      {chat},
      {pass: false, evidenceLevel: 1, reason: 'Add a heading.'}
    );
    expect(chat.post).toHaveBeenNthCalledWith(1, {
      notificationType: 'hostMessage',
      includeInChatHistory: true,
      text: "This meets the step's goal. Nice heading.",
    });
    expect(chat.post).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({text: 'Not there yet. Add a heading.'})
    );
  });
});
