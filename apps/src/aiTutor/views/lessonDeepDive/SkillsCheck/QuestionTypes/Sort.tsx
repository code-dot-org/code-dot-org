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
import React, {FC, useState} from 'react';

import {Droppable} from '@cdo/apps/codebridge/FileBrowser/Droppable';

import {
  MatchSolution,
  MultiSolution,
  PracticeProblem,
  ScrambleSolution,
} from '../../types';

import {DraggableOptions} from './DraggableOptions';

import styles from './question.module.scss';
import sortStyles from './sort.module.scss';

interface PracticeSortProps {
  problem: PracticeProblem;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  correctCallback: React.Dispatch<React.SetStateAction<boolean>>;
  studentAnswerCallback: React.Dispatch<
    React.SetStateAction<
      (MultiSolution | ScrambleSolution | MatchSolution)[] | null
    >
  >;
}

const PracticeSort: FC<PracticeSortProps> = ({
  problem,
  submitted,
  submitCallback,
  correctCallback,
  studentAnswerCallback,
}) => {
  const solutions = problem.solution.map(s => ({...s})) as MatchSolution[];

  const [draggableOptions] = useState<string[]>(
    solutions.map(s => s.option).sort(() => Math.random() - 0.5)
  );
  const [droppableMatches] = useState<string[]>([
    ...new Set(solutions.map(s => s.correct).sort(() => Math.random() - 0.5)),
  ]);

  const [dragAndDropPairs, setDragAndDropPairs] = useState<MatchSolution[]>([]);

  const isCorrect = () => {
    if (solutions.length !== dragAndDropPairs.length) return false;
    for (let i = 0; i < dragAndDropPairs.length; i++) {
      if (
        solutions.find(
          ({option, correct}) =>
            option === dragAndDropPairs[i].option &&
            correct === dragAndDropPairs[i].correct
        ) === undefined
      ) {
        return false;
      }
    }
    return true;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 10}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
  );

  const handleDragEndOption = React.useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;
      if (over && active.id !== over.id && !submitted) {
        setDragAndDropPairs([
          ...dragAndDropPairs.filter(
            sol => sol.option !== (active.id as string)
          ),
          {option: active.id as string, correct: over.id as string},
        ]);
      }
    },
    [dragAndDropPairs, setDragAndDropPairs, submitted]
  );

  return (
    <div>
      <div className={styles.questionText}>{problem.problem_text}</div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEndOption}
      >
        <div className={sortStyles.optionsRows}>
          {droppableMatches.map(match => (
            <Droppable
              key={match}
              data={{id: match}}
              className={sortStyles.dropZone}
            >
              <span className={sortStyles.cardLabel}>{match}</span>
              {dragAndDropPairs
                .filter(sol => sol.correct === match)
                .map(pair => (
                  <DraggableOptions
                    key={pair.option}
                    option={pair.option}
                    id={pair.option}
                    correct={
                      solutions.find(
                        ({option, correct}) =>
                          option === pair.option && correct === pair.correct
                      ) !== undefined
                    }
                    showAnswer={submitted}
                  />
                ))}
            </Droppable>
          ))}
        </div>
        <div
          className={[sortStyles.optionsRows, styles.optionsRowsWrap].join(' ')}
        >
          {draggableOptions
            .filter(
              opt =>
                dragAndDropPairs.find(({option}) => option === opt) ===
                undefined
            )
            .map(opt => (
              <DraggableOptions
                key={opt}
                option={opt}
                id={opt}
                correct={false}
                showAnswer={submitted}
              />
            ))}
        </div>
      </DndContext>
      <button
        type="button"
        className={styles.submitButton}
        disabled={submitted}
        onClick={() => {
          submitCallback(true);
          correctCallback(isCorrect());
          studentAnswerCallback([...dragAndDropPairs]);
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default PracticeSort;
