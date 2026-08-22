// A whole turn, driven the way the dev harness drives one.
//
// Written because the same bug was reported four times and diagnosed wrong
// twice. Every failure in a turn renders as one sentence — "There was an error
// getting a response" — and the causes are not alike: an empty answer, a
// transport that threw, a host whose `onPropose` threw while applying a
// perfectly good answer. Reasoning about which was happening did not work. This
// drives the real hook, through the real reducer, with the reply that actually
// arrived.

import {configureStore} from '@reduxjs/toolkit';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Provider} from 'react-redux';
import {describe, expect, it, vi} from 'vitest';

import {AiTutorPanel} from '../../components/AiTutorPanel';
import {Role} from '../../model/messages';
import {AiInteractionStatus} from '../../model/status';
import {strings} from '../../strings';
import type {TutorReply, TutorTransport} from '../../transport/types';
import slice from '../slice';
import {TutorProvider, type TutorConfig} from '../TutorContext';

/**
 * The reply as it came off the wire, `answer` a JSON STRING and a trailing
 * newline — captured from the network tab, not invented here.
 */
const WIRE = {
  answer:
    '{"answerType": "buildWorld", "goal": "Surround the 10x10 map with Ground actors so the player can\'t fall out", "code": [{"filename": "main.world", "sourceCode": "{\\"blocks\\":{\\"blocks\\":[]}}"}], "explanation": "The map is 10x10 tiles, each 32 pixels.", "nextSteps": "- Load the world and try walking into every edge", "questions": "- Border 1 tile thick, or thicker?"}\n',
};

/** A transport that answers with that reply, as `DirectTransport` would. */
const wireTransport = (wire: unknown = WIRE): TutorTransport => ({
  complete: async request => {
    const reply: TutorReply = {
      messages: [
        {
          ...request.message,
          status: AiInteractionStatus.OK,
          requestId: 1,
          timestamp: 0,
        },
        {
          role: Role.ASSISTANT,
          status: AiInteractionStatus.OK,
          // Empty, which is what a tool-call reply carries.
          chatMessageText: '',
          structuredOutput: wire,
          requestId: 2,
          timestamp: 0,
        },
      ],
      structuredOutput: wire,
    };
    return reply;
  },
});

const show = (proposals?: TutorConfig['proposals'], wire: unknown = WIRE) => {
  const store = configureStore({reducer: {aiTutor: slice.reducer}});
  render(
    <Provider store={store}>
      <TutorProvider transport={wireTransport(wire)} proposals={proposals}>
        <AiTutorPanel />
      </TutorProvider>
    </Provider>,
  );
  return store;
};

const ask = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox'), 'surround the map with ground');
  await user.click(screen.getByRole('button', {name: strings.submit}));
};

const policy = (over: Partial<NonNullable<TutorConfig['proposals']>> = {}) => ({
  answerTypes: ['buildActor', 'buildWorld', 'buildRule'],
  fileTypes: ['actor', 'world', 'rule'],
  ...over,
});

/** The same reply, with the stray `}` the second one actually carried. */
const WITH_STRAY_BRACE = {
  answer: (WIRE as {answer: string}).answer.trimEnd() + '}\n',
};

describe('the reply that kept failing', () => {
  it('is not shown as an error', async () => {
    show(policy());
    await ask();

    await waitFor(() =>
      expect(screen.queryByText(strings.responseError)).toBeNull(),
    );
  });

  it('lands as an offer the student can accept', async () => {
    const store = show(policy());
    await ask();

    await waitFor(() =>
      expect(store.getState().aiTutor.proposal?.answerType).toBe('buildWorld'),
    );
  });

  it('is still readable when the host refuses the files', async () => {
    // The downgrade path: prose, with the code in it, and NOT an error.
    show(policy({accepts: () => false}));
    await ask();

    await waitFor(() => expect(screen.getByText(/Explanation/)).toBeTruthy());
    expect(screen.queryByText(strings.responseError)).toBeNull();
  });

  it('IS an error when applying it throws, and says so out loud', async () => {
    // The one remaining way this reply can fail. `onPropose` runs inside the
    // turn's try, so a host that throws while applying a good answer produces
    // the same sentence as a dead proxy — which is why the catch now reports.
    const shouted = vi.spyOn(console, 'error').mockImplementation(() => {});

    show(
      policy({
        onPropose: () => {
          throw new Error('host could not apply it');
        },
      }),
    );
    await ask();

    await waitFor(() =>
      expect(screen.getByText(strings.responseError)).toBeTruthy(),
    );
    expect(shouted).toHaveBeenCalledWith(
      'AI Tutor: the turn failed.',
      expect.objectContaining({message: 'host could not apply it'}),
    );
    shouted.mockRestore();
  });
});

// The reply as it arrived the SECOND time: the same answer, plus one brace.
describe('the same reply with a stray brace after it', () => {
  it('is not shown as an error', async () => {
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});
    show(policy(), WITH_STRAY_BRACE);
    await ask();

    await waitFor(() =>
      expect(screen.queryByText(strings.responseError)).toBeNull(),
    );
    quiet.mockRestore();
  });

  it('lands as an offer the student can accept', async () => {
    const quiet = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const store = show(policy(), WITH_STRAY_BRACE);
    await ask();

    await waitFor(() =>
      expect(store.getState().aiTutor.proposal?.answerType).toBe('buildWorld'),
    );
    quiet.mockRestore();
  });
});
