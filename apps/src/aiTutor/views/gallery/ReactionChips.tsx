import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {FC, useEffect, useRef, useState} from 'react';

import {addReaction, removeReaction} from './reactionsApi';
import {Reaction} from './types';

import styles from './challenge-gallery.module.scss';

// The reaction vocabulary, in the order chips render. Kept in lockstep with
// the server's ChallengeResponseReaction::EMOJIS; the picker offers exactly
// this set. GLYPHS maps each name to its emoji, LABELS to a screen-reader
// name.
const EMOJI_ORDER = ['clap', 'fire', 'smile', 'heart', 'party', 'trophy'];

const GLYPHS: Record<string, string> = {
  clap: '👏',
  fire: '🔥',
  smile: '😄',
  heart: '❤️',
  party: '🎉',
  trophy: '🏆',
};

const LABELS: Record<string, string> = {
  clap: 'Clap',
  fire: 'Fire',
  smile: 'Smile',
  heart: 'Heart',
  party: 'Party',
  trophy: 'Trophy',
};

const glyphFor = (emoji: string) => GLYPHS[emoji] || emoji;
const labelFor = (emoji: string) => LABELS[emoji] || emoji;

const orderIndex = (emoji: string) => {
  const i = EMOJI_ORDER.indexOf(emoji);
  // Unknown emoji (should not happen) sort after the known set, stably.
  return i === -1 ? EMOJI_ORDER.length : i;
};

// Applies a viewer toggle to a reaction list without waiting for the server,
// so the chip responds instantly. Adding the viewer's first reaction of an
// emoji creates its chip; removing their last drops it. Kept sorted by the
// fixed vocabulary so a freshly added chip lands in its stable slot.
const applyToggle = (
  reactions: Reaction[],
  emoji: string,
  reacted: boolean
): Reaction[] => {
  const existing = reactions.find(r => r.emoji === emoji);
  const delta = reacted ? 1 : -1;
  let next: Reaction[];
  if (existing) {
    const count = existing.count + delta;
    next =
      count <= 0
        ? reactions.filter(r => r.emoji !== emoji)
        : reactions.map(r => (r.emoji === emoji ? {...r, count, reacted} : r));
  } else if (reacted) {
    next = [...reactions, {emoji, count: 1, reacted: true}];
  } else {
    next = reactions;
  }
  return [...next].sort((a, b) => orderIndex(a.emoji) - orderIndex(b.emoji));
};

interface ReactionChipsProps {
  // The response these reactions belong to; the react/unreact endpoints hang
  // off it.
  responseId: number;
  reactions: Reaction[];
  // Called with the new tallies whenever the viewer changes their reaction,
  // so an owning view can keep its own copy in sync. Lets a reaction made on
  // the project page show up on that project's gallery card, and vice versa.
  onReactionsChange?: (reactions: Reaction[]) => void;
}

// The interactive row of emoji reactions on a gallery card or project page:
// an "add reaction" button that opens a picker of the full emoji set, and one
// chip per emoji that has reactions. Clicking a chip toggles the viewer's own
// reaction; the chip is highlighted while the viewer is among its reactors.
// Toggles update optimistically and reconcile with the server's authoritative
// tallies, reverting on failure.
const ReactionChips: FC<ReactionChipsProps> = ({
  responseId,
  reactions,
  onReactionsChange,
}) => {
  const [items, setItems] = useState<Reaction[]>(reactions);
  // Emoji with an in-flight request, to keep a chip from firing a second,
  // conflicting toggle before the first resolves.
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Update the displayed tallies and notify the owner in one step, so every
  // state the chips pass through (optimistic, server-reconciled, reverted) is
  // mirrored up.
  const applyItems = (next: Reaction[]) => {
    setItems(next);
    onReactionsChange?.(next);
  };

  // Reseed when the component is reused for a different response (the gallery
  // reuses cards as the listing changes). Own optimistic edits for the same
  // response are preserved.
  useEffect(() => {
    setItems(reactions);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reseed on id, not on every new array identity
  }, [responseId]);

  // Close the picker on an outside click or Escape.
  useEffect(() => {
    if (!pickerOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pickerOpen]);

  const toggle = (emoji: string) => {
    if (pending.has(emoji)) {
      return;
    }
    const wasReacted = items.find(r => r.emoji === emoji)?.reacted ?? false;
    const nowReacted = !wasReacted;
    const previous = items;
    applyItems(applyToggle(items, emoji, nowReacted));
    setPending(prev => new Set(prev).add(emoji));

    const request = nowReacted
      ? addReaction(responseId, emoji)
      : removeReaction(responseId, emoji);
    request
      .then(serverReactions => applyItems(serverReactions))
      .catch(() => applyItems(previous))
      .finally(() =>
        setPending(prev => {
          const next = new Set(prev);
          next.delete(emoji);
          return next;
        })
      );
  };

  const onPick = (emoji: string) => {
    setPickerOpen(false);
    // Picking an emoji already reacted with is a no-op rather than a toggle
    // off — the picker only ever adds.
    if (!(items.find(r => r.emoji === emoji)?.reacted ?? false)) {
      toggle(emoji);
    }
  };

  return (
    <div className={styles.reactions} ref={rootRef}>
      <div className={styles.addReactionWrapper}>
        <button
          type="button"
          className={styles.addReaction}
          aria-label="Add reaction"
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          onClick={() => setPickerOpen(open => !open)}
        >
          <FontAwesomeV6Icon
            iconName="thumbs-up"
            iconStyle="regular"
            aria-hidden="true"
          />
        </button>
        {pickerOpen && (
          <div
            className={styles.picker}
            role="menu"
            aria-label="Add a reaction"
          >
            {EMOJI_ORDER.map(emoji => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                className={styles.pickerOption}
                aria-label={labelFor(emoji)}
                onClick={() => onPick(emoji)}
              >
                <span aria-hidden="true">{glyphFor(emoji)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {items.map(reaction => (
        <button
          key={reaction.emoji}
          type="button"
          className={classNames(
            styles.chip,
            reaction.reacted && styles.chipSelected
          )}
          aria-pressed={reaction.reacted}
          aria-label={`${labelFor(reaction.emoji)}, ${reaction.count} ${
            reaction.count === 1 ? 'reaction' : 'reactions'
          }`}
          disabled={pending.has(reaction.emoji)}
          onClick={() => toggle(reaction.emoji)}
        >
          <span aria-hidden="true">{glyphFor(reaction.emoji)}</span>
          <span className={styles.count}>{reaction.count}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionChips;
