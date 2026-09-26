// The always-visible project checklist, shown in the tutor sidebar on
// project-mode lab steps (see stepShowsChecklist).  Read-only: verdicts
// come from the tutor's structured output as it evaluates work, so the
// student watches items check themselves off.

import React from 'react';

import {ChecklistItem} from './types';

import styles from './aiLessons.module.scss';

interface ChecklistPanelProps {
  items: ChecklistItem[];
  state: {[itemId: string]: boolean};
}

const ChecklistPanel: React.FunctionComponent<ChecklistPanelProps> = ({
  items,
  state,
}) => {
  const doneCount = items.filter(item => state[item.id]).length;
  return (
    <div className={styles.checklistPanel}>
      <div className={styles.checklistTitle}>
        Project checklist · {doneCount}/{items.length}
      </div>
      <ul>
        {items.map(item => {
          const done = !!state[item.id];
          return (
            <li key={item.id} className={done ? styles.checklistDone : ''}>
              <span aria-hidden="true">{done ? '✓' : '○'}</span>
              {item.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChecklistPanel;
