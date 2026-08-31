import {chatHistoryValidator} from '@cdo/apps/aichat/api/validators';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

const mockLogWarning = jest.fn();
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({logWarning: mockLogWarning}),
    }),
  },
}));

// A stored chat message as the chat history endpoint returns it. Fields are
// typed as `unknown` so that tests can supply the malformed shapes older
// clients wrote, which the ServerChatEvent type does not admit.
const chatMessage = (fields: Record<string, unknown> = {}) => ({
  id: 1,
  chatMessageText: 'hello',
  role: Role.ASSISTANT,
  status: AiInteractionStatus.OK,
  timestamp: 1000,
  ...fields,
});

// The validator returns a union in which only some members carry message
// fields, so tests read them through this shape instead of narrowing.
type LooseEvent = Record<string, unknown>;
const validate = (events: unknown[]) =>
  chatHistoryValidator(events) as unknown as LooseEvent[];

describe('chatHistoryValidator', () => {
  beforeEach(() => mockLogWarning.mockClear());

  it('throws if the body is not an array', () => {
    expect(() => chatHistoryValidator({events: []})).toThrow(
      'Expected an array of chat events'
    );
  });

  it('throws if an event is missing a required field', () => {
    expect(() => validate([{chatMessageText: 'hi'}])).toThrow(
      'Missing required field: id'
    );
    expect(() => validate([chatMessage({role: undefined})])).toThrow(
      'Missing required field: role'
    );
  });

  it('drops historical COPY_CHAT events', () => {
    const events = validate([
      {id: 1, descriptionKey: 'COPY_CHAT', timestamp: 1000},
      {id: 2, descriptionKey: 'CLEAR_CHAT', timestamp: 2000},
    ]);

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe(2);
  });

  it('passes through a well-formed message unchanged', () => {
    const events = validate([chatMessage({chatMessageDisplayText: 'shown'})]);

    expect(events[0]).toMatchObject({
      chatMessageText: 'hello',
      chatMessageDisplayText: 'shown',
    });
    expect(mockLogWarning).not.toHaveBeenCalled();
  });

  // Regression: a stored message whose text was an array reached
  // markdownToTxt() in ChatWorkspace, where marked() threw "input parameter is
  // of type [object Array], string expected" from an effect, failing the whole
  // level rather than just that one message.
  it('coerces a non-string chatMessageText to a string', () => {
    const events = validate([
      chatMessage({chatMessageText: [{type: 'text', text: 'hello'}]}),
    ]);

    expect(events[0].chatMessageText).toBe('[{"type":"text","text":"hello"}]');
    expect(mockLogWarning).toHaveBeenCalledTimes(1);
    expect(mockLogWarning.mock.calls[0][0]).toContain(
      'chatMessageText is of type [object Array], string expected'
    );
  });

  it('coerces a non-string chatMessageDisplayText to a string', () => {
    const events = validate([
      chatMessage({chatMessageDisplayText: {text: 'hello'}}),
    ]);

    expect(events[0].chatMessageDisplayText).toBe('{"text":"hello"}');
    expect(mockLogWarning).toHaveBeenCalledTimes(1);
  });

  it('drops assets stored in an out of date format', () => {
    const events = validate([
      chatMessage({
        assets: ['legacy.png', {filename: 'current.png', source: 'project'}],
      }),
    ]);

    expect(events[0].assets).toEqual([
      {filename: 'current.png', source: 'project'},
    ]);
  });
});
