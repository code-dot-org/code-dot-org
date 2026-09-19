// Where "Show me" says what it pointed at (specs/SHOW_ME_PLAN.md).
//
// One `status` region for the lab, mounted once. Polite: the learner pressed
// a link and focus is about to move, and the sentence is read after whatever
// the move itself announces. Importing this is also what loads the ring's
// style, so a lab that can point has both.

import {useSyncExternalStore} from 'react';

import styles from './callouts.module.css';
import {lastAnnounced, onAnnounce} from './pointAt';

export const CalloutAnnouncer = () => {
  const message = useSyncExternalStore(onAnnounce, lastAnnounced);
  return (
    <p role="status" aria-label="Show me" className={styles.announcer}>
      {message}
    </p>
  );
};

export default CalloutAnnouncer;
