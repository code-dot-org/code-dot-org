import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useLayoutEffect, useRef, useState} from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';
import {MatchPairs, partnerOf, toggleMatch} from './matchPairing';
import QuestionDescription from './QuestionDescription';

import styles from './match-question-container.module.scss';

export interface MatchItem {
  id: string;
  text: string;
}

export interface MatchQuestionContainerProps {
  question: Omit<QuizQuestionSummary, 'page'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  matchSets: [MatchItem[], MatchItem[]];
  pairs: MatchPairs;
  onChangePairs: (pairs: MatchPairs) => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
  disabled?: boolean;
}

type SetIndex = 0 | 1;

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
    set: SetIndex;
    id: string;
  } | null>(null);
  const [linePaths, setLinePaths] = useState<string[]>([]);
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
        pairs.flatMap(([firstId, secondId]) => {
          const start = centerOf(firstId);
          const end = centerOf(secondId);
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

  const textOf = (id: string) =>
    [...matchSets[0], ...matchSets[1]].find(item => item.id === id)?.text;

  const handleClick = (set: SetIndex, id: string) => {
    if (!selected || selected.set === set) {
      setSelected(selected?.id === id ? null : {set, id});
      return;
    }
    onChangePairs(
      toggleMatch(pairs, set === 1 ? [selected.id, id] : [id, selected.id])
    );
    setSelected(null);
  };

  const renderColumn = (set: SetIndex) => (
    <div className={styles.column}>
      {matchSets[set].map(item => {
        const partnerId = partnerOf(pairs, item.id);
        const isSelected = selected?.id === item.id;
        return (
          <div
            key={item.id}
            className={classNames(styles.option, set === 1 && styles.second)}
          >
            <button
              type="button"
              className={classNames(styles.card, {
                [styles.cardPaired]: partnerId,
                [styles.cardSelected]: isSelected,
              })}
              aria-pressed={isSelected}
              aria-label={
                partnerId
                  ? `${item.text}, matched with ${textOf(partnerId)}`
                  : item.text
              }
              onClick={() => handleClick(set, item.id)}
              disabled={disabled}
            >
              <Typography
                variant={set === 0 ? 'body2' : 'body3'}
                component="span"
                className={classNames(set === 0 && styles.firstText)}
              >
                {item.text}
              </Typography>
            </button>
            <span
              ref={element => {
                if (element) {
                  dotRefs.current.set(item.id, element);
                } else {
                  dotRefs.current.delete(item.id);
                }
              }}
              className={classNames(styles.dot, {
                [styles.dotActive]: partnerId || isSelected,
              })}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <AttemptCard
      label={questionLabel}
      title={question.questionTitle}
      headingRef={headingRef}
      description={<QuestionDescription markdown={question.description} />}
    >
      <div ref={boardRef} className={styles.board}>
        <svg className={styles.lines} aria-hidden="true">
          {linePaths.map(path => (
            <path key={path} d={path} className={styles.line} />
          ))}
        </svg>
        {renderColumn(0)}
        {renderColumn(1)}
      </div>
    </AttemptCard>
  );
};

export default MatchQuestionContainer;
