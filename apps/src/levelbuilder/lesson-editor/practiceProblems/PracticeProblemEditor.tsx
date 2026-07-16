import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {PracticeProblemTypes} from '@cdo/generated-scripts/sharedConstants';

import {
  LessonObjective,
  PracticeProblemData,
  SolutionEntry,
  problemTypeLabel,
} from './types';

import moduleStyles from './practiceProblems.module.scss';

interface PracticeProblemEditorProps {
  problem: PracticeProblemData;
  objectives: LessonObjective[];
  onSave: (updated: PracticeProblemData) => void;
  onCancel: () => void;
}

// Full structured editor for a single practice problem, with a solution editor
// tailored to each problem type. Used both for AI-generated candidates during
// review and for editing already-persisted problems.
const PracticeProblemEditor: React.FC<PracticeProblemEditorProps> = ({
  problem,
  objectives,
  onSave,
  onCancel,
}) => {
  const {problemType} = problem;
  const [problemText, setProblemText] = useState(problem.problemText);
  const [solution, setSolution] = useState<SolutionEntry[]>(
    problem.solution.map(entry => ({...entry}))
  );
  const [objectiveIds, setObjectiveIds] = useState<number[]>(
    problem.objectiveIds ?? []
  );

  const isMultipleChoice =
    problemType === PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE ||
    problemType === PracticeProblemTypes.MULTIPLE_CHOICE_MULTI;

  const updateEntry = (index: number, patch: Partial<SolutionEntry>) => {
    setSolution(prev =>
      prev.map((entry, i) => (i === index ? {...entry, ...patch} : entry))
    );
  };

  const removeEntry = (index: number) => {
    setSolution(prev => prev.filter((_, i) => i !== index));
  };

  const addEntry = () => {
    setSolution(prev => {
      let blank: SolutionEntry;
      if (problemType === PracticeProblemTypes.SCRAMBLE) {
        blank = {option: '', correct: prev.length};
      } else if (isMultipleChoice) {
        blank = {option: '', correct: false};
      } else {
        blank = {option: '', correct: ''};
      }
      return [...prev, blank];
    });
  };

  // Single-select: exactly one correct. Multi-select: independent toggles.
  const setCorrectBoolean = (index: number, value: boolean) => {
    if (problemType === PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE) {
      setSolution(prev =>
        prev.map((entry, i) => ({...entry, correct: i === index && value}))
      );
    } else {
      updateEntry(index, {correct: value});
    }
  };

  const moveEntry = (index: number, delta: number) => {
    setSolution(prev => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleObjective = (id: number) => {
    setObjectiveIds(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    // Scramble encodes correct order as the row index.
    const finalizedSolution =
      problemType === PracticeProblemTypes.SCRAMBLE
        ? solution.map((entry, i) => ({option: entry.option, correct: i}))
        : solution;
    onSave({
      ...problem,
      problemText,
      solution: finalizedSolution,
      objectiveIds,
    });
  };

  const renderSolutionEditor = () => {
    switch (problemType) {
      case PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE:
      case PracticeProblemTypes.MULTIPLE_CHOICE_MULTI:
        return solution.map((entry, i) => (
          <div key={i} className={moduleStyles.editorRow}>
            <input
              type={
                problemType === PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE
                  ? 'radio'
                  : 'checkbox'
              }
              name="correct-option"
              aria-label={`Option ${i + 1} is correct`}
              checked={entry.correct === true}
              onChange={e => setCorrectBoolean(i, e.target.checked)}
            />
            <input
              type="text"
              aria-label={`Option ${i + 1} text`}
              value={entry.option}
              onChange={e => updateEntry(i, {option: e.target.value})}
            />
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              aria-label={`Remove option ${i + 1}`}
              onClick={() => removeEntry(i)}
            >
              <i className="fa-solid fa-trash" aria-hidden="true" />
            </MuiButton>
          </div>
        ));

      case PracticeProblemTypes.MATCH:
      case PracticeProblemTypes.SORT: {
        const rightLabel =
          problemType === PracticeProblemTypes.MATCH ? 'matches' : 'category';
        return solution.map((entry, i) => (
          <div key={i} className={moduleStyles.editorRow}>
            <input
              type="text"
              aria-label={`Option ${i + 1}`}
              value={entry.option}
              onChange={e => updateEntry(i, {option: e.target.value})}
            />
            <Typography variant="body3" component="span">
              {rightLabel}
            </Typography>
            <input
              type="text"
              aria-label={`Option ${i + 1} ${rightLabel}`}
              value={String(entry.correct)}
              onChange={e => updateEntry(i, {correct: e.target.value})}
            />
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              aria-label={`Remove option ${i + 1}`}
              onClick={() => removeEntry(i)}
            >
              <i className="fa-solid fa-trash" aria-hidden="true" />
            </MuiButton>
          </div>
        ));
      }

      case PracticeProblemTypes.SCRAMBLE:
        return solution.map((entry, i) => (
          <div key={i} className={moduleStyles.editorRow}>
            <Typography variant="body3" component="span">
              {i + 1}.
            </Typography>
            <input
              type="text"
              aria-label={`Item ${i + 1}`}
              value={entry.option}
              onChange={e => updateEntry(i, {option: e.target.value})}
            />
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              aria-label={`Move item ${i + 1} up`}
              disabled={i === 0}
              onClick={() => moveEntry(i, -1)}
            >
              <i className="fa-solid fa-arrow-up" aria-hidden="true" />
            </MuiButton>
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              aria-label={`Move item ${i + 1} down`}
              disabled={i === solution.length - 1}
              onClick={() => moveEntry(i, 1)}
            >
              <i className="fa-solid fa-arrow-down" aria-hidden="true" />
            </MuiButton>
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              aria-label={`Remove option ${i + 1}`}
              onClick={() => removeEntry(i)}
            >
              <i className="fa-solid fa-trash" aria-hidden="true" />
            </MuiButton>
          </div>
        ));

      default:
        return null;
    }
  };

  const persistedObjectives = objectives.filter(o => o.id);

  return (
    <div>
      <Typography
        variant="overline2"
        component="div"
        className={moduleStyles.hint}
      >
        {problemTypeLabel(problemType)}
      </Typography>

      <label className={moduleStyles.field} htmlFor="practice-problem-text">
        <Typography variant="strong" component="span">
          Question
        </Typography>
        <textarea
          id="practice-problem-text"
          className={moduleStyles.textarea}
          rows={2}
          value={problemText}
          onChange={e => setProblemText(e.target.value)}
        />
      </label>

      <Typography variant="strong" component="div">
        Answer
      </Typography>
      {renderSolutionEditor()}
      <MuiButton
        variant="outlined"
        color="secondary"
        size="small"
        onClick={addEntry}
      >
        Add option
      </MuiButton>

      <fieldset className={moduleStyles.objectives}>
        <legend>
          <Typography variant="strong" component="span">
            Objectives
          </Typography>
        </legend>
        {persistedObjectives.length === 0 ? (
          <Typography variant="body3" className={moduleStyles.hint}>
            This lesson has no saved objectives. Save the lesson to associate
            them.
          </Typography>
        ) : (
          <div className={moduleStyles.objectiveCheckboxes}>
            {persistedObjectives.map(o => (
              <Checkbox
                key={o.id}
                name={`objective-${o.id}`}
                label={o.description}
                checked={objectiveIds.includes(o.id as number)}
                onChange={() => toggleObjective(o.id as number)}
              />
            ))}
          </div>
        )}
      </fieldset>

      <div className={moduleStyles.reviewActions}>
        <MuiButton variant="contained" color="primary" onClick={handleSave}>
          Save
        </MuiButton>
        <MuiButton variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </MuiButton>
      </div>
    </div>
  );
};

export default PracticeProblemEditor;
