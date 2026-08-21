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

import {hiddenContextFrom} from '../context/hiddenContext';
import {
  isCompletedMessage,
  Role,
  type ChatMessage,
  type CompletedMessage,
  type PendingMessage,
} from '../model/messages';
import {AiInteractionStatus} from '../model/status';
import {formatAnswer, formatProposalText} from '../response/format';
import {
  answerFrom,
  proposalFrom,
  type TutorProposal,
} from '../response/proposal';

import {
  conversationCleared,
  messageSent,
  proposalOffered,
  proposalSettled,
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
  /** A set of file edits offered and not yet answered (specs/PLAN.md §8). */
  proposal?: TutorProposal;
  send: (text: string, displayText?: string) => Promise<void>;
  /** Abandon the turn in flight. Does nothing when there is none. */
  cancel: () => void;
  /** Keep the offered edits. `description` names the version the host saves. */
  accept: (description: string) => void;
  /** Put the project back. */
  reject: () => void;
  clear: () => void;
}

export const useTutor = (): Tutor => {
  const dispatch = useDispatch();
  const config = useTutorConfig();
  const messages = useSelector((state: WithAiTutor) => state.aiTutor.messages);
  const awaiting = useSelector((state: WithAiTutor) => state.aiTutor.awaiting);
  const proposal = useSelector((state: WithAiTutor) => state.aiTutor.proposal);

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
      // as it is now, and the student has been editing it. The host hands over
      // facts; the wording is ours (`context/hiddenContext`).
      const gathered = await config.context?.();
      const hiddenContext = gathered && hiddenContextFrom(gathered);
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
        // A structured reply's text blocks are usually empty — everything is in
        // the tool call — so what the student sees is composed here, from the
        // answer, exactly as the legacy `jsonSchemaResponseCallback` returns
        // the string to display.
        const answer = answerFrom(reply.structuredOutput);
        const offered = answer
          ? proposalFrom(answer, config.proposals)
          : undefined;

        dispatch(
          turnCompleted(
            answer
              ? reply.messages.map(held =>
                  held.role === Role.ASSISTANT
                    ? {
                        ...held,
                        chatMessageText: offered
                          ? formatProposalText(answer)
                          : formatAnswer(answer),
                      }
                    : held,
                )
              : reply.messages,
          ),
        );

        if (offered) {
          dispatch(proposalOffered(offered));
          // The host applies it provisionally — legacy replaces the project
          // sources and makes the workspace read-only — so that Accept and
          // Reject are a decision about something the student can see.
          config.proposals?.onPropose?.(offered);
        }
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

  // Read through a ref for the same reason `messages` is: the callbacks are
  // handed to buttons, and an identity that changed per render would re-render
  // every one of them.
  const offer = useRef(proposal);
  offer.current = proposal;

  const settle = useCallback(
    (answered: (proposal: TutorProposal) => void) => () => {
      const held = offer.current;
      if (!held) {
        return;
      }
      // Cleared FIRST, so a double click cannot apply the same decision twice —
      // one of which would be a second version commit for one change.
      dispatch(proposalSettled());
      answered(held);
    },
    [dispatch],
  );

  const accept = useCallback(
    (description: string) =>
      settle(held => config.proposals?.onAccept?.(held, description))(),
    [config, settle],
  );
  const reject = useCallback(
    () => settle(held => config.proposals?.onReject?.(held))(),
    [config, settle],
  );
  const clear = useCallback(() => {
    flight.current?.abort();
    dispatch(conversationCleared());
  }, [dispatch]);

  return {
    messages,
    awaiting: awaiting !== undefined,
    proposal,
    send,
    cancel,
    accept,
    reject,
    clear,
  };
};
