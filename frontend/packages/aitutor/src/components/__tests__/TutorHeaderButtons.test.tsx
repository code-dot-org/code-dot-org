// The panel header's buttons.
//
// One of the three tests here is about correctness rather than presentation:
// clearing must be blocked while a proposal stands, because the host has
// already applied the offered edits and the Accept and Reject buttons live in
// the conversation being cleared.

import {configureStore} from '@reduxjs/toolkit';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Provider} from 'react-redux';
import {describe, expect, it, vi} from 'vitest';

import {Role} from '../../model/messages';
import {AiInteractionStatus} from '../../model/status';
import type {TutorProposal} from '../../response/proposal';
import slice, {proposalOffered, turnCompleted} from '../../session/slice';
import {TutorProvider} from '../../session/TutorContext';
import {TutorHeaderButtons} from '../TutorHeaderButtons';

const proposal: TutorProposal = {
  explanation: 'moved it',
  answerType: 'buildJavaScript',
  files: [{path: 'main.js', contents: 'for (;;) {}'}],
};

const show = ({withMessages = true, withProposal = false} = {}) => {
  const store = configureStore({reducer: {aiTutor: slice.reducer}});
  if (withMessages) {
    store.dispatch(
      turnCompleted([
        {
          role: Role.USER,
          status: AiInteractionStatus.OK,
          chatMessageText: 'why?',
          timestamp: 0,
          requestId: 1,
        },
      ]),
    );
  }
  if (withProposal) {
    store.dispatch(proposalOffered(proposal));
  }
  render(
    <Provider store={store}>
      <TutorProvider transport={{complete: vi.fn()}}>
        <TutorHeaderButtons />
      </TutorProvider>
    </Provider>,
  );
  return store;
};

describe('TutorHeaderButtons', () => {
  it('offers nothing when there is no conversation to clear', () => {
    show({withMessages: false});

    expect(screen.queryByRole('button', {name: 'Clear chat'})).toBeNull();
  });

  it('clears the conversation', async () => {
    const store = show();

    await userEvent
      .setup()
      .click(screen.getByRole('button', {name: 'Clear chat'}));

    expect(store.getState().aiTutor.messages).toEqual([]);
  });

  it('will not clear while a proposal is waiting to be answered', async () => {
    // The host applied those edits when they arrived. Clearing would take away
    // the only Accept and Reject there are, leaving the project holding changes
    // nobody agreed to.
    const store = show({withProposal: true});

    expect(screen.getByRole('button', {name: 'Clear chat'})).toBeDisabled();
    expect(store.getState().aiTutor.messages).toHaveLength(1);
  });
});
