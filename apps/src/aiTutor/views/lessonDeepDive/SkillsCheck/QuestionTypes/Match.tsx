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

import {
  MatchSolution,
  MultiSolution,
  PracticeProblem,
  ScrambleSolution,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';

import {SortableOptionCard} from './SortableOptionCard';

import matchStyles from './match.module.scss';
import styles from './question.module.scss';

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
  const solutions = problem.solution.map(s => ({...s})) as MatchSolution[];

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
    useSensor(PointerSensor, {activationConstraint: {distance: 10}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
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
    <div>
      <div className={styles.questionText}>{problem.problem_text}</div>
      <div className={matchStyles.optionsRows}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndOption}
        >
          <SortableContext
            items={sortableOptions}
            strategy={verticalListSortingStrategy}
          >
            <span className={matchStyles.optionsContainer}>
              {sortableOptions.map((opt, index) => (
                <SortableOptionCard
                  key={opt}
                  option={opt}
                  id={opt}
                  correct={
                    solutions.find(
                      ({option, correct}) =>
                        option === opt && correct === sortableMatches[index]
                    ) !== undefined
                  }
                  showAnswer={submitted}
                />
              ))}
            </span>
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
            <span className={matchStyles.optionsContainer}>
              {sortableMatches.map((corr, index) => (
                <SortableOptionCard
                  key={corr}
                  option={corr}
                  id={corr}
                  correct={
                    solutions.find(
                      ({option, correct}) =>
                        option === sortableOptions[index] && correct === corr
                    ) !== undefined
                  }
                  showAnswer={submitted}
                />
              ))}
            </span>
          </SortableContext>
        </DndContext>
      </div>
      <button
        type="button"
        className={styles.submitButton}
        disabled={submitted}
        onClick={() => {
          submitCallback(true);
          correctCallback(isCorrect());
          studentAnswerCallback(
            sortableOptions.map((opt, index) => ({
              option: opt,
              correct: sortableMatches[index],
            }))
          );
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default PracticeMatch;
