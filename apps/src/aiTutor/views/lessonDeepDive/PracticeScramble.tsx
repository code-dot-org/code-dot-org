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
import {PracticeProblem, ScrambleSolution} from './types';

import styles from './practice-problems.module.scss';

interface PracticeScrambleProps {
  problem: PracticeProblem;
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
  correctCallback: React.Dispatch<React.SetStateAction<boolean>>;
}

const PracticeScramble: FC<PracticeScrambleProps> = ({
  problem,
  submitted,
  submitCallback,
  correctCallback,
}) => {
  const sortedOptions = (
    problem.solution.map(s => {
      return {...s};
    }) as ScrambleSolution[]
  ).sort((a, b) => a.correct - b.correct);

  const [sortableOptions, setSortableOptions] = useState<string[]>(
    sortedOptions.map(s => s.option).sort(() => Math.random() - 0.5)
  );

  const isCorrect = () => {
    for (let i = 0; i < sortableOptions.length; i++) {
      if (sortableOptions[i] !== sortedOptions[i].option) {
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
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableOptions}
                strategy={verticalListSortingStrategy}
              >
                <ol className={styles.optionsContainer}>
                  {sortableOptions.map((option, index) => (
                    <SortableOptionCard
                      key={option}
                      option={option}
                      id={option}
                      correct={option === sortedOptions[index].option}
                      showAnswer={submitted}
                    />
                  ))}
                </ol>
              </SortableContext>
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

export default PracticeScramble;
