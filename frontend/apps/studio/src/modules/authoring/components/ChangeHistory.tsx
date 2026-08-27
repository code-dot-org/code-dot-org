import {Button, Popover, Typography} from '@mui/material';
import {useState} from 'react';

import type {CourseModel, CurriculumChange} from '@code-dot-org/authoring';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';

import {authoringApi} from '../api';
import {changesForCourse, summarizeChange} from '../changeHistory';
import {buildRevertChangeBody} from '../revert';

import styles from './authoring.module.scss';

interface ChangeHistoryProps {
  courseId: string;
  courses: CourseModel[];
  changes: CurriculumChange[];
}

/**
 * "History" affordance on a course page: this course's own slice of the
 * append-only CurriculumChange log, most recent first, with a Revert button
 * on entries buildRevertChangeBody can safely compensate for. A revert is
 * itself just another CurriculumChange, applied through the normal
 * applyChange path — so it shows up in this same list afterward, actor
 * "author".
 */
export default function ChangeHistory({
  courseId,
  courses,
  changes,
}: ChangeHistoryProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const entries = changesForCourse(changes, courses, courseId);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <FontAwesomeV6Icon iconName="clock-rotate-left" iconStyle="solid" />{' '}
        History
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
      >
        <div className={styles.changeHistory}>
          <Typography variant="h6" component="h2">
            Change history
          </Typography>
          {entries.length === 0 && (
            <Typography variant="body2">No changes yet.</Typography>
          )}
          <ul className={styles.changeHistoryList}>
            {entries.map(change => (
              <ChangeHistoryRow
                key={change.seq}
                change={change}
                courses={courses}
              />
            ))}
          </ul>
        </div>
      </Popover>
    </>
  );
}

function ChangeHistoryRow({
  change,
  courses,
}: {
  change: CurriculumChange;
  courses: CourseModel[];
}) {
  const [confirmAnchor, setConfirmAnchor] = useState<HTMLButtonElement | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revertBody = buildRevertChangeBody(change);

  const confirmRevert = async () => {
    if (busy || !revertBody) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authoringApi.applyChange(revertBody);
      setConfirmAnchor(null);
    } catch {
      setError('That revert failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={styles.changeHistoryRow}>
      <div className={styles.changeHistoryRowMain}>
        <Typography variant="body2">
          {summarizeChange(change, courses)}
        </Typography>
        <Typography
          variant="body4"
          component="div"
          className={styles.changeHistoryMeta}
        >
          <Tags tagsList={[{label: change.actor}]} size="s" />
          <span>{formatTimestamp(change.at)}</span>
        </Typography>
        {error && (
          <Typography
            variant="body4"
            role="status"
            className={styles.inlineError}
          >
            {error}
          </Typography>
        )}
      </div>
      {revertBody && (
        <>
          <Button
            variant="text"
            size="small"
            disabled={busy}
            aria-haspopup="dialog"
            aria-expanded={Boolean(confirmAnchor)}
            onClick={e => setConfirmAnchor(e.currentTarget)}
          >
            Revert
          </Button>
          <Popover
            anchorEl={confirmAnchor}
            open={Boolean(confirmAnchor)}
            onClose={() => setConfirmAnchor(null)}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          >
            <div className={styles.courseRemoveConfirm}>
              <Typography variant="body2">Revert this change?</Typography>
              <div className={styles.courseRemoveConfirmActions}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setConfirmAnchor(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={busy}
                  onClick={() => void confirmRevert()}
                >
                  Revert
                </Button>
              </div>
            </div>
          </Popover>
        </>
      )}
    </li>
  );
}

function formatTimestamp(at: string): string {
  const date = new Date(at);
  return Number.isNaN(date.getTime()) ? at : date.toLocaleString();
}
