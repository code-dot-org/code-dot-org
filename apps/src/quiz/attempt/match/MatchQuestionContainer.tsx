import React, {useId, useLayoutEffect, useRef, useState} from 'react';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

import AttemptCard from '../AttemptCard';
import QuestionDescription from '../QuestionDescription';

import MatchColumn from './MatchColumn';
import {MatchPairs, MatchSets, MatchSide} from './types';
import {hasPair, labelOf, removePair, setPair} from './utils';

import styles from './match-question-container.module.scss';

export interface MatchQuestionContainerProps {
  question: Omit<QuizQuestionSummary, 'page'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  matchSets: MatchSets;
  pairs: MatchPairs;
  onChangePairs: (pairs: MatchPairs) => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
}

// An S-curve leaving and entering each dot horizontally. The control points
// follow the direction of travel, so it also curves correctly right-to-left.
function curvePath(start: Point, end: Point): string {
  const dx = end.x - start.x;
  const offset = Math.sign(dx) * Math.max(Math.abs(dx) / 2, 20);
  return `M ${start.x} ${start.y} C ${start.x + offset} ${start.y}, ${
    end.x - offset
  } ${end.y}, ${end.x} ${end.y}`;
}

const MatchQuestionContainer: React.FunctionComponent<
  MatchQuestionContainerProps
> = ({
  question,
  questionLabel,
  matchSets,
  pairs,
  onChangePairs,
  headingRef,
  disabled,
}) => {
  const [selected, setSelected] = useState<{
    side: MatchSide;
    id: string;
  } | null>(null);
  const [linePaths, setLinePaths] = useState<string[]>([]);
  // Read out by a live region: a screen reader won't re-announce the name
  // of the card that's already focused when a pairing changes it.
  const [announcement, setAnnouncement] = useState('');
  const instructionsId = useId();
  const boardRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef(new Map<string, HTMLElement>());

  // Measured after layout, and again whenever a card changes size, since
  // the line endpoints are wherever the dots actually render.
  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }
    const measure = () => {
      const boardRect = board.getBoundingClientRect();
      const centerOf = (id: string): Point | null => {
        const rect = dotRefs.current.get(id)?.getBoundingClientRect();
        return rect
          ? {
              x: rect.left - boardRect.left + rect.width / 2,
              y: rect.top - boardRect.top + rect.height / 2,
            }
          : null;
      };
      setLinePaths(
        pairs.flatMap(([startId, endId]) => {
          const start = centerOf(startId);
          const end = centerOf(endId);
          return start && end ? [curvePath(start, end)] : [];
        })
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    board.querySelectorAll('button').forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [pairs, matchSets]);

  const handleClick = (side: MatchSide, id: string) => {
    if (!selected || selected.side === side) {
      setSelected(selected?.id === id ? null : {side, id});
      return;
    }
    const pair: [string, string] =
      side === 'end' ? [selected.id, id] : [id, selected.id];
    // Choosing a pair that already exists unmatches it.
    const isUnmatch = hasPair(pairs, pair);
    const startLabel = labelOf(matchSets, pair[0]);
    const endLabel = labelOf(matchSets, pair[1]);
    setAnnouncement(
      isUnmatch
        ? `Unmatched ${startLabel} from ${endLabel}.`
        : `Matched ${startLabel} with ${endLabel}.`
    );
    onChangePairs(isUnmatch ? removePair(pairs, pair) : setPair(pairs, pair));
    setSelected(null);
  };

  const dotRef = (id: string, element: HTMLElement | null) => {
    if (element) {
      dotRefs.current.set(id, element);
    } else {
      dotRefs.current.delete(id);
    }
  };

  return (
    <AttemptCard
      label={questionLabel}
      title={question.questionTitle}
      headingRef={headingRef}
      description={<QuestionDescription markdown={question.description} />}
    >
      <p id={instructionsId} className={styles.srOnly}>
        Select an item in one column, then an item in the other column to match
        them. Select a matched pair again to unmatch it.
      </p>
      <div
        ref={boardRef}
        className={styles.board}
        role="group"
        aria-label={question.questionTitle}
        aria-describedby={instructionsId}
      >
        <svg className={styles.lines} aria-hidden="true">
          {linePaths.map(path => (
            <path key={path} d={path} className={styles.line} />
          ))}
        </svg>
        {(['start', 'end'] as const).map(side => (
          <MatchColumn
            key={side}
            matchSets={matchSets}
            side={side}
            pairs={pairs}
            selectedId={selected?.id}
            onClickItem={id => handleClick(side, id)}
            dotRef={dotRef}
            disabled={disabled}
          />
        ))}
      </div>
      <div role="status" className={styles.srOnly}>
        {announcement}
      </div>
    </AttemptCard>
  );
};

export default MatchQuestionContainer;
