import {Button, IconButton, Popover, Tooltip, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useMemo, useState} from 'react';

import type {CourseModel, CurriculumChange} from '@code-dot-org/authoring';
import {useDocumentKeydown} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';

import {authoringApi, type LastPublishInfo, type PublishResult} from '../api';
import {
  countNewObjects,
  derivePublishStatus,
  PUBLISH_STATUS_LABEL,
  type PublishStatus,
} from '../publishStatus';
import {useUndoRedo} from '../useUndoRedo';

import styles from './authoring.module.scss';

interface AuthoringTopBarProps {
  changes: CurriculumChange[];
  courses: CourseModel[];
  lastPublish: LastPublishInfo | undefined;
  /** "Unsaved edits" marker for a panel/rail section that's mid-edit —
   * complements, not replaces, that section's own Save button. Omitted on
   * the course-overview page, which has no such lifted dirty state. */
  dirty?: boolean;
}

// Blockly assigns these classes itself (not ours) to the elements it injects
// for the workspace, its flyout and its toolbox; Blockly owns Ctrl+Z inside
// all three, so Undo/Redo below must never intercept there.
const BLOCKLY_WORKSPACE_SELECTOR = '.injectionDiv, .blocklySvg';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
    return true;
  }
  return Boolean(target.closest(BLOCKLY_WORKSPACE_SELECTOR));
}

function useUndoRedoKeyboard(onUndo: () => void, onRedo: () => void): void {
  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') {
        return;
      }
      if (isEditableTarget(event.target)) {
        return;
      }
      event.preventDefault();
      if (event.shiftKey) {
        onRedo();
      } else {
        onUndo();
      }
    },
    [onUndo, onRedo],
  );
  useDocumentKeydown(handleKeydown);
}

/**
 * Author-mode top bar: publish status + Undo/Redo + Publish. Shared by the
 * course-overview page and the lesson player, so an author has the same
 * publish/undo affordances wherever they're editing — see
 * docs/prototypes/author-mode-cms-ux-research.md §c/§d for why this is
 * scoped to the whole session's change log rather than per-course/lesson.
 */
export default function AuthoringTopBar({
  changes,
  courses,
  lastPublish,
  dirty = false,
}: AuthoringTopBarProps) {
  const status = derivePublishStatus(changes.length, lastPublish);
  const undoRedo = useUndoRedo(changes, courses);
  useUndoRedoKeyboard(undoRedo.undo, undoRedo.redo);

  return (
    <div className={styles.authoringTopBar}>
      <Tags
        tagsList={[
          {
            label: PUBLISH_STATUS_LABEL[status],
            icon: {...PUBLISH_STATUS_ICON[status], placement: 'left'},
          },
        ]}
        size="s"
      />
      {dirty && (
        <Typography
          variant="body4"
          component="span"
          className={styles.unsavedMarker}
        >
          Unsaved edits
        </Typography>
      )}
      <div className={styles.undoRedoGroup}>
        <Tooltip
          title={
            undoRedo.canUndo ? `Undo: ${undoRedo.undoLabel}` : 'Nothing to undo'
          }
        >
          <span>
            <IconButton
              size="small"
              aria-label="Undo"
              disabled={!undoRedo.canUndo || undoRedo.busy}
              onClick={undoRedo.undo}
            >
              <FontAwesomeV6Icon iconName="rotate-left" iconStyle="solid" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip
          title={
            undoRedo.canRedo ? `Redo: ${undoRedo.redoLabel}` : 'Nothing to redo'
          }
        >
          <span>
            <IconButton
              size="small"
              aria-label="Redo"
              disabled={!undoRedo.canRedo || undoRedo.busy}
              onClick={undoRedo.redo}
            >
              <FontAwesomeV6Icon iconName="rotate-right" iconStyle="solid" />
            </IconButton>
          </span>
        </Tooltip>
      </div>
      {undoRedo.error && (
        <Typography
          variant="body4"
          role="status"
          className={styles.inlineError}
        >
          {undoRedo.error}
        </Typography>
      )}
      <PublishButton changes={changes} status={status} />
    </div>
  );
}

// Tags (DSCO) has no per-instance color variant — its icon slot is the
// supported way to carry extra meaning on a label, so status is
// distinguished by icon rather than by fighting the component's own styling.
const PUBLISH_STATUS_ICON: Record<
  PublishStatus,
  {iconName: string; iconStyle: 'solid'}
