import {Button, Popover, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import {useState} from 'react';

import {authoringApi, type ProposeTarget, type ProposeWidgetResult} from '../api';
import {useProposeConfig} from '../hooks';

import styles from './authoring.module.scss';

type ProposePhase = 'idle' | 'preview' | 'pushing' | 'pushed' | 'error';

/**
 * "Propose for catalog" — graduates a session widget into a real pull
 * request, onto @code-dot-org/widgets-catalog (this monorepo) or
 * codeai-staff-apps/widgets, picked with the target toggle. Same
 * confirm/busy/success/error shape as PublishButton and WritebackButton
 * (AuthoringTopBar.tsx), with one difference: opening the popover — and
 * switching the target toggle — runs a `dry-run` propose immediately, so
 * the dialog always shows the server's real file list, slug, version and
 * gate results for the CURRENTLY SELECTED target rather than a client-side
 * guess — including a refusal (gate violations, a slug collision), which
 * renders in this same phase rather than as a separate error state.
 * Pushing is a distinct second step, disabled unless that target's remote is
 * configured server-side (useProposeConfig) — this component never
 * fabricates one. A staff-apps push additionally attempts to open a real
 * pull request; the catalog target never does (a human opens that one from
 * the returned compare URL — the success phase says so either way).
 */
export function ProposeWidgetButton({widgetId}: {widgetId: string}) {
  const {data: config} = useProposeConfig();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [target, setTarget] = useState<ProposeTarget>('catalog');
  const [phase, setPhase] = useState<ProposePhase>('idle');
  const [dryRun, setDryRun] = useState<ProposeWidgetResult | undefined>();
  const [pushResult, setPushResult] = useState<ProposeWidgetResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const open = Boolean(anchorEl);
  const remoteFor = (t: ProposeTarget) =>
    t === 'catalog' ? config?.remote : config?.staffAppsRemote;
  const remote = remoteFor(target);

  const close = () => {
    setAnchorEl(null);
    setPhase('idle');
    setDryRun(undefined);
    setPushResult(undefined);
    setError(undefined);
  };

  const runPreview = async (previewTarget: ProposeTarget) => {
    setPhase('preview');
    setDryRun(undefined);
    try {
      const result = await authoringApi.proposeWidget(widgetId, {
        target: previewTarget,
        mode: 'dry-run',
        // The catalog target's dry-run needs no remote (it parents onto
        // this checkout's own origin/staging); the staff-apps target's
        // dry-run does — it fetches the real repo's tip to parent onto and
        // to check for a slug collision, so a preview is only ever as real
        // as a push would be.
        remote: remoteFor(previewTarget),
      });
      setDryRun(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That check failed to run.');
      setPhase('error');
    }
  };

  const openDialog = (anchor: HTMLButtonElement) => {
    setAnchorEl(anchor);
    void runPreview(target);
  };

  const selectTarget = (nextTarget: ProposeTarget) => {
    setTarget(nextTarget);
    void runPreview(nextTarget);
  };

  const runPush = async () => {
    if (!remote) {
      return;
    }
    setPhase('pushing');
    try {
      const result = await authoringApi.proposeWidget(widgetId, {
        target,
        mode: 'push',
        remote,
      });
      setPushResult(result);
      if (!result.ok) {
        setError(result.reason);
        setPhase('error');
        return;
      }
      setPhase('pushed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That push failed to apply.');
      setPhase('error');
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={e => openDialog(e.currentTarget)}
      >
        Propose widget
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      >
        <div className={styles.writebackDialog}>
          {phase !== 'pushed' && (
            <ToggleButtonGroup
              value={target}
              exclusive
              size="small"
              aria-label="Propose target"
              onChange={(_e, next: ProposeTarget | null) => {
                if (next && next !== target) selectTarget(next);
              }}
            >
              <ToggleButton value="catalog" aria-label="Catalog">
                Catalog
              </ToggleButton>
              <ToggleButton
                value="staff-apps"
                aria-label="Staff Apps"
                disabled={!config?.staffAppsRemote}
              >
                Staff Apps
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          {phase === 'preview' && !dryRun && (
            <Typography variant="body2">Checking the widget's gates…</Typography>
          )}
          {phase === 'preview' && dryRun && (
            <ProposePreview
              dryRun={dryRun}
              target={target}
              remote={remote}
              onPush={() => void runPush()}
              onClose={close}
            />
          )}
          {phase === 'pushing' && <Typography variant="body2">Pushing…</Typography>}
          {phase === 'pushed' && pushResult?.ok && (
            <PushedOutcome result={pushResult} target={target} onClose={close} />
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

function PushedOutcome({
  result,
  target,
  onClose,
}: {
  result: Extract<ProposeWidgetResult, {ok: true}>;
  target: ProposeTarget;
  onClose: () => void;
}) {
  return (
    <>
      <Typography variant="body2">Pushed <code>{result.branch}</code>.</Typography>
      {result.prUrl && (
        <>
          <Typography variant="body2">Pull request opened:</Typography>
          <a href={result.prUrl} target="_blank" rel="noreferrer">
            {result.prUrl}
          </a>
        </>
      )}
      {!result.prUrl && result.compareUrl && (
        <>
          <Typography variant="body2">
            {target === 'staff-apps'
              ? 'No pull request was opened (no gh/token available) — open one yourself from the compare page:'
              : 'No pull request was opened — open one yourself from the compare page:'}
          </Typography>
          <a href={result.compareUrl} target="_blank" rel="noreferrer">
            {result.compareUrl}
          </a>
        </>
      )}
      {result.prError && (
        <Typography variant="body4" className={styles.writebackNote}>
          PR creation failed: {result.prError}
        </Typography>
      )}
      <div className={styles.courseRemoveConfirmActions}>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </div>
    </>
  );
}

function ProposePreview({
  dryRun,
  target,
  remote,
  onPush,
  onClose,
}: {
  dryRun: ProposeWidgetResult;
  target: ProposeTarget;
  remote: string | undefined;
  onPush: () => void;
  onClose: () => void;
}) {
  if (!dryRun.ok) {
    return (
      <>
        <Typography variant="h6" component="h2">
          Can&apos;t propose this widget yet
        </Typography>
        <Typography
          variant="body2"
          role="status"
          className={styles.inlineError}
        >
          {dryRun.reason}
        </Typography>
        {dryRun.violations && dryRun.violations.length > 0 && (
          <ul className={styles.writebackSkipList}>
            {dryRun.violations.map(violation => (
              <li key={violation} className={styles.writebackSkipRow}>
                <Typography variant="body4" className={styles.inlineError}>
                  {violation}
                </Typography>
              </li>
            ))}
          </ul>
        )}
        {dryRun.suggestion && (
          <Typography variant="body4">
            Suggestion: {dryRun.suggestion}
          </Typography>
        )}
        <div className={styles.courseRemoveConfirmActions}>
          <Button variant="outlined" size="small" onClick={onClose}>
            Close
          </Button>
        </div>
      </>
    );
  }

  const provenance = dryRun.files.find(f => f.path.endsWith('PROVENANCE.md'));
  const targetLabel = target === 'catalog' ? 'the catalog' : 'Staff Apps';

  return (
    <>
      <Typography variant="h6" component="h2">
        Propose {dryRun.slug} v{dryRun.version} to {targetLabel}?
      </Typography>
      <Typography variant="body2">
        Branch <code>{dryRun.branch}</code>, {dryRun.files.length} file
        {dryRun.files.length === 1 ? '' : 's'}:
      </Typography>
      <ul className={styles.writebackEditList}>
        {dryRun.files.map(f => (
          <li key={f.path} className={styles.writebackEditRow}>
            <Typography variant="body4" className={styles.writebackEditPath}>
              {f.path}
            </Typography>
          </li>
        ))}
      </ul>
      {provenance && (
        <details>
          <summary>PROVENANCE.md preview</summary>
          <pre className={styles.writebackDiff}>{provenance.content}</pre>
        </details>
      )}
      <Typography variant="body4" className={styles.writebackNote}>
        This built the commit locally only — nothing has been pushed.
      </Typography>
      <div className={styles.courseRemoveConfirmActions}>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!remote}
          onClick={onPush}
        >
          Push to {remote ?? '(no remote configured)'}
        </Button>
      </div>
      {!remote && (
        <Typography variant="body4" className={styles.writebackNote}>
          {target === 'catalog'
            ? 'Pushing needs AUTHORING_PROPOSE_REMOTE set on the authoring service.'
            : 'Pushing needs AUTHORING_PROPOSE_STAFF_APPS_REMOTE set on the authoring service.'}
          {' '}
          {target === 'catalog'
            ? 'Even then, this only pushes a branch — a human opens the pull request from the compare URL themselves.'
            : 'Even then, a pull request is only opened when gh or a GitHub token is available server-side — otherwise this falls back to the same compare-URL link.'}
        </Typography>
      )}
    </>
  );
}
