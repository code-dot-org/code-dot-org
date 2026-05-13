import Markdown from 'markdown-to-jsx';
import {useCallback, useEffect, useRef, useState} from 'react';

import {generateTextThroughGateway} from './aiGateway';
import {MARKDOWN_OPTIONS as TUTOR_MARKDOWN_OPTIONS} from './markdown';
import type {AiTutorSuggestedPrompt, ChatTurn} from './types';

import styles from './aiTutor.module.scss';

export interface AiTutorInjectedMessage {
  /**
   * Identity for the injected message. Each time `id` changes, the body is
   * appended as a fresh tutor turn. Same `id` across renders is a no-op —
   * so callers don't need to memoize.
   */
  id: string;
  body: string;
}

export interface AiTutorInjectedTurn {
  /** Stable id; the same id across renders is a no-op (won't re-append). */
  id: string;
  role: 'tutor' | 'student';
  body: string;
}

export interface AiTutorStepChoice {
  /** Stable id used to dedupe clicks. */
  id: string;
  /** What the chip says — also the student-turn body when clicked. */
  label: string;
  /** Tutor's scripted reply (no LLM call when scripted choices are used). */
  feedback: string;
  /** If true and the student picks this, chips collapse after the click. */
  isCorrect?: boolean;
}

export interface AiTutorStepControls {
  /** Total step count. Shown as a small "Step X of N" pill. */
  totalSteps: number;
  /** 0-based index of the current step. */
  stepIndex: number;
  /** Called when the student clicks the "back" control. */
  onBack: () => void;
  /** Called when the student clicks the "continue" control. */
  onNext: () => void;
  /** Label override for the back button. Defaults to "Go back". */
  backLabel?: string;
  /** Label override for the continue button. Defaults to "Continue". */
  nextLabel?: string;
}

export interface AiTutorChatProps {
  /** Optional title at the top of the panel. */
  title?: string;
  /** Optional subtitle under the title. */
  subtitle?: string;
  /**
   * System prompt for the tutor model. Forwarded to the aichat backend via
   * System prompt for the tutor model.
   */
  systemPrompt?: string;
  /**
   * Optional callback returning "hidden context" (current source code,
   * validation results, instructions, etc) as a single string. Appended to
   * each user message before the request as `hiddenContext` but not stored
   * in the visible chat log. Pair with `buildHiddenContextString` /
   * `makeHiddenContextCallback` for legacy-compatible strings.
   */
  hiddenContextCallback?: () => Promise<string> | string;
  /** Model id forwarded to the AI Gateway. */
  model?: string;
  /** Chip prompts shown above the input. */
  suggestedPrompts?: AiTutorSuggestedPrompt[];
  /** Placeholder text in the input. */
  placeholder?: string;
  /** Shown above the bubbles when the conversation is empty. */
  emptyHint?: string;
  /**
   * Append a tutor turn from outside the component — e.g., a guided lesson
   * advancing to the next step wants the tutor to "speak first" with the new
   * instructions, before the student types anything. Re-renders with the
   * same `id` are no-ops, so callers can pass `{id: step.id, body: step.tutorMessage}`
   * straight through.
   */
  injectedMessage?: AiTutorInjectedMessage;
  /**
   * Append any number of turns (tutor *or* student) from outside the
   * component. Each turn's `id` is the dedupe key. Useful when the host
   * owns an off-chat interaction (e.g., MC on the stage) and wants both
   * the student's selection and the scripted feedback to land in the chat
   * log atomically.
   */
  injectedTurns?: AiTutorInjectedTurn[];
  /**
   * When true, disables the textarea + Send button. Use during step types
   * that own their input elsewhere (e.g., MC on the stage) — the chat still
   * shows the conversation but the student answers via the stage.
   */
  inputDisabled?: boolean;
  /**
   * Hint text displayed in place of the input when `inputDisabled` is true.
   * Keeps the chat panel useful (rather than dead) during off-chat steps.
   */
  inputDisabledHint?: string;
  /**
   * If set, the chat shows back / continue controls (and a Step X of N pill).
   * Clicking either control appends a student turn into the log so the
   * advancement reads conversationally — the parent owns the actual step
   * index and decides what to inject next.
   */
  stepControls?: AiTutorStepControls;
  /**
   * Multiple-choice answers for the active step, rendered as chips above the
   * text input. Clicking one runs purely client-side: the label becomes a
   * student turn and the `feedback` becomes a tutor turn (no LLM call), so
   * authored feedback wins. The chip row collapses after the student picks
   * a correct answer. Changing `stepChoices` identity (e.g. on step change)
   * resets the chip state.
   */
  stepChoices?: AiTutorStepChoice[];
  /**
   * Called whenever a turn is appended. Useful for analytics or for the
   * caller to mirror the conversation log elsewhere.
   */
  onTurn?: (turn: ChatTurn) => void;
}

