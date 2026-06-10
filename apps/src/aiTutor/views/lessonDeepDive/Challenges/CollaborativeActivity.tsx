import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import React, {FC, useCallback, useMemo, useState} from 'react';

import {Droppable} from '@cdo/apps/codebridge/FileBrowser/Droppable';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  CollaborativeCard,
  CollaborativeCategory,
  COLLABORATIVE_SORT_EXAMPLE,
} from './collaborativeExample';
import CollaboratorCard, {CardStatus} from './CollaboratorCard';

import styles from './collaborative-activity.module.scss';

const POOL_ID = 'pool';

const TONE_CLASS: Record<CollaborativeCategory['tone'], string> = {
  low: styles.toneLow,
  medium: styles.toneMedium,
  high: styles.toneHigh,
  critical: styles.toneCritical,
};

// Derive a two-letter avatar from a display name: first + last initial, or the
// first two letters of a single name. Falls back to "ME" when unknown.
const toInitials = (name?: string): string => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'ME';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const CollaborativeActivity: FC = () => {
  const {prompt, categories, cards: seedCards} = COLLABORATIVE_SORT_EXAMPLE;

  const displayName = useAppSelector(
    state => state.currentUser.displayName as string | undefined
  );
  const myInitials = useMemo(() => toInitials(displayName), [displayName]);

  // The deck. Seed cards stand in for classmates' contributions; the student
  // appends their own by drafting.
  const [cards, setCards] = useState<CollaborativeCard[]>(seedCards);
  // Where each card currently sits: a category id, or POOL_ID when unsorted.
  const [placements, setPlacements] = useState<Record<string, string>>(() =>
    Object.fromEntries(seedCards.map(c => [c.id, POOL_ID]))
  );
  const [checked, setChecked] = useState(false);
  const [draftText, setDraftText] = useState('');
  // The risk level the drafter says their card belongs in — its answer key.
  const [draftCategory, setDraftCategory] = useState('');
  const [draftCount, setDraftCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 10}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;
      if (over && !checked) {
        setPlacements(prev => ({
          ...prev,
          [active.id as string]: over.id as string,
        }));
      }
    },
    [checked]
  );

  const handleDraft = useCallback(() => {
    const text = draftText.trim();
    if (!text || !draftCategory) {
      return;
    }
    const id = `draft-${draftCount}`;
    setCards(prev => [
      ...prev,
      // The drafter supplies the answer key, so their card grades like the
      // seed cards once someone sorts it.
      {id, text, initials: myInitials, correctCategoryId: draftCategory},
    ]);
    setPlacements(prev => ({...prev, [id]: POOL_ID}));
    setDraftCount(c => c + 1);
    setDraftText('');
    setDraftCategory('');
  }, [draftText, draftCategory, draftCount, myInitials]);

  const handleReset = useCallback(() => {
    setChecked(false);
    setPlacements(Object.fromEntries(cards.map(c => [c.id, POOL_ID])));
  }, [cards]);

  const statusFor = useCallback(
    (card: CollaborativeCard): CardStatus => {
      if (!checked || !card.correctCategoryId) {
        return 'neutral';
      }
      const placement = placements[card.id];
      if (!placement || placement === POOL_ID) {
        return 'neutral';
      }
      return placement === card.correctCategoryId ? 'correct' : 'incorrect';
    },
    [checked, placements]
  );

  const poolCards = cards.filter(
    c => (placements[c.id] ?? POOL_ID) === POOL_ID
  );

  // Score the seed cards only (drafted cards have no answer key).
  const gradable = cards.filter(c => c.correctCategoryId);
  const correctCount = gradable.filter(
    c => placements[c.id] === c.correctCategoryId
  ).length;

  const renderCard = (card: CollaborativeCard) => (
    <CollaboratorCard
      key={card.id}
      id={card.id}
      text={card.text}
      initials={card.initials}
      status={statusFor(card)}
      disabled={checked}
    />
  );

  return (
    <div className={styles.container}>
      <p className={styles.instructions}>
        In this lesson we learned that AI can hallucinate or be inaccurate. The
        risks that come from those inaccuracies might be no big deal or they
        might have huge consequences. Your classmates have been brainstorming
        scenarios where AI could be used. Sort them by risk level for how
        problematic it would be if the AI was wrong. If you disagree with a
        classmate, go check in with them. Then add your own ideas.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <p className={styles.prompt}>
          {prompt}
          <FontAwesomeV6Icon iconName="arrow-down" />
        </p>

        <Droppable data={{id: POOL_ID}} className={styles.pool}>
          {poolCards.length > 0 ? (
            <div className={styles.poolGrid}>{poolCards.map(renderCard)}</div>
          ) : (
            <p className={styles.poolEmpty}>
              Every card has been sorted. Draft another below.
            </p>
          )}
        </Droppable>

        <div className={styles.draftRow}>
          <input
            type="text"
            className={styles.draftInput}
            value={draftText}
            placeholder="Draft a scenario card for the group..."
            aria-label="Draft a scenario card"
            maxLength={140}
            onChange={e => setDraftText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleDraft();
              }
            }}
          />
          <select
            className={styles.draftSelect}
            value={draftCategory}
            aria-label="Correct risk level for this card"
            onChange={e => setDraftCategory(e.target.value)}
          >
            <option value="" disabled>
              Correct risk level...
            </option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.draftButton}
            onClick={handleDraft}
            disabled={!draftText.trim() || !draftCategory}
          >
            <FontAwesomeV6Icon iconName="plus" />
            Add card
          </button>
        </div>

        <div className={styles.zones}>
          {categories.map(category => {
            const placed = cards.filter(c => placements[c.id] === category.id);
            return (
              <Droppable
                key={category.id}
                data={{id: category.id}}
                className={styles.zone}
              >
                <div className={styles.zoneHeader}>
                  <span
                    className={[styles.zonePill, TONE_CLASS[category.tone]]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {category.label}
                  </span>
                  <span className={styles.zoneDescription}>
                    {category.description}
                  </span>
                </div>
                <div className={styles.zoneCards}>{placed.map(renderCard)}</div>
              </Droppable>
            );
          })}
        </div>
      </DndContext>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.checkButton}
          onClick={() => setChecked(true)}
          disabled={checked}
        >
          Check my answers
          <FontAwesomeV6Icon iconName="arrow-up-right-from-square" />
        </button>
        <button
          type="button"
          className={styles.resetButton}
          onClick={handleReset}
        >
          <FontAwesomeV6Icon iconName="arrow-rotate-right" />
          Reset
        </button>
        {checked && (
          <span className={styles.score}>
            {correctCount} of {gradable.length} sorted correctly
          </span>
        )}
      </div>
    </div>
  );
};

export default CollaborativeActivity;
