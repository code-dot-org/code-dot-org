import React, {useLayoutEffect, useRef, useState} from 'react';

import MatchColumn from './MatchColumn';
import {MatchPairs, MatchSelection, MatchSets, MatchSide} from './types';

import styles from './match-question-container.module.scss';

export interface MatchBoardProps {
  matchSets: MatchSets;
  pairs: MatchPairs;
  // Omit for a read-only board, as in results.
  onClickItem?: (side: MatchSide, id: string) => void;
  selection?: MatchSelection;
  disabled?: boolean;
  label: string;
  describedBy?: string;
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

// The two columns of cards, with a line drawn between each pair's dots.
const MatchBoard: React.FunctionComponent<MatchBoardProps> = ({
  matchSets,
  pairs,
  onClickItem,
  selection = {},
  disabled,
  label,
  describedBy,
}) => {
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
    board
      .querySelectorAll(`.${styles.card}`)
      .forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [pairs, matchSets]);

  const dotRef = (id: string, element: HTMLElement | null) => {
    if (element) {
      dotRefs.current.set(id, element);
    } else {
      dotRefs.current.delete(id);
    }
  };

  return (
    <div
      ref={boardRef}
      className={styles.board}
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
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
          selectedId={selection[side]}
          onClickItem={onClickItem && (id => onClickItem(side, id))}
          dotRef={dotRef}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default MatchBoard;
