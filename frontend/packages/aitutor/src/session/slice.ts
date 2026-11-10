// The conversation, as state.
//
// A slice the HOST injects, which is the pattern `labs/base/src/redux/store.ts`
// already uses via `injectSlices` from `@code-dot-org/core/redux`. The package
// exports the slice and never names a root state.
//
// WHAT IT DOES NOT HOLD is the point. The legacy send path reads five foreign
// slices — `state.progress`, `state.lab`, `state.lab2Project`, the section
// access level, the view-as user — and that is what makes it a directory rather
// than a package. All of it arrives in `TutorRequest.session`, supplied by the
// host. The demo page has none of those slices and must still work.
//
// The list is APPEND-ONLY except through `updateId`. A pending message is put
// in the list the moment it is sent, and the reply replaces it in place rather
// than being pushed after it — otherwise the student's own message would jump
// down the list when the answer landed, having been rendered once already.

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import {
  Role,
  type ChatMessage,
  type CompletedMessage,
  type PendingMessage,
} from '../model/messages';
import {AiInteractionStatus} from '../model/status';
import type {TutorProposal} from '../response/proposal';

export interface AiTutorState {
  /** The conversation, oldest first. */
  messages: ChatMessage[];
  /**
   * The `updateId` of the message awaiting an answer, if any.
   *
   * One at a time: the composer is disabled while a turn is in flight, so a
   * second is not reachable, and a queue would be a feature nobody asked for.
   */
  awaiting?: string;

  /**
   * A set of file edits offered and not yet settled.
   *
   * At most one, and it belongs to the LAST message — which is where the
   * legacy puts its actions too (`renderLastMessagePostText`). A second
   * proposal while one stands would be two answers to "is this what you
   * wanted", and the host has already applied the first to the project.
   */
  proposal?: TutorProposal;
}

const initialState: AiTutorState = {messages: []};

const slice = createSlice({
  name: 'aiTutor',
  initialState,
  reducers: {
    /** The student sent something. */
    messageSent(state, action: PayloadAction<PendingMessage>) {
      state.messages.push(action.payload);
      state.awaiting = action.payload.updateId;
    },

    /**
     * A turn settled.
     *
     * Each message either replaces the pending one it shares an `updateId`
     * with, or is appended. That is what makes a reply carrying only the user's
     * own message — the shape a rejected question produces — do the right
     * thing: it replaces, and nothing is appended.
     */
    turnCompleted(state, action: PayloadAction<CompletedMessage[]>) {
      for (const message of action.payload) {
        const at = message.updateId
          ? state.messages.findIndex(held => held.updateId === message.updateId)
          : -1;
        if (at >= 0) {
          state.messages[at] = message;
        } else {
          state.messages.push(message);
        }
      }
      state.awaiting = undefined;
    },

    /**
     * The turn could not be made at all — a dead network, an abort.
     *
     * Distinct from a turn that FAILED, which arrives through `turnCompleted`
     * carrying a status the panel has copy for. Nothing described this one, so
     * the panel has to say the generic thing itself.
     *
     * TWO effects, as in the legacy `handleChatCompletionError`. The question
     * settles as `error`, which both stops it spinning and keeps it out of the
     * history sent with the next turn — a question that never reached a model is
     * not part of the conversation the model has been having. And an assistant
     * turn is APPENDED to carry the explanation, because the alternative is
     * replacing the student's own words with a notice about the network, and
     * they did nothing wrong.
     */
    turnFailed(state, action: PayloadAction<{updateId: string}>) {
      const at = state.messages.findIndex(
        held => held.updateId === action.payload.updateId,
      );
      if (at >= 0) {
        state.messages[at] = {
          ...state.messages[at],
          status: AiInteractionStatus.ERROR,
          // No request was completed, so there is no id to carry. Negative
          // rather than absent: `isCompletedMessage` reads the presence of this
          // field, and a message left without one would still look pending.
          requestId: -1,
        } as CompletedMessage;
        state.messages.splice(at + 1, 0, {
          role: Role.ASSISTANT,
          status: AiInteractionStatus.ERROR,
          chatMessageText: '',
          timestamp: state.messages[at].timestamp,
          requestId: -1,
        });
      }
      state.awaiting = undefined;
    },

    /** The tutor has rewritten some files and is waiting to hear. */
    proposalOffered(state, action: PayloadAction<TutorProposal>) {
      state.proposal = action.payload;
    },

    /**
     * Accepted or rejected — the panel does not care which.
     *
     * What the two words MEAN is the host's: one commits a version and lets
     * the workspace be edited again, the other puts the project back. All this
     * side has to know is that the question has been answered.
     */
    proposalSettled(state) {
      state.proposal = undefined;
    },

    /** Start over. The transcript is gone; the session is not. */
    conversationCleared(state) {
      state.messages = [];
      state.awaiting = undefined;
      state.proposal = undefined;
    },
  },
});

export const {
  messageSent,
  turnCompleted,
  turnFailed,
  proposalOffered,
  proposalSettled,
  conversationCleared,
} = slice.actions;

export default slice;
