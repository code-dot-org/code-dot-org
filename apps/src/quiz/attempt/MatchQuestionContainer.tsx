import React, {useLayoutEffect, useRef, useState} from 'react';

import {QuizQuestionSummary} from '../types';

import AttemptCard from './AttemptCard';
import MatchColumn from './MatchColumn';
import {MatchPairs, MatchSets, toggleMatch} from './matchPairing';
import QuestionDescription from './QuestionDescription';

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
      <div ref={boardRef} className={styles.board}>
        <svg className={styles.lines} aria-hidden="true">
          {linePaths.map(path => (
            <path key={path} d={path} className={styles.line} />
          ))}
        </svg>
        {([0, 1] as const).map(set => (
          <MatchColumn
            key={set}
            matchSets={matchSets}
            set={set}
            pairs={pairs}
            selectedId={selected?.id}
            onClickItem={id => handleClick(set, id)}
            dotRef={dotRef}
            disabled={disabled}
          />
        ))}
      </div>
    </AttemptCard>
  );
};

export default MatchQuestionContainer;
