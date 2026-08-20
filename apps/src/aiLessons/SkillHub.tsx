// Skill-tree hub surface: every path on the hub at once, each with its
// progress; the student clicks one to continue it.
//
// Walking skeleton: paths render as plain cards with an X/Y counter.
// The segmented-ring visual, lock states, and animations land in the
// UI phase.

import {Button as MuiButton} from '@mui/material';
import React from 'react';

import ProgressRing from './ProgressRing';
import {HubStep, LessonPlan, pathStepsFor, SkillPath} from './types';

import styles from './aiLessons.module.scss';

interface SkillHubProps {
  lesson: LessonPlan;
  hub: HubStep;
  completedStepIds: string[];
  onEnterPath: (path: SkillPath) => void;
  // Fires the hub's own completion (resolver routes to the next
  // section).  Gating on required paths lands with navigation.
  onContinue: () => void;
}

export function pathProgress(
  lesson: LessonPlan,
  path: SkillPath,
  completedStepIds: string[]
): {done: number; total: number} {
  const ids = pathStepsFor(lesson, path);
  return {
    done: ids.filter(id => completedStepIds.includes(id)).length,
    total: ids.length,
  };
}

const SkillHub: React.FunctionComponent<SkillHubProps> = ({
  lesson,
  hub,
  completedStepIds,
  onEnterPath,
  onContinue,
}) => {
  const allDone = hub.paths.every(p => {
    const {done, total} = pathProgress(lesson, p, completedStepIds);
    return p.required === false || done >= total;
  });

  return (
    <div className={styles.skillHub}>
      <h2>{hub.title}</h2>
      {hub.description && <p className={styles.muted}>{hub.description}</p>}
      <div className={styles.skillHubPaths}>
        {hub.paths.map(path => {
          const {done, total} = pathProgress(lesson, path, completedStepIds);
          const complete = total > 0 && done >= total;
          // Locked until every prerequisite path is complete (the
          // expanding skill tree).  Prerequisites name sibling paths.
          const missing = (path.requires || []).filter(reqId => {
            const req = hub.paths.find(p => p.id === reqId);
            if (!req) return false;
            const progress = pathProgress(lesson, req, completedStepIds);
            return progress.done < progress.total;
          });
          const locked = missing.length > 0;
          return (
            <button
              key={path.id}
              type="button"
              className={`${styles.skillHubPath}${
                locked ? ` ${styles.skillHubPathLocked}` : ''
              }`}
              onClick={() => onEnterPath(path)}
              disabled={locked}
            >
              <ProgressRing
                done={done}
                total={total}
                size={96}
                center={
                  <span
                    className={
                      complete
                        ? styles.skillHubPathCountDone
                        : styles.skillHubPathCount
                    }
                  >
                    {locked ? '🔒' : complete ? '✓' : `${done}/${total}`}
                  </span>
                }
              />
              <span className={styles.skillHubPathTitle}>{path.title}</span>
              {locked ? (
                <span className={styles.skillHubPathObjective}>
                  Unlocks after{' '}
                  {missing
                    .map(id => hub.paths.find(p => p.id === id)?.title || id)
                    .join(', ')}
                </span>
              ) : (
                path.objective && (
                  <span className={styles.skillHubPathObjective}>
                    {path.objective}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
      {allDone && (
        <MuiButton
          variant="contained"
          color="primary"
          type="button"
          onClick={onContinue}
        >
          Continue →
        </MuiButton>
      )}
    </div>
  );
};

export default SkillHub;
