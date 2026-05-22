import {
  getImageMessage,
  getErrorMessage,
  stripAnsiSequences,
} from '@cdo/apps/codebridge/Console/MessageHelpers';

describe('stripAnsiSequences', () => {
  it('returns original string when there are no control sequences', () => {
    const message = 'plain text message';
    expect(stripAnsiSequences(message)).toBe(message);
  });

  it('strips ANSI color codes while preserving text', () => {
    const coloredMessage = '\x1b[31mError\x1b[0m: something went wrong';
    expect(stripAnsiSequences(coloredMessage)).toBe(
      'Error: something went wrong'
    );
  });

  it('strips ANSI color codes from error message while preserving text', () => {
    const text = 'Error: something went wrong';
    const coloredMessage = getErrorMessage(text);
    expect(stripAnsiSequences(coloredMessage)).toBe(text);
  });

  it('removes OSC image sequences and keeps surrounding text', () => {
    const oscSequence =
      '\x1b]1337;File=inline=1;size=4;width=10px;height=10px:SGVsbG8=\x07';
    const messageWithImage = `start ${oscSequence} end`;
    expect(stripAnsiSequences(messageWithImage)).toBe('start  end');
  });

  it('removes OSC image returned from getImageMessage and keeps surrounding text', () => {
    const oscSequence = getImageMessage('SGVsbG8=');
    const messageWithImage = `start ${oscSequence} end`;
    expect(oscSequence).toBe(
      '\x1b]1337;File=inline=1;size=5;width=600px;height=600px:SGVsbG8=\x1b\\'
    );
    expect(stripAnsiSequences(messageWithImage)).toBe('start  end');
  });
});
