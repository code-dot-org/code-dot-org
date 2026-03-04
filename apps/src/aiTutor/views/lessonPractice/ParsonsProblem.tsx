import React, {FC, useEffect, useMemo, useState} from 'react';
import Confetti from 'react-dom-confetti';

import styles from '@cdo/apps/aiTutor/views/lessonPractice/lesson-practice-ai-tutor.module.scss';

type CodeLine = {id: string; text: string; expectedPosition: number};

const DEFAULT_LINES: CodeLine[] = [
  {id: '1', text: 'Problem!', expectedPosition: 5},
  {id: '2', text: 'Dan!', expectedPosition: 1},
  {id: '3', text: 'Look,', expectedPosition: 0},
  {id: '4', text: "It's", expectedPosition: 2},
  {id: '5', text: 'a', expectedPosition: 3},
  {id: '6', text: 'Parsons', expectedPosition: 4},
];

const reorder = (list: CodeLine[], startIndex: number, endIndex: number) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/**
 * Parsons Problem style drag-and-drop workspace.
 * Students rearrange code lines to form a working solution.
 */
const ParsonsProblem: FC<{
  initialLines?: CodeLine[];
  onReorder?: (lines: CodeLine[]) => void;
  expectedOrder?: string[];
}> = ({initialLines = DEFAULT_LINES, onReorder, expectedOrder}) => {
  const [lines, setLines] = useState<CodeLine[]>(initialLines);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  const solutionOrder = useMemo(
    () => expectedOrder || initialLines.map(line => line.id),
    [expectedOrder, initialLines]
  );

  const handleDragStart = (index: number) => () => {
    setDragIndex(index);
  };

  const handleDragOver = (index: number) => (event: React.DragEvent) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      return;
    }
    setLines(current => {
      const updated = reorder(current, dragIndex, index);
      setDragIndex(index);
      onReorder?.(updated);
      return updated;
    });
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const assembledCode = useMemo(
    () => lines.map(line => line.text).join('\n'),
    [lines]
  );

  useEffect(() => {
    const isCorrect =
      lines.length === solutionOrder.length &&
      lines.every((line, idx) => line.expectedPosition === idx);

    setConfettiActive(isCorrect);
  }, [lines, solutionOrder]);

  return (
    <div className={styles.parsonsProblem}>
      <p className={styles.parsonsIntro}>
        Drag the lines to build a correct solution.
      </p>
      <div className={styles.parsonsWorkspace} role="list">
        {lines.map((line, index) => (
          <div
            key={line.id}
            role="listitem"
            className={`${styles.codeLine} ${
              dragIndex === index ? styles.codeLineDragging : ''
            }`}
            draggable={true}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDragEnd={handleDragEnd}
          >
            <span className={styles.lineNumber}>{index + 1}</span>
            <span className={styles.lineText}>{line.text}</span>
          </div>
        ))}
      </div>
      <div className={styles.parsonsPreview}>
        <strong>Preview</strong>
        <pre>{assembledCode}</pre>
      </div>
      <div className={styles.parsonsConfetti}>
        <Confetti active={confettiActive} />
      </div>
    </div>
  );
};

export default ParsonsProblem;
