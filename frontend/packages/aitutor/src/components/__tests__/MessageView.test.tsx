// One turn, as a bubble.
//
// The tint is the thing worth pinning here. It is the only signal that
// separates "the tutor said this" from "the tutor could not answer" without
// reading the sentence, and it is decided from a status field whose members are
// easy to lump together wrongly.

import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {Role, type ChatMessage} from '../../model/messages';
import {AiInteractionStatus} from '../../model/status';
import {strings} from '../../strings';
import {MessageView} from '../MessageView';

const message = (over: Record<string, unknown> = {}): ChatMessage =>
  ({
    role: Role.USER,
    status: AiInteractionStatus.OK,
    chatMessageText: 'what is a loop?',
    timestamp: 0,
    requestId: 1,
    ...over,
  }) as ChatMessage;

const bubble = () => screen.getByLabelText(strings.userMessage);

describe('the failure tint', () => {
  it('is absent on an ordinary turn', () => {
    render(<MessageView message={message()} />);

    expect(bubble().className).not.toContain('failed');
  });

  it('is absent while the turn is still in flight', () => {
    // `unknown` is not-yet-settled, not not-ok. Read as a failure it paints the
    // student's question as rejected the instant they send it, then unpaints it
    // when the answer lands — which is what shipped before a browser check
    // caught it.
    render(
      <MessageView
        message={message({
          status: AiInteractionStatus.UNKNOWN,
          updateId: 'a',
          requestId: undefined,
        })}
      />,
    );

    expect(bubble().className).not.toContain('failed');
  });

  it('is present once the turn has settled badly', () => {
    render(
      <MessageView
        message={message({status: AiInteractionStatus.PROFANITY_VIOLATION})}
      />,
    );

    expect(bubble().className).toContain('failed');
  });
});

describe('what is shown', () => {
  it('shows the display text in preference to what was sent', () => {
    // They differ when the panel appended something the student did not type.
    // Showing the appended form would be showing them words they did not write.
    render(
      <MessageView
        message={message({
          chatMessageText: 'question\n\n[three files attached]',
          chatMessageDisplayText: 'question',
        })}
      />,
    );

    expect(screen.getByText('question')).toBeInTheDocument();
  });

  it('renders the tutor in markdown and the student verbatim', () => {
    // The model writes markdown deliberately; a student typing an asterisk
    // between two words means an asterisk.
    const {rerender} = render(
      <MessageView
        message={message({role: Role.ASSISTANT, chatMessageText: '**bold**'})}
      />,
    );
    expect(screen.getByText('bold').tagName).toBe('STRONG');

    rerender(<MessageView message={message({chatMessageText: '**bold**'})} />);
    expect(screen.getByText('**bold**')).toBeInTheDocument();
  });

  it('renders nothing at all for an empty turn', () => {
    // The assistant half of a rejected question, before the reducer learned not
    // to make one.
    const {container} = render(
      <MessageView message={message({chatMessageText: ''})} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
