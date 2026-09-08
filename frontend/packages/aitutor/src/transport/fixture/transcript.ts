// What a recorded conversation is, on disk.
//
// A transcript is JSON: an ordered list of turns, each a matcher and a reply.
// It is the package's answer to two problems that are really one problem —
// tests need a model that never varies, and review needs a panel that works
// without a credential (specs/PLAN.md §6).
//
// The format has one deliberate asymmetry. A turn with NO matcher matches in
// sequence, so a straight-line conversation — the common case — needs no
// matchers at all and reads like the conversation it is. Matchers exist for the
// case where the student may say things in any order.
//
// Validation is here, and it is not decoration. A transcript is hand-written
// JSON with no type checking between the author and the failure, and the
// failure it produces without validation is a panel answering `undefined` three
// turns later. Every complaint names its path.

import {AiInteractionStatus} from '../../model/status';

/** When a turn applies. Absent means "next in sequence". */
export interface Matcher {
  /** The nth request of the session, counting from zero. */
  turn?: number;
  /** The message text, exactly. */
  equals?: string;
  /** A substring, compared without case. */
  contains?: string;
  /** A regular expression source, applied without case. */
  matches?: string;
}

export interface FixtureReply {
  /** What the assistant says. */
  text?: string;
  /** What is shown, when that differs from `text`. */
  displayText?: string;
  /**
   * The parsed structured answer, for a session with a response schema.
   *
   * Written as JSON in the fixture rather than as a string of JSON, so that a
   * malformed proposal is a malformed FIXTURE and says so here, rather than
   * surviving to become a parse error in the panel.
   */
  structured?: unknown;
  /** How the assistant's turn ends. Defaults to `ok`. */
  status?: AiInteractionStatus;
  /**
   * How the USER's turn ends. Defaults to `ok`.
   *
   * Anything but `ok` means the model was never called, so the reply carries
   * the user's message alone — which is the shape the real profanity path
   * produces and the only way to reach that UI without a server.
   */
  userStatus?: AiInteractionStatus;
}

export interface FixtureTurn {
  when?: Matcher;
  /** Milliseconds to wait before answering. Exercises the waiting state. */
  delayMs?: number;
  /**
   * Never answer.
   *
   * For the abort path, which has no other way to be reached: a request that
   * resolves eventually cannot demonstrate that cancelling it works.
   */
  hang?: boolean;
  reply: FixtureReply;
}

export interface Transcript {
  name: string;
  turns: FixtureTurn[];
  /**
   * The reply for a message no turn matched.
   *
   * Never consumed, so it may answer any number of times. Absent means an
   * unmatched message is an error (`FixtureExhausted`) — which is what a test
   * wants, and what a demo page does not.
   */
  fallback?: FixtureReply;
}

const STATUSES: readonly string[] = Object.values(AiInteractionStatus);

class TranscriptError extends Error {
  constructor(path: string, complaint: string) {
    super(`${path}: ${complaint}`);
    this.name = 'TranscriptError';
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const checkStatus = (value: unknown, path: string): void => {
  if (value !== undefined && !STATUSES.includes(value as string)) {
    throw new TranscriptError(
      path,
      `${JSON.stringify(value)} is not a status (one of ${STATUSES.join(', ')})`,
    );
  }
};

const checkMatcher = (value: unknown, path: string): void => {
  if (value === undefined) {
    return;
  }
  if (!isObject(value)) {
    throw new TranscriptError(path, 'must be an object');
  }
  const keys = Object.keys(value);
  const known = ['turn', 'equals', 'contains', 'matches'];
  const unknown = keys.filter(key => !known.includes(key));
  if (unknown.length) {
    throw new TranscriptError(path, `unknown key ${unknown[0]}`);
  }
  if (keys.length !== 1) {
    // Two matchers on one turn would need a rule about how they combine, and
    // every rule anyone proposes is a rule somebody else assumes the opposite
    // of. One matcher, or none.
    throw new TranscriptError(
      path,
      `expected exactly one key, found ${keys.length}`,
    );
  }
  if (value.turn !== undefined && !Number.isInteger(value.turn)) {
    throw new TranscriptError(`${path}.turn`, 'must be a whole number');
  }
  if (value.matches !== undefined) {
    try {
      new RegExp(value.matches as string, 'i');
    } catch (error) {
      throw new TranscriptError(`${path}.matches`, (error as Error).message);
    }
  }
};

const checkReply = (value: unknown, path: string): void => {
  if (!isObject(value)) {
    throw new TranscriptError(path, 'must be an object');
  }
  checkStatus(value.status, `${path}.status`);
  checkStatus(value.userStatus, `${path}.userStatus`);
  if (value.text !== undefined && typeof value.text !== 'string') {
    throw new TranscriptError(`${path}.text`, 'must be a string');
  }
};

/**
 * Read a transcript, or say precisely what is wrong with it.
 *
 * Takes the parsed JSON rather than the text, because the caller may have got
 * it from an `import` as easily as from a file.
 */
export const parseTranscript = (document: unknown): Transcript => {
  if (!isObject(document)) {
    throw new TranscriptError('transcript', 'must be an object');
  }
  if (typeof document.name !== 'string' || !document.name) {
    throw new TranscriptError('transcript.name', 'must be a non-empty string');
  }
  if (!Array.isArray(document.turns)) {
    throw new TranscriptError('transcript.turns', 'must be an array');
  }
  document.turns.forEach((turn: unknown, at: number) => {
    const path = `transcript.turns[${at}]`;
    if (!isObject(turn)) {
      throw new TranscriptError(path, 'must be an object');
    }
    checkMatcher(turn.when, `${path}.when`);
    if (turn.delayMs !== undefined && typeof turn.delayMs !== 'number') {
      throw new TranscriptError(`${path}.delayMs`, 'must be a number');
    }
    checkReply(turn.reply, `${path}.reply`);
  });
  if (document.fallback !== undefined) {
    checkReply(document.fallback, 'transcript.fallback');
  }
  return document as unknown as Transcript;
};

/** Whether `matcher` applies to the `at`th request, whose text is `text`. */
export const matches = (
  matcher: Matcher | undefined,
  text: string,
  at: number,
): boolean => {
  if (matcher === undefined) {
    return true;
  }
  if (matcher.turn !== undefined) {
    return matcher.turn === at;
  }
  if (matcher.equals !== undefined) {
    return matcher.equals === text;
  }
  if (matcher.contains !== undefined) {
    // Without case, because the thing being matched was typed by a student and
    // a fixture that only answers "Bounce" but not "bounce" is a fixture that
    // will be reported as a bug.
    return text.toLowerCase().includes(matcher.contains.toLowerCase());
  }
  if (matcher.matches !== undefined) {
    return new RegExp(matcher.matches, 'i').test(text);
  }
  return true;
};
