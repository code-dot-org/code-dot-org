import {Typography, Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {PracticeProblemTypes} from '@cdo/generated-scripts/sharedConstants';

import LessonEditorDialog from '../LessonEditorDialog';

import PracticePreview from './PracticePreview';
import PracticeProblemEditor from './PracticeProblemEditor';
import {
  LessonObjective,
  PracticeProblemData,
  SolutionEntry,
  problemTypeLabel,
} from './types';

import moduleStyles from './practiceProblems.module.scss';

const PROBLEM_TYPE_VALUES: string[] = Object.values(PracticeProblemTypes);

// A blank problem of the given type, seeded with two empty options so the
// manual editor opens with something to fill in.
const blankProblem = (problemType: string): PracticeProblemData => {
  let solution: SolutionEntry[];
  switch (problemType) {
    case PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE:
      solution = [
        {option: '', correct: true},
        {option: '', correct: false},
      ];
      break;
    case PracticeProblemTypes.MULTIPLE_CHOICE_MULTI:
      solution = [
        {option: '', correct: false},
        {option: '', correct: false},
      ];
      break;
    case PracticeProblemTypes.SCRAMBLE:
      solution = [
        {option: '', correct: 0},
        {option: '', correct: 1},
      ];
      break;
    default: // match, sort
      solution = [
        {option: '', correct: ''},
        {option: '', correct: ''},
      ];
  }
  return {
    problemType,
    problemText: '',
    solution,
    objectiveIds: [],
    active: true,
  };
};

// Compact per-type rendering of a problem's answer for the table. Marks the
// correct multiple-choice options, pairs matches, tags sort categories, and
// lists scramble items in their correct order.
const solutionSummary = (problem: PracticeProblemData): string[] => {
  const {problemType, solution} = problem;
  switch (problemType) {
    case PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE:
    case PracticeProblemTypes.MULTIPLE_CHOICE_MULTI:
      return solution.map(s => `${s.option}${s.correct === true ? ' ✓' : ''}`);
    case PracticeProblemTypes.MATCH:
      return solution.map(s => `${s.option} → ${String(s.correct)}`);
    case PracticeProblemTypes.SORT:
      return solution.map(s => `${s.option} (${String(s.correct)})`);
    case PracticeProblemTypes.SCRAMBLE:
      return [...solution]
        .sort((a, b) => Number(a.correct) - Number(b.correct))
        .map((s, i) => `${i + 1}. ${s.option}`);
    default:
      return solution.map(s => s.option);
  }
};

interface PracticeProblemsPanelProps {
  lessonId: number;
  objectives: LessonObjective[];
  initialProblems: PracticeProblemData[];
}

const GENERATION_BATCH_SIZE = 5;

const csrfToken = (): string | undefined =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

// The Practice Problems section of the Tutor Deep Dive editor: lists the
// lesson's persisted problems, and drives an AI generate -> review (preview /
// accept / reject / edit) -> persist flow. Generation is a dedicated
// server-side OpenAI call (POST /practice_problems/generate); the server
// assembles the lesson context. Accepted problems are saved immediately via
// the /practice_problems endpoints, mirroring the videos panel; objective
// association follows the same through-objectives model.
const PracticeProblemsPanel: React.FC<PracticeProblemsPanelProps> = ({
  lessonId,
  objectives,
  initialProblems,
}) => {
  const [problems, setProblems] =
    useState<PracticeProblemData[]>(initialProblems);
  const [candidates, setCandidates] = useState<PracticeProblemData[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(false);
  const [editingProblem, setEditingProblem] =
    useState<PracticeProblemData | null>(null);
  // Manual-add flow: `addingManually` opens the dialog; `manualType` is null
  // while the user is still picking a type, then the chosen type once selected.
  const [addingManually, setAddingManually] = useState(false);
  const [manualType, setManualType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const objectiveDescriptionsById = new Map(
    objectives.filter(o => o.id).map(o => [o.id as number, o.description])
  );

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/practice_problems/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken() ?? '',
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          count: GENERATION_BATCH_SIZE,
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const generated: PracticeProblemData[] = await response.json();
      const newCandidates: PracticeProblemData[] = generated.map(g => ({
        ...g,
        active: true,
      }));
      if (newCandidates.length === 0) {
        setError(
          'The model returned no new problems (all were duplicates). Try again.'
        );
        return;
      }
      setCandidates(prev => {
        const combined = [...prev, ...newCandidates];
        if (!reviewing) {
          setReviewIndex(0);
          setReviewing(true);
        }
        return combined;
      });
    } catch (e) {
      setError(`Generation failed: ${e}`);
    } finally {
      setGenerating(false);
    }
  };

  // Drop the candidate at the current index and keep the index pointing at the
  // next one (clamping / closing when the queue empties).
  const dropCurrentCandidate = () => {
    setCandidates(prev => {
      const next = prev.filter((_, i) => i !== reviewIndex);
      if (next.length === 0) {
        setReviewing(false);
        setReviewIndex(0);
      } else if (reviewIndex >= next.length) {
        setReviewIndex(next.length - 1);
      }
      return next;
    });
    setEditingCandidate(false);
  };

  const persist = async (
    problem: PracticeProblemData,
    method: 'POST' | 'PATCH',
    url: string
  ): Promise<PracticeProblemData> => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken() ?? '',
      },
      body: JSON.stringify({
        problem_type: problem.problemType,
        problem_text: problem.problemText,
        solution: problem.solution,
        active: problem.active ?? true,
        lesson_id: lessonId,
        objective_ids: problem.objectiveIds,
      }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  };

  const handleAccept = async () => {
    try {
      const saved = await persist(
        candidates[reviewIndex],
        'POST',
        '/practice_problems'
      );
      setProblems(prev => [...prev, saved]);
      dropCurrentCandidate();
    } catch (e) {
      setError(`Failed to save problem: ${e}`);
    }
  };

  const handleSaveCandidateEdit = (updated: PracticeProblemData) => {
    setCandidates(prev =>
      prev.map((c, i) => (i === reviewIndex ? updated : c))
    );
    setEditingCandidate(false);
  };

  const handleSaveExistingEdit = async (updated: PracticeProblemData) => {
    try {
      const saved = await persist(
        updated,
        'PATCH',
        `/practice_problems/${updated.id}`
      );
      setProblems(prev => prev.map(p => (p.id === saved.id ? saved : p)));
      setEditingProblem(null);
    } catch (e) {
      setError(`Failed to save problem: ${e}`);
    }
  };

  const closeManual = () => {
    setAddingManually(false);
    setManualType(null);
  };

  const handleSaveManual = async (problem: PracticeProblemData) => {
    try {
      const saved = await persist(problem, 'POST', '/practice_problems');
      setProblems(prev => [...prev, saved]);
      closeManual();
    } catch (e) {
      setError(`Failed to save problem: ${e}`);
    }
  };

  const handleRemoveExisting = async (problem: PracticeProblemData) => {
    if (
      !window.confirm(
        `Remove "${problem.problemText}" from this lesson? If it is not used ` +
          `by any other lesson it will be deleted entirely.`
      )
    ) {
      return;
    }
    try {
      const response = await fetch(
        `/practice_problems/${problem.id}?lesson_id=${lessonId}`,
        {method: 'DELETE', headers: {'X-CSRF-Token': csrfToken() ?? ''}}
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const result = await response.json();
      if (result.deleted) {
        setProblems(prev => prev.filter(p => p.id !== problem.id));
      } else {
        setProblems(prev => prev.map(p => (p.id === result.id ? result : p)));
      }
    } catch (e) {
      setError(`Failed to remove problem: ${e}`);
    }
  };

  const current = candidates[reviewIndex];

  return (
    <div>
      <h3>Practice Problems</h3>

      {error && (
        <Typography
          variant="body3"
          component="p"
          className={moduleStyles.error}
          role="alert"
        >
          {error}
        </Typography>
      )}

      <table className={moduleStyles.table}>
        <thead>
          <tr>
            <th>Question</th>
            <th>Type</th>
            <th>Answer</th>
            <th>Objectives</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {problems.length === 0 ? (
            <tr>
              <td colSpan={5} className={moduleStyles.empty}>
                No practice problems yet.
              </td>
            </tr>
          ) : (
            problems.map(problem => (
              <tr key={problem.id ?? problem.key}>
                <td>{problem.problemText}</td>
                <td>{problemTypeLabel(problem.problemType)}</td>
                <td>
                  <ul className={moduleStyles.objectiveList}>
                    {solutionSummary(problem).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  {problem.objectiveIds.length === 0 ? (
                    <em className={moduleStyles.empty}>None</em>
                  ) : (
                    <ul className={moduleStyles.objectiveList}>
                      {problem.objectiveIds.map(id => (
                        <li key={id}>
                          {objectiveDescriptionsById.get(id) || `#${id}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={moduleStyles.actionButton}
                    aria-label={`Edit problem`}
                    onClick={() => setEditingProblem(problem)}
                  >
                    <i className="fa-solid fa-pencil" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={moduleStyles.actionButton}
                    aria-label={`Remove problem`}
                    onClick={() => handleRemoveExisting(problem)}
                  >
                    <i className="fa-solid fa-trash" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={moduleStyles.buttonRow}>
        <button
          type="button"
          className={moduleStyles.addButton}
          disabled={generating}
          onClick={handleGenerate}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />{' '}
          {generating ? 'Generating…' : 'Generate with AI'}
        </button>
        <button
          type="button"
          className={moduleStyles.addButton}
          onClick={() => {
            setManualType(null);
            setAddingManually(true);
          }}
        >
          <i className="fa-solid fa-pencil" aria-hidden="true" /> Add manually
        </button>
      </div>

      {/* Manual add: pick a type, then edit and save a new problem */}
      {addingManually && (
        <LessonEditorDialog isOpen handleClose={closeManual}>
          {manualType === null ? (
            <>
              <Typography
                variant="h5"
                component="h2"
                className={moduleStyles.dialogTitle}
              >
                Add a practice problem
              </Typography>
              <Typography variant="body2" component="p">
                Choose a question type:
              </Typography>
              <div className={moduleStyles.typePicker}>
                {PROBLEM_TYPE_VALUES.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={moduleStyles.addButton}
                    onClick={() => setManualType(type)}
                  >
                    {problemTypeLabel(type)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <Typography
                variant="h5"
                component="h2"
                className={moduleStyles.dialogTitle}
              >
                New {problemTypeLabel(manualType)}
              </Typography>
              <PracticeProblemEditor
                key={manualType}
                problem={blankProblem(manualType)}
                objectives={objectives}
                onSave={handleSaveManual}
                onCancel={closeManual}
              />
            </>
          )}
        </LessonEditorDialog>
      )}

      {/* Review carousel for AI-generated candidates */}
      {reviewing && current && (
        <LessonEditorDialog isOpen handleClose={() => setReviewing(false)}>
          <div className={moduleStyles.reviewHeader}>
            <Typography variant="h5" component="h2">
              Review generated problem {reviewIndex + 1} of {candidates.length}
            </Typography>
          </div>

          {editingCandidate ? (
            <PracticeProblemEditor
              problem={current}
              objectives={objectives}
              onSave={handleSaveCandidateEdit}
              onCancel={() => setEditingCandidate(false)}
            />
          ) : (
            <>
              <PracticePreview problem={current} />
              <div className={moduleStyles.reviewActions}>
                <MuiButton
                  variant="contained"
                  color="primary"
                  onClick={handleAccept}
                >
                  Accept
                </MuiButton>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  onClick={dropCurrentCandidate}
                >
                  Reject
                </MuiButton>
                <MuiButton
                  variant="text"
                  color="secondary"
                  onClick={() => setEditingCandidate(true)}
                >
                  Edit
                </MuiButton>
              </div>
              <div className={moduleStyles.reviewNav}>
                <MuiButton
                  variant="text"
                  color="secondary"
                  size="small"
                  disabled={reviewIndex === 0}
                  onClick={() => setReviewIndex(i => Math.max(0, i - 1))}
                >
                  Previous
                </MuiButton>
                <MuiButton
                  variant="text"
                  color="secondary"
                  size="small"
                  disabled={reviewIndex >= candidates.length - 1}
                  onClick={() =>
                    setReviewIndex(i => Math.min(candidates.length - 1, i + 1))
                  }
                >
                  Next
                </MuiButton>
                <MuiButton
                  variant="text"
                  color="secondary"
                  size="small"
                  disabled={generating}
                  onClick={handleGenerate}
                >
                  {generating ? 'Generating…' : 'Generate 5 more'}
                </MuiButton>
              </div>
            </>
          )}
        </LessonEditorDialog>
      )}

      {/* Edit an already-persisted problem */}
      {editingProblem && (
        <LessonEditorDialog isOpen handleClose={() => setEditingProblem(null)}>
          <Typography
            variant="h5"
            component="h2"
            className={moduleStyles.dialogTitle}
          >
            Edit Practice Problem
          </Typography>
          <PracticeProblemEditor
            problem={editingProblem}
            objectives={objectives}
            onSave={handleSaveExistingEdit}
            onCancel={() => setEditingProblem(null)}
          />
        </LessonEditorDialog>
      )}
    </div>
  );
};

export default PracticeProblemsPanel;
