// "Show me": put a named place on screen, ring it, and say where it is.
//
// What a link in a lesson's instructions does when it is pressed
// (specs/SHOW_ME_PLAN.md). In order: ask for whatever the place needs
// revealed (`reveal`), wait for that to be drawn, find the target by its
// mark, ring it, scroll it into view, move focus to it, and announce the
// place's words. The learner ASKED, which is what makes moving focus right.
//
// THE RING IS AN ATTRIBUTE ON THE TARGET, `data-callout-ring`, which a style
// turns into an outline (`callouts.module.css`). Nothing is positioned, so
// nothing has to follow a scroll or a resized panel. ONE AT A TIME: pointing
// at a second place takes the first ring off. It also goes when the target
// is used (a click, or Enter or Space on it) and on Escape.
//
// NEVER THE ONLY WAY. When the target cannot be found — a view nobody
// answered for, a script the learner has open — the words are still said and
// nothing else happens. The sentence in the instructions was already enough.

import {placeNamed} from './places';
import {reveal} from './reveal';

export const RING_ATTRIBUTE = 'data-callout-ring';
export const MARK_ATTRIBUTE = 'data-callout';

/** What is said, for the announcer (`CalloutAnnouncer`). */
type Listener = (message: string) => void;
const listeners = new Set<Listener>();
let said = '';

/** Subscribe to what is announced. Returns the way to stop. */
export const onAnnounce = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The last thing announced, for a late subscriber. */
export const lastAnnounced = (): string => said;

const announce = (message: string): void => {
  // A repeat is re-announced: a status region says nothing when its text does
  // not change, and a learner who asks twice should be told twice. The
  // trailing space is invisible and makes the text differ.
  said = message === said ? `${message} ` : message;
  listeners.forEach(listener => listener(said));
};

let ringed: Element | null = null;
let release: (() => void) | null = null;

/** Take the ring off whatever has it. */
export const clearRing = (): void => {
  ringed?.removeAttribute(RING_ATTRIBUTE);
  ringed = null;
  release?.();
  release = null;
};

const ring = (target: Element): void => {
  clearRing();
  target.setAttribute(RING_ATTRIBUTE, 'true');
  ringed = target;
  // Used, or dismissed: either takes it off. Listened for on the document so
  // that Escape works wherever focus has gone since.
  const used = () => clearRing();
  const keyed = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      clearRing();
    }
  };
  target.addEventListener('click', used);
  document.addEventListener('keydown', keyed);
  release = () => {
    target.removeEventListener('click', used);
    document.removeEventListener('keydown', keyed);
  };
};

/** After whatever a reveal changed has been drawn. */
const drawn = (): Promise<void> =>
  new Promise(resolve => {
    // Two turns: React commits on the first, and an effect that registers
    // something — a stage that mounts with the view — runs after it.
    setTimeout(() => setTimeout(resolve, 0), 0);
  });

const targetMarked = (mark: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(
    `[${MARK_ATTRIBUTE}="${CSS.escape(mark)}"]`,
  );

/**
 * Point at a place by name. Answers whether a target was found and ringed;
 * the words are announced either way, when the name is one the lab has.
 */
export async function pointAt(given: string): Promise<boolean> {
  // A name with a space in it — a kind called Energy Ball — arrives
  // percent-encoded, since it travelled as a link's address.
  let name = given;
  try {
    name = decodeURIComponent(given);
  } catch {
    // Not encoded, and with a stray percent sign: taken as it is.
  }
  const place = placeNamed(name);
  if (!place) {
    return false;
  }
  const extra: string[] = [];
  let refused = false;
  for (const step of place.reveals) {
    const answer = reveal(step);
    if (answer === false) {
      refused = true;
      break;
    }
    if (typeof answer === 'string') {
      extra.push(answer);
    }
    await drawn();
  }
  const target = !refused && place.mark ? targetMarked(place.mark) : null;
  if (target) {
    ring(target);
    target.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
    target.focus?.({preventScroll: true});
  } else if (!place.mark) {
    // Not DOM the lab marks (a block in the flyout): whoever revealed it has
    // pointed at it its own way, and an old ring elsewhere would be a lie.
    clearRing();
  }
  announce([place.says, ...extra].join(' '));
  return target !== null;
}
