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

import styles from './question.module.scss';
import scrambleStyles from './scramble.module.scss';

interface PracticeScrambleProps {
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

const PracticeScramble: FC<PracticeScrambleProps> = ({
  problem,
  submitted,
  submitCallback,
  correctCallback,
  studentAnswerCallback,
}) => {
  const sortedOptions = (
    problem.solution.map(s => ({...s})) as ScrambleSolution[]
  ).sort((a, b) => a.correct - b.correct);

  const [sortableOptions, setSortableOptions] = useState<string[]>(
    sortedOptions.map(s => s.option).sort(() => Math.random() - 0.5)
  );

  const isCorrect = () => {
    for (let i = 0; i < sortableOptions.length; i++) {
      if (sortableOptions[i] !== sortedOptions[i].option) return false;
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

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;
      if (over && active.id !== over.id && !submitted) {
        setSortableOptions(moveOption(active, over));
      }
    },
    [setSortableOptions, submitted]
  );

  return (
    <div>
      <div className={styles.questionText}>{problem.problem_text}</div>
      <div className={scrambleStyles.optionsContainer}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableOptions}
            strategy={verticalListSortingStrategy}
          >
            <div className={scrambleStyles.optionsContainer}>
              {sortableOptions.map((option, index) => (
                <SortableOptionCard
                  key={option}
                  option={option}
                  id={option}
                  correct={option === sortedOptions[index].option}
                  showAnswer={submitted}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
                correct: index,
              }))
            );
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default PracticeScramble;
