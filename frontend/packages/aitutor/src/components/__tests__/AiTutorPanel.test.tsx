// The panel, driven end to end against a recording.
//
// This is what the fixture transport is for. Every branch here — a question
// answered, a question rejected, an answer that timed out, a turn abandoned — is
// reachable with no network, no mocking framework and no misbehaviour at a live
// server. Against a real backend, most of them are not reachable at all.

import {configureStore} from '@reduxjs/toolkit';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Provider} from 'react-redux';
import {describe, expect, it, vi} from 'vitest';

import slice from '../../session/slice';
import {TutorProvider} from '../../session/TutorContext';
import {strings} from '../../strings';
import {FixtureTransport} from '../../transport/fixture/FixtureTransport';
import {
  parseTranscript,
  type Transcript,
} from '../../transport/fixture/transcript';
import type {TutorTransport} from '../../transport/types';
import {AiTutorPanel} from '../AiTutorPanel';

const show = (transport: TutorTransport, context?: () => string) => {
  // A store of this package's slice alone. A host injects it into the one
  // `@code-dot-org/core/redux` owns; nothing here needs that machinery, which
  // is the point of the slice never naming a root state.
  const store = configureStore({reducer: {aiTutor: slice.reducer}});
  render(
    <Provider store={store}>
      <TutorProvider transport={transport} context={context}>
        <AiTutorPanel />
      </TutorProvider>
    </Provider>,
  );
  return store;
};

const fromTurns = (turns: Transcript['turns']) =>
  new FixtureTransport(parseTranscript({name: 'test', turns}), {
    sleep: () => Promise.resolve(),
  });

const ask = async (text: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox'), text);
  await user.click(screen.getByRole('button', {name: strings.submit}));
};

describe('asking a question', () => {
  it('shows the question, then the answer', async () => {
    show(fromTurns([{reply: {text: 'A loop repeats things.'}}]));

    await ask('what is a loop?');

    expect(await screen.findByText('what is a loop?')).toBeInTheDocument();
    expect(
      await screen.findByText('A loop repeats things.'),
    ).toBeInTheDocument();
  });

  it('sends the project context the host supplies, gathered per turn', async () => {
    // Per turn, not per session: the answer is about the code as it is now, and
    // the student has been editing it.
    const complete = vi.fn().mockResolvedValue({messages: []});
    const context = vi.fn().mockReturnValue('the code');
    show({complete}, context);

    await ask('help');
    await ask('again');

    expect(context).toHaveBeenCalledTimes(2);
    expect(complete.mock.calls[0][0].hiddenContext).toBe('the code');
  });

  it('sends prior turns, but not the ones that failed', async () => {
    // A failed turn is a thing the student saw, not a thing the model said.
    const transport = fromTurns([
      {reply: {status: 'model_timeout'}},
      {reply: {text: 'second'}},
      {reply: {text: 'third'}},
    ]);
    const complete = vi.spyOn(transport, 'complete');
    show(transport);

    await ask('one');
    await ask('two');
    await ask('three');

    await waitFor(() => expect(complete).toHaveBeenCalledTimes(3));
    const history = complete.mock.calls[2][0].history;
    expect(history.map(m => m.chatMessageText)).not.toContain('');
    expect(history.map(m => m.chatMessageText)).toContain('second');
  });

  it('clears the field after sending', async () => {
    show(fromTurns([{reply: {text: 'ok'}}]));

    await ask('hello');

    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(''));
  });
});

describe('while a turn is in flight', () => {
  it('shows the waiting animation and will not take a second question', async () => {
    const transport = fromTurns([{hang: true, reply: {}}]);
    show(transport);

    await ask('hello?');

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: strings.submit})).toBeDisabled();
  });
});

describe('failure', () => {
  it('replaces a rejected question with an explanation of why', async () => {
    show(fromTurns([{reply: {userStatus: 'profanity_violation'}}]));

    await ask('something rude');

    expect(
      await screen.findByText(strings.inappropriateUser),
    ).toBeInTheDocument();
    expect(screen.queryByText('something rude')).not.toBeInTheDocument();
  });

  it('explains an answer that timed out, and keeps the question', async () => {
    show(fromTurns([{reply: {status: 'model_timeout'}}]));

    await ask('a hard one');

    expect(await screen.findByText(strings.timeout)).toBeInTheDocument();
    expect(screen.getByText('a hard one')).toBeInTheDocument();
  });

  it('says something when the turn could not be made at all', async () => {
    // A dead transport, as distinct from a described failure. All the panel can
    // say is that it did not happen.
    show({complete: () => Promise.reject(new Error('offline'))});

    await ask('hello?');

    expect(await screen.findByText(strings.responseError)).toBeInTheDocument();
  });

  it('lets the student ask again after a failure', async () => {
    show(
      fromTurns([{reply: {status: 'error'}}, {reply: {text: 'better luck'}}]),
    );

    await ask('one');
    await waitFor(() =>
      expect(screen.getByRole('button', {name: strings.submit})).toBeDisabled(),
    );
    await ask('two');

    expect(await screen.findByText('better luck')).toBeInTheDocument();
  });
});
