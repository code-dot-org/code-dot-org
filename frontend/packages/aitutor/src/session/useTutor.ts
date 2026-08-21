// Sending a turn, and everything that can happen to it.
//
// The legacy version of this is `submitChatContents`, a 340-line thunk. Most of
// that length is studio: five redux slices read for context, two analytics
// calls, a metrics reporter, a progress report, and the transport branch. What
// is left when those move to the host (specs/PLAN.md §3) is this — which is
// roughly the shape the thunk had underneath.
//
// The one rule worth stating: a turn that FAILED and a turn that could not be
// MADE are different things. The first arrives as a reply whose messages carry
// a status the panel has copy for; the second is an exception, and all the panel
// can say is that it did not happen.

import {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
  isCompletedMessage,
  Role,
  type ChatMessage,
  type CompletedMessage,
  type PendingMessage,
} from '../model/messages';
import {AiInteractionStatus} from '../model/status';

import {
  conversationCleared,
  messageSent,
  turnCompleted,
  turnFailed,
  type AiTutorState,
} from './slice';
import {useTutorConfig} from './TutorContext';

/** Somewhere to hang an id when the platform has no `randomUUID`. */
let fallbackId = 0;
const newId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `turn-${++fallbackId}`;

interface WithAiTutor {
  aiTutor: AiTutorState;
}

export interface Tutor {
  messages: ChatMessage[];
  /** Whether a turn is in flight — what disables the composer. */
  awaiting: boolean;
  send: (text: string, displayText?: string) => Promise<void>;
  /** Abandon the turn in flight. Does nothing when there is none. */
  cancel: () => void;
  clear: () => void;
}

export const useTutor = (): Tutor => {
  const dispatch = useDispatch();
  const config = useTutorConfig();
  const messages = useSelector((state: WithAiTutor) => state.aiTutor.messages);
  const awaiting = useSelector((state: WithAiTutor) => state.aiTutor.awaiting);

  // The turn in flight, so it can be abandoned — by the student, or by this
  // component going away. Without the second, a fixture with a long delay keeps
  // answering into a store nobody is reading.
  const flight = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => flight.current?.abort(), []);

  // Read through a ref so `send` does not change identity every time a message
  // lands, which would re-render every button that takes it as a prop.
  const held = useRef(messages);
  held.current = messages;

  const send = useCallback(
    async (text: string, displayText?: string) => {
      const message: PendingMessage = {
        role: Role.USER,
        status: AiInteractionStatus.UNKNOWN,
        chatMessageText: text,
        chatMessageDisplayText: displayText,
        timestamp: Date.now(),
        updateId: newId(),
      };

      // Gathered per turn rather than per session: the answer is about the code
      // as it is now, and the student has been editing it.
      const hiddenContext = await config.context?.();
      message.hiddenContext = hiddenContext;

      dispatch(messageSent(message));

      const controller = new AbortController();
      flight.current = controller;

      try {
        const reply = await config.transport.complete(
          {
            message,
            // A failed turn is a thing the student saw, not a thing the model
            // said; sending it back would teach the model that its own errors
            // are part of the conversation.
            history: held.current.filter(
              (held): held is CompletedMessage =>
                isCompletedMessage(held) &&
                held.status === AiInteractionStatus.OK,
            ),
            hiddenContext,
            systemPrompt: config.systemPrompt,
            responseSchema: config.responseSchema,
            session: config.session ?? {},
          },
          controller.signal,
        );
        dispatch(turnCompleted(reply.messages));
      } catch {
        // Including an abort, which settles the message as an error rather than
        // leaving it pending forever. The student cancelled it; the transcript
        // should show that it went nowhere.
        dispatch(turnFailed({updateId: message.updateId}));
      } finally {
        if (flight.current === controller) {
          flight.current = undefined;
        }
      }
    },
    [config, dispatch],
  );

  const cancel = useCallback(() => flight.current?.abort(), []);
  const clear = useCallback(() => {
    flight.current?.abort();
    dispatch(conversationCleared());
  }, [dispatch]);

  return {messages, awaiting: awaiting !== undefined, send, cancel, clear};
};
