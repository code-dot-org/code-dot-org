import {applySchemaDisplayTransform} from '@cdo/apps/aichat/helpers/applySchemaDisplayTransform';
import {ChatEvent} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus as Status} from '@cdo/generated-scripts/sharedConstants';

// Stands in for a lab's formatForDisplay: pulls one field out of the parsed
// response, as the weblab2/pythonlab AI Tutor formatters do.
const callback = (response: unknown) =>
  `ANSWER: ${(response as {answer: string}).answer}`;

function assistantMessage(
  chatMessageText: string,
  status: ValueOfStatus = Status.OK
): ChatEvent {
  return {
    role: Role.ASSISTANT,
    status,
    chatMessageText,
    timestamp: 1,
    requestId: 7,
  } as ChatEvent;
}

type ValueOfStatus = (typeof Status)[keyof typeof Status];

describe('applySchemaDisplayTransform', () => {
  it('returns events untouched when no callback is configured', () => {
    const events = [assistantMessage('{"answer":"yes"}')];
    expect(applySchemaDisplayTransform(events, undefined)).toBe(events);
  });

  it('applies the callback to raw JSON assistant responses', () => {
    const result = applySchemaDisplayTransform(
      [assistantMessage('{"answer":"yes"}')],
      callback
    );
    expect((result[0] as {chatMessageText: string}).chatMessageText).toBe(
      'ANSWER: yes'
    );
  });

  it('leaves already-transformed history alone', () => {
    // Prose is not a schema response; passing it to the callback would corrupt
    // it.
    const prose = 'Try moving the sprite to the left instead.';
    const result = applySchemaDisplayTransform(
      [assistantMessage(prose)],
      callback
    );
    expect((result[0] as {chatMessageText: string}).chatMessageText).toBe(
      prose
    );
  });

  it('does not transform user messages', () => {
    const userEvent = {
      role: Role.USER,
      status: Status.OK,
      chatMessageText: '{"answer":"not mine to rewrite"}',
      timestamp: 1,
    } as ChatEvent;
    const result = applySchemaDisplayTransform([userEvent], callback);
    expect((result[0] as {chatMessageText: string}).chatMessageText).toBe(
      '{"answer":"not mine to rewrite"}'
    );
  });

  it('does not transform errored assistant messages', () => {
    // The failure placeholder is the literal string 'error', never JSON.
    const result = applySchemaDisplayTransform(
      [assistantMessage('error', Status.ERROR)],
      callback
    );
    expect((result[0] as {chatMessageText: string}).chatMessageText).toBe(
      'error'
    );
  });

  it('leaves non-message events alone', () => {
    const notification = {
      timestamp: 1,
      removeId: 2,
      text: 'welcome',
      notificationType: 'welcomeMessage',
    } as ChatEvent;
    const result = applySchemaDisplayTransform([notification], callback);
    expect(result[0]).toBe(notification);
  });

  it('falls back to stored text when the callback throws', () => {
    const throwing = () => {
      throw new Error('unexpected shape');
    };
    const result = applySchemaDisplayTransform(
      [assistantMessage('{"unexpected":true}')],
      throwing
    );
    expect((result[0] as {chatMessageText: string}).chatMessageText).toBe(
      '{"unexpected":true}'
    );
  });

  it('ignores bare JSON scalars that are really just text', () => {
    // "42" parses as JSON but is a message, not a schema response.
    const result = applySchemaDisplayTransform(
      [assistantMessage('42')],
      callback
    );
    expect((result[0] as {chatMessageText: string}).chatMessageText).toBe('42');
  });

  it('preserves array identity when nothing changed, for memoization', () => {
    const events = [assistantMessage('plain prose response')];
    expect(applySchemaDisplayTransform(events, callback)).toBe(events);
  });

  it('does not mutate the input events', () => {
    const original = assistantMessage('{"answer":"yes"}');
    applySchemaDisplayTransform([original], callback);
    expect((original as {chatMessageText: string}).chatMessageText).toBe(
      '{"answer":"yes"}'
    );
  });
});
