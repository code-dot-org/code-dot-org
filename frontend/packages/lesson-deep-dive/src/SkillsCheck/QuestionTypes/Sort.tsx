import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';

import {
  MatchSolution,
  MultiSolution,
  PracticeProblem,
  ScrambleSolution,
} from '../../types';

import {DraggableOptions} from './DraggableOptions';

import styles from './question.module.scss';
import sortStyles from './sort.module.scss';

interface DroppableProps {
  data: {id: string};
  className: string;
  children: ReactNode;
}

const Droppable: FC<DroppableProps> = ({data, className, children}) => {
  const {setNodeRef} = useDroppable({id: data.id, data});
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
};

interface PracticeSortProps {
  problem: PracticeProblem;
  submitted: boolean;
  submitCallback: Dispatch<SetStateAction<boolean>>;
  correctCallback: Dispatch<SetStateAction<boolean>>;
  studentAnswerCallback: Dispatch<
    SetStateAction<(MultiSolution | ScrambleSolution | MatchSolution)[] | null>
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
    solutions.map(s => s.option).sort(() => Math.random() - 0.5),
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
            correct === dragAndDropPairs[i].correct,
        ) === undefined
      ) {
        return false;
      }
    }
    return true;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 10}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
  );

  const handleDragEndOption = useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;
      if (over && active.id !== over.id && !submitted) {
        setDragAndDropPairs([
          ...dragAndDropPairs.filter(
            sol => sol.option !== (active.id as string),
          ),
          {option: active.id as string, correct: over.id as string},
        ]);
      }
    },
    [dragAndDropPairs, setDragAndDropPairs, submitted],
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
                          option === pair.option && correct === pair.correct,
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
                undefined,
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
