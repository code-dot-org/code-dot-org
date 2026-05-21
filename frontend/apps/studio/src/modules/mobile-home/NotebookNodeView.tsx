/**
 * NotebookNodeView — renders a single journey node as a seeded NotebookLab
 * instance with a sticky header (back + progress) and a completion footer.
 *
 * On first render for a given (seatId, nodeIndex) pair the seed notebook is
 * written to IndexedDB so NotebookLab can open it normally.  Subsequent visits
 * reuse the stored copy, preserving any edits the learner made.
 */

import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
} from '@mui/material';
import {useEffect, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import NotebookLab, {
  getNotebook,
  saveNotebook,
} from '@code-dot-org/notebook-lab';
import type {Notebook} from '@code-dot-org/notebook-lab';

import type {Language} from '@/modules/seats/types';

import node01 from './journeys/notebook/nodes/welcome-01-hello.ipynb';
import node02 from './journeys/notebook/nodes/welcome-02-words-and-code.ipynb';
import node03 from './journeys/notebook/nodes/welcome-03-the-dial.ipynb';
import node04 from './journeys/notebook/nodes/welcome-04-saved.ipynb';

// ---------------------------------------------------------------------------
// Node manifest
// ---------------------------------------------------------------------------

/** Ordered list of seed notebooks for each journey node. */
const NODE_SEEDS: Notebook[] = [
  node01 as unknown as Notebook,
  node02 as unknown as Notebook,
  node03 as unknown as Notebook,
  node04 as unknown as Notebook,
];

/** Total number of nodes in the onboarding path. */
export const NOTEBOOK_NODE_COUNT = NODE_SEEDS.length;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for NotebookNodeView. */
export interface NotebookNodeViewProps {
  /** Zero-based index of the node to display (0–3). */
  nodeIndex: number;
  /** Active seat identifier. */
  seatId: string;
  /** Active seat language — synced to NotebookLab's locale store before mount. */
  language: Language;
  /** True if this node has already been completed by the active seat. */
  alreadyComplete: boolean;
  /** Called when the learner taps the completion button. */
  onComplete: () => void;
  /** Called when the learner taps the back arrow. */
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps the studio Language code to the locale string expected by NotebookLab. */
const NOTEBOOK_LOCALE: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

/**
 * Returns the deterministic notebook ID for a given seat + node combination.
 * Any stable string works as a NotebookLabDB key; this avoids storing UUIDs
 * in the seat progress record.
 *
 * @param seatId Active seat identifier
 * @param nodeIndex Zero-based node index
 * @returns Composite notebook ID string
 */
export function nodeNotebookId(seatId: string, nodeIndex: number): string {
  return `${seatId}::journey-node-${nodeIndex}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single onboarding node with a sticky header and completion footer.
 * Seeds the notebook in IndexedDB on first visit, then defers to NotebookLab.
 */
export function NotebookNodeView({
  nodeIndex,
  seatId,
  language,
  alreadyComplete,
  onComplete,
  onBack,
}: NotebookNodeViewProps): React.ReactElement {
  const [seeded, setSeeded] = useState(false);

  const notebookId = nodeNotebookId(seatId, nodeIndex);
  const seed = NODE_SEEDS[nodeIndex];

  // Sync the studio language to the key NotebookLab reads on mount.
  // NotebookLab reads localStorage('nblab.locale.<seatId>') once when the
  // session activates; writing before seeded=true ensures the value is in
  // place before the component renders.
  useEffect(() => {
    localStorage.setItem(`nblab.locale.${seatId}`, NOTEBOOK_LOCALE[language]);
  }, [seatId, language]);

  // Seed the notebook on first visit — no-op on return visits.
  useEffect(() => {
    setSeeded(false);
    if (seed === undefined) {
      setSeeded(true);
      return;
    }
    void (async () => {
      const existing = await getNotebook(seatId, notebookId);
      if (existing === undefined) {
        await saveNotebook(seatId, {
          notebookId,
          seatId,
          notebook: seed,
          created: Date.now(),
          source: 'seed',
        });
      }
      setSeeded(true);
    })();
  }, [seatId, notebookId, seed]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <NodeHeader
        nodeIndex={nodeIndex}
        totalNodes={NOTEBOOK_NODE_COUNT}
        onBack={onBack}
      />

      <Box sx={{flex: 1, overflow: 'hidden', minHeight: 0}}>
        {seeded ? (
          <NotebookLab channelId={notebookId} seatId={seatId} />
        ) : (
          <LoadingSpinner />
        )}
      </Box>

      <NodeFooter alreadyComplete={alreadyComplete} onComplete={onComplete} />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Props for NodeHeader. */
interface NodeHeaderProps {
  nodeIndex: number;
  totalNodes: number;
  onBack: () => void;
}

/**
 * Sticky top bar: AppBar with back chevron + "Python Notebook Lab" title,
 * plus a thin LinearProgress strip showing step position.
 */
function NodeHeader({
  nodeIndex,
  totalNodes,
  onBack,
}: NodeHeaderProps): React.ReactElement {
  const progress = ((nodeIndex + 1) / totalNodes) * 100;
  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{backgroundColor: 'primary.main'}}
      >
        <Toolbar sx={{minHeight: 56, gap: 1}}>
          <IconButton
            onClick={onBack}
            size="small"
            aria-label="Back to journey"
            sx={{
              color: 'primary.contrastText',
              flexShrink: 0,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <Box component="span" sx={{fontSize: '1.5rem', lineHeight: 1}}>
              ‹
            </Box>
          </IconButton>
          <Typography
            variant="subtitle1"
            component="h1"
            sx={{
              flex: 1,
              textAlign: 'center',
              color: 'primary.contrastText',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Python Notebook Lab
          </Typography>
          {/* Right spacer keeps title visually centred. */}
          <Box sx={{width: 44, flexShrink: 0}} />
        </Toolbar>
      </AppBar>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{height: 4, flexShrink: 0}}
      />
    </>
  );
}

/** Props for NodeFooter. */
interface NodeFooterProps {
  alreadyComplete: boolean;
  onComplete: () => void;
}

/** Sticky bottom bar with a completion button. */
function NodeFooter({
  alreadyComplete,
  onComplete,
}: NodeFooterProps): React.ReactElement {
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderTop: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Button
        variant={alreadyComplete ? 'outlined' : 'contained'}
        fullWidth
        startIcon={
          alreadyComplete ? (
            <FontAwesomeV6Icon iconName="circle-check" />
          ) : undefined
        }
        onClick={onComplete}
        disabled={alreadyComplete}
      >
        {alreadyComplete ? 'Complete' : 'Mark complete →'}
      </Button>
    </Box>
  );
}

/** Centered loading spinner shown while seeding. */
function LoadingSpinner(): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
