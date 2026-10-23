import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useLayoutEffect, useRef, useState} from 'react';

import {QuizQuestionSummary} from '../types';
import {formatChoiceLetter} from '../utils';

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

  // Each first-set item has a letter by position; a second-set item shows
  // its partner's letter once paired.
  const letterOf = (id: string) => {
    const index = matchSets[0].findIndex(item => item.id === id);
    return index === -1 ? undefined : formatChoiceLetter(index);
  };
  const labelOf = (id: string) => {
    const first = matchSets[0].find(item => item.id === id);
    if (first) {
      return `${letterOf(id)}. ${first.text}`;
    }
    return matchSets[1].find(item => item.id === id)?.text;
  };

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
        const letter =
          set === 0 ? letterOf(item.id) : partnerId && letterOf(partnerId);
        return (
          <button
            key={item.id}
            type="button"
            className={classNames(styles.card, set === 1 && styles.second, {
              [styles.cardActive]: partnerId || isSelected,
            })}
            aria-pressed={isSelected}
            aria-label={
              partnerId
                ? `${labelOf(item.id)}, matched with ${labelOf(partnerId)}`
                : labelOf(item.id)
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
            <span
              ref={element => {
                if (element) {
                  dotRefs.current.set(item.id, element);
                } else {
                  dotRefs.current.delete(item.id);
                }
              }}
              className={styles.dot}
              aria-hidden="true"
            >
              {letter}
            </span>
          </button>
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