> = {
  draft: {iconName: 'pen', iconStyle: 'solid'},
  changed: {iconName: 'triangle-exclamation', iconStyle: 'solid'},
  published: {iconName: 'circle-check', iconStyle: 'solid'},
};

type PublishPhase = 'confirm' | 'busy' | 'success' | 'error';

function PublishButton({
  changes,
  status,
}: {
  changes: CurriculumChange[];
  status: PublishStatus;
}) {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [phase, setPhase] = useState<PublishPhase>('confirm');
  const [result, setResult] = useState<PublishResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const open = Boolean(anchorEl);
  const newCount = countNewObjects(changes);

  const downloadHref = useMemo(() => {
    if (!result) {
      return undefined;
    }
    return URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'}),
    );
  }, [result]);
  useEffect(
    () => () => {
      if (downloadHref) {
        URL.revokeObjectURL(downloadHref);
      }
    },
    [downloadHref],
  );

  const close = () => {
    setAnchorEl(null);
    setPhase('confirm');
    setResult(undefined);
    setError(undefined);
  };

  const runPublish = async () => {
    setPhase('busy');
    try {
      const publishResult = await authoringApi.publish();
      setResult(publishResult);
      setPhase('success');
      // Publish doesn't bump the change log or `version` — it only writes a
      // new publish-*.json artifact — so the status chip only picks up the
      // change by refetching /api/state's `lastPublish` field explicitly.
      await queryClient.invalidateQueries({queryKey: ['authoring', 'state']});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That publish failed to apply.');
      setPhase('error');
    }
  };

  return (
    <>
      <Tooltip
        title={status === 'published' ? 'No changes since your last publish' : ''}
      >
        <span>
          <Button
            variant="contained"
            size="small"
            disabled={status === 'published'}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={e => setAnchorEl(e.currentTarget)}
          >
            <FontAwesomeV6Icon iconName="cloud-arrow-up" iconStyle="solid" />
            {' '}Publish
          </Button>
        </span>
      </Tooltip>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      >
        <div className={styles.publishConfirm}>
          {phase === 'confirm' && (
            <>
              <Typography variant="h6" component="h2">
                Publish changes?
              </Typography>
              <Typography variant="body2">
                {publishSummary(changes.length, newCount)}
              </Typography>
              <div className={styles.courseRemoveConfirmActions}>
                <Button variant="outlined" size="small" onClick={close}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => void runPublish()}
                >
                  Publish
                </Button>
              </div>
            </>
          )}
          {phase === 'busy' && (
            <Typography variant="body2">Publishing…</Typography>
          )}
          {phase === 'success' && result && (
            <>
              <Typography variant="body2">
                Published at {formatTimestamp(result.generatedAt)}:{' '}
                {publishSummary(result.changes.length, countNewFromResult(result))}
              </Typography>
              {downloadHref && (
                <a href={downloadHref} download="publish-report.json">
                  Download changeset (JSON)
                </a>
              )}
              <div className={styles.courseRemoveConfirmActions}>
                <Button variant="outlined" size="small" onClick={close}>
                  Close
                </Button>
              </div>
            </>
          )}
          {phase === 'error' && (
            <>
              <Typography
                variant="body4"
                role="status"
                className={styles.inlineError}
              >
                {error}
              </Typography>
              <div className={styles.courseRemoveConfirmActions}>
                <Button variant="outlined" size="small" onClick={close}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Popover>
    </>
  );
}

function publishSummary(changeCount: number, newCount: number): string {
  const changeWord = `${changeCount} change${changeCount === 1 ? '' : 's'}`;
  return newCount > 0
    ? `${changeWord}, including ${newCount} new item${newCount === 1 ? '' : 's'}.`
    : `${changeWord}.`;
}

// The success view summarizes the changeset the server actually built,
// rather than re-reading the client's own (possibly since-advanced) log.
function countNewFromResult(result: PublishResult): number {
  const {courses, units, lessons, experiences} = result.newObjects;
  return courses.length + units.length + lessons.length + experiences.length;
}

function formatTimestamp(at: string): string {
  const date = new Date(at);
  return Number.isNaN(date.getTime()) ? at : date.toLocaleString();
}
