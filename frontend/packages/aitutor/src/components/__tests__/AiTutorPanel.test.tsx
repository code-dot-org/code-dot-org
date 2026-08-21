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

import type {AiTutorContext} from '../../context/types';
import type {SuggestedPrompt} from '../../prompts/suggestedPrompts';
import slice from '../../session/slice';
import {TutorProvider, type TutorConfig} from '../../session/TutorContext';
import {strings} from '../../strings';
import {FixtureTransport} from '../../transport/fixture/FixtureTransport';
import {
  parseTranscript,
  type Transcript,
} from '../../transport/fixture/transcript';
import type {TutorTransport} from '../../transport/types';
import {AiTutorPanel} from '../AiTutorPanel';

const show = (
  transport: TutorTransport,
  context?: () => AiTutorContext,
  prompts?: SuggestedPrompt[],
) => {
  // A store of this package's slice alone. A host injects it into the one
  // `@code-dot-org/core/redux` owns; nothing here needs that machinery, which
  // is the point of the slice never naming a root state.
  const store = configureStore({reducer: {aiTutor: slice.reducer}});
  render(
    <Provider store={store}>
      <TutorProvider transport={transport} context={context} prompts={prompts}>
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
    const context = vi.fn().mockReturnValue({sourceCode: 'let x = 1;'});
    show({complete}, context);

    await ask('help');
    await ask('again');

    expect(context).toHaveBeenCalledTimes(2);
    // The host hands over facts; the wording is the package's, so that every
    // lab tunes against the same prompt.
    expect(complete.mock.calls[0][0].hiddenContext).toBe(
      "Here is the student's current code: let x = 1;",
    );
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

describe('the suggested prompts', () => {
  const prompts = [
    {id: 'hint', label: 'Give a hint', value: 'Can you give me a hint?'},
  ];

  const press = async (label: string) => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', {name: label}));
  };

  it('sends what the button stands for, not what it says', async () => {
    // The label is short because it is a button; the value is a question
    // because it is going to a model.
    const complete = vi.fn().mockResolvedValue({messages: []});
    show({complete}, undefined, prompts);

    await press('Give a hint');

    expect(complete.mock.calls[0][0].message.chatMessageText).toBe(
      'Can you give me a hint?',
    );
  });

  it('is absent when the host offers none', () => {
    show({complete: vi.fn()});

    expect(screen.queryByRole('button', {name: 'Give a hint'})).toBeNull();
  });

  it('will not take a second question while one is in flight', async () => {
    show(fromTurns([{hang: true, reply: {}}]), undefined, prompts);

    await press('Give a hint');

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Give a hint'})).toBeDisabled(),
    );
  });
});

describe('a proposal', () => {
  const policy = {
    answerTypes: ['buildJavaScript'],
    fileTypes: ['js'],
  };

  const proposing = (answerType = 'buildJavaScript', filename = 'main.js') =>
    fromTurns([
      {
        reply: {
          structured: {
            answer: {
              answerType,
              explanation: 'moved it into a loop',
              code: [{filename, sourceCode: 'for (;;) {}'}],
            },
          },
        },
      },
    ]);

  const showWith = (
    transport: TutorTransport,
    proposals?: Partial<TutorConfig['proposals']>,
  ) => {
    const store = configureStore({reducer: {aiTutor: slice.reducer}});
    render(
      <Provider store={store}>
        <TutorProvider
          transport={transport}
          proposals={{...policy, ...proposals} as TutorConfig['proposals']}
        >
          <AiTutorPanel />
        </TutorProvider>
      </Provider>,
    );
    return store;
  };

  it('offers the files and both answers, and applies them at once', async () => {
    // Applied when offered, not when accepted: legacy replaces the sources and
    // makes the workspace read-only, so the decision is about something the
    // student can see rather than a description of it.
    const onPropose = vi.fn();
    showWith(proposing(), {onPropose});

    await ask('make it loop');

    expect(await screen.findByText('main.js')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Accept'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Reject'})).toBeInTheDocument();
    expect(onPropose).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [{path: 'main.js', contents: 'for (;;) {}'}],
      }),
    );
  });

  it('shows the explanation without repeating the code', async () => {
    // The student is looking at the applied edit; a second copy in the chat is
    // the same content twice, once unreadably.
    showWith(proposing());

    await ask('make it loop');

    expect(await screen.findByText('moved it into a loop')).toBeInTheDocument();
    expect(screen.queryByText(/for \(;;\)/)).toBeNull();
  });

  it('asks what changed before it accepts, and will not save an unnamed version', async () => {
    const onAccept = vi.fn();
    const user = userEvent.setup();
    showWith(proposing(), {onAccept});
    await ask('make it loop');

    await user.click(await screen.findByRole('button', {name: 'Accept'}));

    // A version with no description is one nobody can find later.
    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
    await user.type(
      screen.getByRole('textbox', {name: /what did you change/i}),
      'a loop',
    );
    await user.click(screen.getByRole('button', {name: 'Save'}));

    expect(onAccept).toHaveBeenCalledWith(expect.anything(), 'a loop');
  });

  it('rejects in one press, and the offer is gone', async () => {
    const onReject = vi.fn();
    const user = userEvent.setup();
    showWith(proposing(), {onReject});
    await ask('make it loop');

    await user.click(await screen.findByRole('button', {name: 'Reject'}));

    expect(onReject).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole('button', {name: 'Reject'})).toBeNull(),
    );
  });

  it('is prose when the lab cannot place the files', async () => {
    // The answer type alone is not enough: a `.py` file in a web project is
    // something the student should read, not accept.
    showWith(proposing('buildJavaScript', 'helper.py'));

    await ask('make it loop');

    expect(await screen.findByText(/moved it into a loop/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Accept'})).toBeNull();
    // Falling back to prose means the code comes with it, to copy across.
    expect(screen.getByText(/helper\.py/)).toBeInTheDocument();
  });

  it('never offers to change anything when the host declared no policy', async () => {
    show(proposing());

    await ask('make it loop');

    expect(await screen.findByText(/moved it into a loop/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Accept'})).toBeNull();
  });
});
