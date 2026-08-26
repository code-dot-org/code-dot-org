import {Button, IconButton, Popover, Typography} from '@mui/material';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi} from '../api';

import styles from './authoring.module.scss';

interface RemoveCourseButtonProps {
  courseId: string;
  courseName: string;
}

/**
 * Trash icon on a course catalog card, author mode only (the caller gates
 * on useCanAuthor). Removing a course only drops it from the catalog —
 * removeCourse never touches widgets/, so nothing an author might want back
 * is actually deleted; a Levelbuilder import can always be re-imported.
 * Two-click confirm via a Popover, the same overlay InsertPoint already uses
 * for its own author-authored content, rather than introducing a new
 * MUI Dialog pattern for one control.
 */
export default function RemoveCourseButton({
  courseId,
  courseName,
}: RemoveCourseButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [busy, setBusy] = useState(false);
  const open = Boolean(anchorEl);

  const cancel = () => setAnchorEl(null);

  const confirmRemove = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await authoringApi.applyChange({op: 'removeCourse', courseId});
    } finally {
      setBusy(false);
      setAnchorEl(null);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        className={styles.courseCardRemove}
        aria-label={`Remove ${courseName}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        // The card itself is a Link; stop the click here so opening the
        // confirm popover doesn't also navigate into the course.
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
      >
        <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={cancel}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      >
        <div className={styles.courseRemoveConfirm}>
          <Typography variant="body2">
            Remove “{courseName}” from the catalog? Levelbuilder imports can
            be re-imported later; nothing is deleted.
          </Typography>
          <div className={styles.courseRemoveConfirmActions}>
            <Button
              variant="outlined"
              size="small"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                cancel();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={busy}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                void confirmRemove();
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
}
