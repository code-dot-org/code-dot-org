import {
  Active,
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  Over,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import {SortableOptionCard} from './SortableOptionCard';
import {
  MatchSolution,
  MultiSolution,
  PracticeProblem,
  ScrambleSolution,
} from './types';

import styles from './practice-problems.module.scss';

interface PracticeMatchProps {
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

const PracticeMatch: FC<PracticeMatchProps> = ({
  problem,
  submitted,
  submitCallback,
  correctCallback,
  studentAnswerCallback,
}) => {
  const solutions = problem.solution.map(s => {
    return {...s};
  }) as MatchSolution[];

  const [sortableOptions, setSortableOptions] = useState<string[]>(
    solutions.map(s => s.option).sort(() => Math.random() - 0.5)
  );

  const [sortableMatches, setSortableMatches] = useState<string[]>(
    solutions.map(s => s.correct).sort(() => Math.random() - 0.5)
  );

  const isCorrect = () => {
    for (let i = 0; i < sortableOptions.length; i++) {
      if (
        solutions.find(
          ({option, correct}) =>
            option === sortableOptions[i] && correct === sortableMatches[i]
        ) === undefined
      ) {
        return false;
      }
    }
    return true;
  };

  function moveOption(
    active: Active,
    over: Over
  ): React.SetStateAction<string[]> {
    return items => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      return arrayMove(items, oldIndex, newIndex);
    };
  }

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
        setSortableOptions(moveOption(active, over));
      }
    },
    [setSortableOptions, submitted]
  );

  const handleDragEndMatch = React.useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;

      if (over && active.id !== over.id && !submitted) {
        setSortableMatches(moveOption(active, over));
      }
    },
    [setSortableMatches, submitted]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.prompt}>
          <Typography variant="h4" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
            {problem.problem_text}
          </Typography>
          <div className={styles.optionsContainer}>
            <div className={styles.optionsRows}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndOption}
              >
                <SortableContext
                  items={sortableOptions}
                  strategy={verticalListSortingStrategy}
                >
                  <ol className={styles.optionsContainer}>
                    {sortableOptions.map((opt, index) => (
                      <SortableOptionCard
                        key={opt}
                        option={opt}
                        id={opt}
                        correct={
                          solutions.find(
                            ({option, correct}) =>
                              option === opt &&
                              correct === sortableMatches[index]
                          ) !== undefined
                        }
                        showAnswer={submitted}
                      />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndMatch}
              >
                <SortableContext
                  items={sortableMatches}
                  strategy={verticalListSortingStrategy}
                >
                  <ol className={styles.optionsContainer}>
                    {sortableMatches.map((corr, index) => (
                      <SortableOptionCard
                        key={corr}
                        option={corr}
                        id={corr}
                        correct={
                          solutions.find(
                            ({option, correct}) =>
                              option === sortableOptions[index] &&
                              correct === corr
                          ) !== undefined
                        }
                        showAnswer={submitted}
                      />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>
            </div>
            <button
              type="button"
              disabled={submitted}
              onClick={() => {
                submitCallback(true);
                correctCallback(isCorrect);
                studentAnswerCallback(
                  sortableOptions.map((opt, index) => {
                    return {
                      option: opt,
                      correct: sortableMatches[index],
                    };
                  })
                );
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

export default PracticeMatch;
