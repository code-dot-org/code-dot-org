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
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useState} from 'react';

import {Droppable} from '@cdo/apps/codebridge/FileBrowser/Droppable';

import {DraggableOptions} from './DraggableOptions';
import {MatchSolution, PracticeProblem} from './types';

import styles from './practice-problems.module.scss';

interface PracticeSortProps {
  problem: PracticeProblem;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  correctCallback: React.Dispatch<React.SetStateAction<boolean>>;
}

const PracticeSort: FC<PracticeSortProps> = ({
  problem,
  submitted,
  submitCallback,
  correctCallback,
}) => {
  const solutions = problem.solution.map(s => {
    return {...s};
  }) as MatchSolution[];

  const [draggableOptions] = useState<string[]>(
    solutions.map(s => s.option).sort(() => Math.random() - 0.5)
  );
  const [droppableMatches] = useState<string[]>([
    ...new Set(solutions.map(s => s.correct).sort(() => Math.random() - 0.5)),
  ]);

  const [dragAndDropPairs, setDragAndDropPairs] = useState<MatchSolution[]>([]);

  const isCorrect = () => {
    if (solutions.length !== dragAndDropPairs.length) {
      return false;
    }
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
    useSensor(PointerSensor, {
      activationConstraint: {distance: 10},
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.prompt}>
          <Typography variant="h4" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
            {problem.problem_text}
          </Typography>
          <div className={styles.optionsContainer}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndOption}
            >
              <div className={styles.optionsRows}>
                {droppableMatches.map((match, index) => (
                  <Droppable
                    key={match}
                    data={{id: match}}
                    className={styles.dropZone}
                  >
                    <Typography>{match}</Typography>
                    {dragAndDropPairs
                      .filter(sol => sol.correct === match)
                      .map((pair, index) => (
                        <DraggableOptions
                          key={pair.option}
                          option={pair.option}
                          id={pair.option}
                          correct={
                            solutions.find(
                              ({option, correct}) =>
                                option === pair.option &&
                                correct === pair.correct
                            ) !== undefined
                          }
                          showAnswer={submitted}
                        />
                      ))}
                  </Droppable>
                ))}
              </div>
              <div
                className={classNames([
                  styles.optionsRows,
                  styles.optionsRowsWrap,
                ])}
              >
                {draggableOptions
                  .filter(
                    opt =>
                      dragAndDropPairs.find(
                        ({option, correct}) => option === opt
                      ) === undefined
                  )
                  .map((opt, index) => (
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
              disabled={submitted}
              onClick={() => {
                submitCallback(true);
                correctCallback(isCorrect);
              }}
            >
              <Typography variant="body1" className={styles.cardLabel}>
                Submit
              </Typography>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSort;
