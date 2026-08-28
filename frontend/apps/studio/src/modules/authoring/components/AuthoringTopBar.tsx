import {Button, IconButton, Popover, Tooltip, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useMemo, useState} from 'react';

import type {CourseModel, CurriculumChange} from '@code-dot-org/authoring';
import {useDocumentKeydown} from '@code-dot-org/component-library/common/hooks';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import TextField from '@code-dot-org/component-library/textField';

import {
  authoringApi,
  type LastPublishInfo,
  type PublishResult,
  type WritebackApplyResult,
  type WritebackCreate,
  type WritebackEdit,
  type WritebackPlan,
} from '../api';
import {useWritebackPlan} from '../hooks';
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
      <WritebackButton />
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

type WritebackPhase = 'review' | 'busy' | 'success' | 'error';

/**
 * "Write to dashboard/config": takes the session's overrides on lb: levels
 * out of memory and onto disk as real .level file edits, for the author to
 * review with `git diff` and commit themselves — this button never commits
 * or pushes. Same confirm|busy|success|error machine as PublishButton, with
 * one addition: the plan (which files, which diffs, what got skipped and
 * why) is already loaded before the dialog opens, via useWritebackPlan —
 * that's also what drives this button's own disabled state.
 */
export function WritebackButton() {
  const queryClient = useQueryClient();
  const {data: plan} = useWritebackPlan();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [phase, setPhase] = useState<WritebackPhase>('review');
  const [result, setResult] = useState<WritebackApplyResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  // A pending create's author-edited name, keyed by experienceId — kept
  // client-side only until apply, never trusted back verbatim: the server
  // recomputes the whole plan from these before writing anything (see
  // plan.ts's validateExplicitLevelName), so a rejected name comes back as
  // an ordinary `skipped` entry, not a silent failure.
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const open = Boolean(anchorEl);
  const editCount = plan?.edits.length ?? 0;
  const disabled = editCount === 0;

  const close = () => {
    setAnchorEl(null);
    setPhase('review');
    setResult(undefined);
    setError(undefined);
    setNameDrafts({});
  };

  const runApply = async () => {
    if (!plan) {
      return;
    }
    setPhase('busy');
    try {
      const overrides = Object.fromEntries(
        plan.edits
          .filter((edit): edit is WritebackCreate => edit.kind === 'create')
          .map(edit => [edit.experienceId, nameDrafts[edit.experienceId] ?? edit.name]),
      );
      const outcome =
        Object.keys(overrides).length > 0
          ? await authoringApi.applyWriteback(plan.planHash, overrides)
          : await authoringApi.applyWriteback(plan.planHash);
      if (!outcome.ok) {
        // The plan changed underneath the dialog (more edits landed while it
        // was open) — replace the cached plan with the fresh one the server
        // just computed so "Review again" shows what will actually be
        // written, never the diff the author already confirmed.
        queryClient.setQueryData(['authoring', 'writeback', 'plan'], outcome.plan);
        setError(
          'The write-back plan changed since you opened this dialog — review the refreshed diff and confirm again.',
        );
        setPhase('error');
        return;
      }
      setResult(outcome.result);
      setPhase('success');
      // The files on disk now match the session's overrides, so a re-fetch
      // here (rather than waiting on the next curriculum-change event) is
      // what makes a re-opened dialog show "nothing left to write" instead
      // of the diff that was just applied.
      await queryClient.invalidateQueries({
        queryKey: ['authoring', 'writeback', 'plan'],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That write failed to apply.');
      setPhase('error');
    }
  };

  return (
    <>
      <Tooltip title={plan && disabled ? 'No file-backed changes to write' : ''}>
        <span>
          <Button
            variant="outlined"
            size="small"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={e => setAnchorEl(e.currentTarget)}
          >
            <FontAwesomeV6Icon iconName="file-export" iconStyle="solid" />
            {' '}Write to dashboard/config
          </Button>
        </span>
      </Tooltip>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      >
        <div className={styles.writebackDialog}>
          {phase === 'review' && plan && (
            <>
              <Typography variant="h6" component="h2">
                {writeFileCountLabel(plan.edits.length)} to dashboard/config?
              </Typography>
              <ul className={styles.writebackEditList}>
                {plan.edits.map(edit =>
                  edit.kind === 'create' ? (
                    <WritebackCreateRow
                      key={edit.experienceId}
                      edit={edit}
                      name={nameDrafts[edit.experienceId] ?? edit.name}
                      onNameChange={name =>
                        setNameDrafts(prev => ({...prev, [edit.experienceId]: name}))
                      }
                    />
                  ) : (
                    <WritebackEditRow key={edit.path} edit={edit} />
                  ),
                )}
              </ul>
              <WritebackSkippedSection skipped={plan.skipped} />
              <Typography variant="body4" className={styles.writebackNote}>
                Nothing is committed — review the result with git diff yourself.
              </Typography>
              <div className={styles.courseRemoveConfirmActions}>
                <Button variant="outlined" size="small" onClick={close}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={plan.edits.length === 0}
                  onClick={() => void runApply()}
                >
                  {writeFileCountLabel(plan.edits.length)}
                </Button>
              </div>
            </>
          )}
          {phase === 'busy' && <Typography variant="body2">Writing…</Typography>}
          {phase === 'success' && result && (
            <>
              <Typography variant="body2">
                {writeFileCountLabel(result.applied.length, 'Wrote')}:
              </Typography>
              <ul className={styles.writebackSkipList}>
                {result.applied.map(applied => (
                  <li key={applied.path} className={styles.writebackSkipRow}>
                    <Typography
                      variant="body4"
                      className={styles.writebackEditPath}
                    >
                      {applied.path}
                    </Typography>
                  </li>
                ))}
              </ul>
              <WritebackSkippedSection skipped={result.skipped} />
              <Typography variant="body4" className={styles.writebackNote}>
                Nothing was committed — review with git diff and commit it
                yourself when you're ready.
              </Typography>
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
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setPhase('review')}
                >
                  Review again
                </Button>
              </div>
            </>
          )}
        </div>
      </Popover>
    </>
  );
}

function writeFileCountLabel(count: number, verb: 'Write' | 'Wrote' = 'Write'): string {
  return `${verb} ${count} file${count === 1 ? '' : 's'}`;
}

function WritebackEditRow({edit}: {edit: WritebackEdit}) {
  return (
    <li className={styles.writebackEditRow}>
      <Typography variant="body4" className={styles.writebackEditPath}>
        {edit.path}
      </Typography>
      <pre className={styles.writebackDiff}>
        {edit.unifiedDiff.split('\n').map((line, i) => (
          // Line-indexed key is safe: this list is a static render of one
          // immutable diff string, never reordered or edited in place.
          <div key={i} style={{color: diffLineColor(line)}}>
            {line.length === 0 ? ' ' : line}
          </div>
        ))}
      </pre>
    </li>
  );
}

/**
 * A pending `createLevel` write, rendered distinctly from an ordinary edit:
 * an editable name field (a level name is a one-way door once it ships —
 * see writeback/newLevelName.ts — so it's never auto-applied without the
 * author seeing it) and the whole new file's contents behind a disclosure,
 * collapsed by default since a fresh Maze level's XML is long and the name
 * is the one thing that needs eyes-on before every other write.
 */
function WritebackCreateRow({
  edit,
  name,
  onNameChange,
}: {
  edit: WritebackCreate;
  name: string;
  onNameChange: (name: string) => void;
}) {
  return (
    <li className={styles.writebackEditRow}>
      <Typography variant="body4" className={styles.writebackEditPath}>
        New file: dashboard/config/levels/custom/maze/{name || '…'}.level
      </Typography>
      <TextField
        name={`writeback-create-name-${edit.experienceId}`}
        label="Level name"
        value={name}
        size="s"
        onChange={e => onNameChange(e.target.value)}
      />
      <details>
        <summary>Preview file contents</summary>
        <pre className={styles.writebackDiff}>
          {edit.unifiedDiff.split('\n').map((line, i) => (
            // Same reasoning as WritebackEditRow: one immutable diff string,
            // never reordered.
            <div key={i} style={{color: diffLineColor(line)}}>
              {line.length === 0 ? ' ' : line}
            </div>
          ))}
        </pre>
      </details>
    </li>
  );
}

function diffLineColor(line: string): string | undefined {
  if (line.startsWith('+') && !line.startsWith('+++')) {
    return 'var(--text-success-primary, #12752a)';
  }
  if (line.startsWith('-') && !line.startsWith('---')) {
    return 'var(--text-error-primary, #d3281c)';
  }
  if (line.startsWith('@@')) {
    return 'var(--text-neutral-secondary, #6f747c)';
  }
  return undefined;
}

function WritebackSkippedSection({
  skipped,
}: {
  skipped: WritebackPlan['skipped'];
}) {
  if (skipped.length === 0) {
    return null;
  }
  return (
    <div>
      <Typography variant="body4" component="h3">
        Not written ({skipped.length})
      </Typography>
      <ul className={styles.writebackSkipList}>
        {skipped.map((skip, i) => (
          // seq-free entries; experienceId+field+reason isn't guaranteed
          // unique across two distinct skips on the same field for the same
          // reason, but the list is a static render of one plan snapshot.
          <li key={i} className={styles.writebackSkipRow}>
            <Typography variant="body4">
              {skip.field ? `${skip.field}: ` : ''}
              {skip.reason}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
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