/**
 * LLM-driven chat panel. Owns conversation state in-component and routes each
 * user turn through `generateTextThroughGateway` — a one-shot POST to the
 * Code.org AI Gateway, authed via a short-lived token fetched from Rails.
 * Skips the legacy `/aichat_request/*` polling path (and its 422-happy server
 * validation), which is fine here: hackathon turns are short, edge timeouts
 * aren't a concern, and we don't need server-side chat history persistence.
 *
 * Trade-offs vs. the legacy version:
 *   - No Redux. Conversation lives in component state. `onTurn` is the
 *     integration point if you need to mirror it (analytics, server log).
 *   - No MUI. Plain HTML + this package's CSS module.
 */
const AiTutorChat = ({
  title,
  subtitle,
  systemPrompt,
  hiddenContextCallback,
  model = 'claude-haiku-4-5',
  suggestedPrompts,
  placeholder = 'Ask the tutor anything…',
  emptyHint = 'Ask a question to get started.',
  injectedMessage,
  injectedTurns,
  inputDisabled = false,
  inputDisabledHint,
  stepControls,
  stepChoices,
  onTurn,
}: AiTutorChatProps) => {
  const seenInjectedTurnIdsRef = useRef<Set<string>>(new Set());
  const [pickedChoiceIds, setPickedChoiceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [choicesResolved, setChoicesResolved] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pendingText, setPendingText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastInjectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, isThinking]);

  const appendTurn = useCallback(
    (turn: ChatTurn) => {
      setTurns(prev => [...prev, turn]);
      onTurn?.(turn);
    },
    [onTurn],
  );

  // Append a tutor turn whenever `injectedMessage.id` changes. The ref-guard
  // is what makes this safe to call with a non-memoized object — only the
  // *id* dedupes, so callers can pass `{id, body}` straight from props.
  useEffect(() => {
    if (!injectedMessage) return;
    if (lastInjectedIdRef.current === injectedMessage.id) return;
    lastInjectedIdRef.current = injectedMessage.id;
    appendTurn({role: 'tutor', body: injectedMessage.body});
  }, [injectedMessage, appendTurn]);

  // Append any external turns whose id we haven't seen. Lets the host push
  // both a student turn and the tutor's reply in one go (e.g., MC choices
  // owned by the stage). Order is preserved by the input array.
  useEffect(() => {
    if (!injectedTurns || injectedTurns.length === 0) return;
    const seen = seenInjectedTurnIdsRef.current;
    for (const turn of injectedTurns) {
      if (seen.has(turn.id)) continue;
      seen.add(turn.id);
      appendTurn({role: turn.role, body: turn.body});
    }
  }, [injectedTurns, appendTurn]);

  // Reset chip state whenever the *identity* of the choices array changes —
  // i.e. when the lesson advances to a different step. The parent shouldn't
  // need to manage this.
  useEffect(() => {
    setPickedChoiceIds(new Set());
    setChoicesResolved(false);
  }, [stepChoices]);

  const handleChoiceClick = useCallback(
    (choice: AiTutorStepChoice) => {
      if (pickedChoiceIds.has(choice.id) || choicesResolved) return;
      setPickedChoiceIds(prev => new Set(prev).add(choice.id));
      appendTurn({role: 'student', body: choice.label});
      appendTurn({role: 'tutor', body: choice.feedback});
      if (choice.isCorrect) {
        setChoicesResolved(true);
        // Auto-advance after a short pause so the student has time to read
        // the feedback. The next step's `injectedMessage` will push the next
        // tutor turn into the same chat.
        const canAutoAdvance =
          !!stepControls &&
          stepControls.stepIndex < stepControls.totalSteps - 1;
        if (canAutoAdvance) {
          window.setTimeout(() => stepControls.onNext(), 1500);
        }
      }
    },
    [appendTurn, choicesResolved, pickedChoiceIds, stepControls],
  );

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isThinking) return;

      appendTurn({role: 'student', body: text});
      setIsThinking(true);
      setError(null);

      try {
        let hiddenContext: string | undefined;
        if (hiddenContextCallback) {
          const hidden = await hiddenContextCallback();
          if (hidden && hidden.length > 0) {
            hiddenContext = hidden;
          }
        }

        // Build the message list straight in Vercel-SDK shape. The current
        // user turn gets hidden context tacked onto its content (legacy AI
        // Tutor style — model sees the context, log doesn't).
        const messages = [
          ...turns.map(turn => ({
            role: (turn.role === 'tutor' ? 'assistant' : 'user') as
              | 'assistant'
              | 'user',
            content: turn.body,
          })),
          {
            role: 'user' as const,
            content: hiddenContext
              ? `${text}\n\n---\n${hiddenContext}`
              : text,
          },
        ];

        const result = await generateTextThroughGateway({
          model,
          system: systemPrompt,
          messages,
        });

        appendTurn({role: 'tutor', body: result.text || '(no reply)'});
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'AI Tutor request failed.';
        setError(message);
      } finally {
        setIsThinking(false);
      }
    },
    [
      appendTurn,
      hiddenContextCallback,
      isThinking,
      model,
      systemPrompt,
      turns,
    ],
  );

  const handleBack = useCallback(() => {
    if (!stepControls) return;
    appendTurn({role: 'student', body: stepControls.backLabel ?? 'Go back'});
    stepControls.onBack();
  }, [appendTurn, stepControls]);

  const handleNext = useCallback(() => {
    if (!stepControls) return;
    appendTurn({role: 'student', body: stepControls.nextLabel ?? 'Continue'});
    stepControls.onNext();
  }, [appendTurn, stepControls]);

  const canBack = !!stepControls && stepControls.stepIndex > 0;
  const canNext =
    !!stepControls && stepControls.stepIndex < stepControls.totalSteps - 1;

  return (
    <section
      className={`${styles.panel} ${styles.chat}`}
      aria-label="AI Tutor"
    >
      {(title || subtitle || stepControls) && (
        <div className={styles.panelHeader}>
          <div className={styles.headerCenter}>
            {title && <h1 className={styles.lessonTitle}>{title}</h1>}
            {subtitle && <p className={styles.lessonSubtitle}>{subtitle}</p>}
          </div>
          {stepControls && (
            <span className={styles.progressPill}>
              Step {stepControls.stepIndex + 1} of {stepControls.totalSteps}
            </span>
          )}
        </div>
      )}

      <div className={styles.chatScroll} ref={scrollRef}>
        {turns.length === 0 && !isThinking ? (
          <div className={styles.emptyHint}>{emptyHint}</div>
        ) : (
          turns.map((turn, idx) => <ChatBubble key={idx} turn={turn} />)
        )}
        {isThinking && <ThinkingBubble />}
      </div>

      <div className={styles.inputArea}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {stepChoices && stepChoices.length > 0 && !choicesResolved && (
          <div className={styles.optionList}>
            {stepChoices.map(choice => {
              const picked = pickedChoiceIds.has(choice.id);
              const showWrong = picked && choice.isCorrect === false;
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`${styles.optionButton} ${
                    showWrong ? styles.optionWrong : ''
                  }`}
                  disabled={picked || isThinking}
                  onClick={() => handleChoiceClick(choice)}
                >
                  <Markdown options={MARKDOWN_OPTIONS}>
                    {choice.label}
                  </Markdown>
                </button>
              );
            })}
          </div>
        )}
        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className={styles.suggestedPrompts}>
            {suggestedPrompts.map(p => (
              <button
                key={p.id}
                type="button"
                className={styles.promptChip}
                disabled={isThinking}
                onClick={() => send(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        {inputDisabled ? (
          <div className={styles.inputDisabledHint}>
            {inputDisabledHint ?? 'Answer on the right →'}
          </div>
        ) : (
          <form
            className={styles.freeResponseRow}
            onSubmit={e => {
              e.preventDefault();
              send(pendingText);
              setPendingText('');
            }}
          >
            <textarea
              className={styles.freeResponseInput}
              placeholder={placeholder}
              value={pendingText}
              onChange={e => setPendingText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(pendingText);
                  setPendingText('');
                }
              }}
              rows={2}
              disabled={isThinking}
            />
          </form>
        )}
        {(() => {
          // One contextual primary action:
          //   - typing text → "Send"
          //   - empty input + a next step waiting → "Continue →"
          //   - empty input + no next step → "Send" disabled
          // Enter on the textarea always sends; the button stays in sync.
          // When input is disabled (e.g., MC owned by stage), only the
          // navigation controls show — the primary action is hidden.
          const hasText = !!pendingText.trim();
          const mode: 'send' | 'continue' =
            !hasText && canNext ? 'continue' : 'send';
          const onPrimary = () => {
            if (mode === 'continue') {
              handleNext();
            } else {
              send(pendingText);
              setPendingText('');
            }
          };
          const primaryDisabled =
            isThinking ||
            (mode === 'send' ? !hasText : !canNext) ||
            // Don't show "Continue" until the tutor has finished thinking.
            (mode === 'continue' && isThinking);
          return (
            <div className={styles.buttonRow}>
              {stepControls && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={!canBack || isThinking}
                  onClick={handleBack}
                >
                  ← {stepControls.backLabel ?? 'Go back'}
                </button>
              )}
              {!inputDisabled && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={primaryDisabled}
                  onClick={onPrimary}
                >
                  {isThinking
                    ? 'Thinking…'
                    : mode === 'continue'
                      ? `${stepControls?.nextLabel ?? 'Continue'} →`
                      : 'Send'}
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </section>
  );
};

// Markdown options used inside chat bubbles. Re-exported for callers that
// need to render authored lesson content (MC chip labels, stage note bodies,
// celebrate summary bullets) with the *same* rules — see `MARKDOWN_OPTIONS`
// in `./index.ts`.
const MARKDOWN_OPTIONS = TUTOR_MARKDOWN_OPTIONS;

const ChatBubble = ({turn}: {turn: ChatTurn}) => {
  if (turn.role === 'tutor') {
    return (
      <div className={styles.tutorTurn}>
        <div className={`${styles.avatar} ${styles.tutorAvatar}`}>AI</div>
        <div className={`${styles.bubble} ${styles.tutorBubble}`}>
          <Markdown options={MARKDOWN_OPTIONS}>{turn.body}</Markdown>
        </div>
      </div>
    );
  }
  // Student turns stay plain text — students don't author markdown, and any
  // accidental `*` etc shouldn't be reinterpreted.
  return (
    <div className={styles.studentTurn}>
      <div className={`${styles.avatar} ${styles.studentAvatar}`}>You</div>
      <div className={`${styles.bubble} ${styles.studentBubble}`}>
        {turn.body}
      </div>
    </div>
  );
};

const ThinkingBubble = () => (
  <div className={styles.tutorTurn}>
    <div className={`${styles.avatar} ${styles.tutorAvatar}`}>AI</div>
    <div className={styles.thinkingBubble}>
      <span className={styles.thinkingDot} />
      <span className={styles.thinkingDot} />
      <span className={styles.thinkingDot} />
    </div>
  </div>
);

export default AiTutorChat;
