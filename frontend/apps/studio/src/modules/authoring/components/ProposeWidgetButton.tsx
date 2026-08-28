import {Button, Popover, Typography} from '@mui/material';
import {useState} from 'react';

import {authoringApi, type ProposeWidgetResult} from '../api';
import {useProposeConfig} from '../hooks';

import styles from './authoring.module.scss';

type ProposePhase = 'idle' | 'preview' | 'pushing' | 'pushed' | 'error';

/**
 * "Propose for catalog" — graduates a session widget into a real pull
 * request onto @code-dot-org/widgets-catalog (widget PR flow plan, Pass 5).
 * Same confirm/busy/success/error shape as PublishButton and
 * WritebackButton (AuthoringTopBar.tsx), with one difference: opening the
 * popover runs a `dry-run` propose immediately, so the dialog always shows
 * the server's real file list, slug, version and gate results rather than a
 * client-side guess — including a refusal (gate violations, a slug
 * collision), which renders in this same phase rather than as a separate
 * error state. Pushing is a distinct second step, disabled unless a remote
 * is configured server-side (useProposeConfig) — this component never
 * fabricates one.
 */
export function ProposeWidgetButton({widgetId}: {widgetId: string}) {
  const {data: config} = useProposeConfig();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [phase, setPhase] = useState<ProposePhase>('idle');
  const [dryRun, setDryRun] = useState<ProposeWidgetResult | undefined>();
  const [pushResult, setPushResult] = useState<ProposeWidgetResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const open = Boolean(anchorEl);
  const remote = config?.remote;

  const close = () => {
    setAnchorEl(null);
    setPhase('idle');
    setDryRun(undefined);
    setPushResult(undefined);
    setError(undefined);
  };

  const openDialog = async (target: HTMLButtonElement) => {
    setAnchorEl(target);
    setPhase('preview');
    try {
      const result = await authoringApi.proposeWidget(widgetId, {
        mode: 'dry-run',
      });
      setDryRun(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That check failed to run.');
      setPhase('error');
    }
  };

  const runPush = async () => {
    if (!remote) {
      return;
    }
    setPhase('pushing');
    try {
      const result = await authoringApi.proposeWidget(widgetId, {
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
        onClick={e => void openDialog(e.currentTarget)}
      >
        Propose for catalog
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      >
        <div className={styles.writebackDialog}>
          {phase === 'preview' && !dryRun && (
            <Typography variant="body2">Checking the widget's gates…</Typography>
          )}
          {phase === 'preview' && dryRun && (
            <ProposePreview
              dryRun={dryRun}
              remote={remote}
              onPush={() => void runPush()}
              onClose={close}
            />
          )}
          {phase === 'pushing' && <Typography variant="body2">Pushing…</Typography>}
          {phase === 'pushed' && pushResult?.ok && (
            <>
              <Typography variant="body2">
                Pushed <code>{pushResult.branch}</code> to {remote}. No pull
                request was opened — open one yourself from the compare page:
              </Typography>
              {pushResult.compareUrl && (
                <a href={pushResult.compareUrl} target="_blank" rel="noreferrer">
                  {pushResult.compareUrl}
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

function ProposePreview({
  dryRun,
  remote,
  onPush,
  onClose,
}: {
  dryRun: ProposeWidgetResult;
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

  return (
    <>
      <Typography variant="h6" component="h2">
        Propose {dryRun.slug} v{dryRun.version}?
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
          Pushing needs AUTHORING_PROPOSE_REMOTE set on the authoring
          service. Even then, this only pushes a branch — a human opens the
          pull request from the compare URL themselves.
        </Typography>
      )}
    </>
  );
}
