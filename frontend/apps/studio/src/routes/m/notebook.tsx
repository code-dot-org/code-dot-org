/**
 * Notebook journey route — four-node Python Notebook onboarding path.
 *
 * URL structure:
 *   /m/notebook          — journey map (bubble path overview)
 *   /m/notebook?node=N   — node view (embedded NotebookLab for node N)
 *
 * Flow mirrors AI Decisions:
 *   Home tile tap → /m/notebook (map) → tap bubble → /m/notebook?node=N
 *   → NotebookNodeView → "Mark complete" → next node or celebration.
 *
 * All views are seat-gated: no active seat redirects to /m/home.
 */

import {Box, Button, Typography} from '@mui/material';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useEffect} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useActiveSeat} from '@/modules/seats/useActiveSeat';

import {NotebookJourneyMap} from '../../modules/mobile-home/notebook/NotebookJourneyMap';
import {
  NotebookNodeView,
  NOTEBOOK_NODE_COUNT,
} from '../../modules/mobile-home/NotebookNodeView';

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------

/** Validates and coerces the `?node=N` search parameter. */
function validateSearch(search: Record<string, unknown>): {node?: number} {
  const raw = Number(search.node);
  if (Number.isFinite(raw) && raw >= 0 && raw < NOTEBOOK_NODE_COUNT) {
    return {node: Math.floor(raw)};
  }
  return {};
}

export const Route = createFileRoute('/m/notebook')({
  validateSearch,
  component: NotebookJourneyPage,
});

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

/** Root notebook journey page — dispatches to map, node, or celebration. */
function NotebookJourneyPage(): React.ReactElement {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const {activeSeat, isLoading, markJourneyNodeComplete} = useActiveSeat();

  const notebookProgress = activeSeat?.journeys?.['notebook'];
  const nodes: boolean[] =
    notebookProgress?.kind === 'notebook'
      ? notebookProgress.nodes
      : Array<boolean>(NOTEBOOK_NODE_COUNT).fill(false);
  const graduated =
    notebookProgress?.kind === 'notebook' ? notebookProgress.graduated : false;

  // Redirect to home when no seat is active.
  useEffect(() => {
    if (!isLoading && !activeSeat) {
      void navigate({to: '/m/home', replace: true});
    }
  }, [isLoading, activeSeat, navigate]);

  async function handleComplete(nodeIndex: number): Promise<void> {
    await markJourneyNodeComplete(nodeIndex);
    // Return to the map so the learner sees their updated progress.
    void navigate({to: '/m/notebook', search: {}, replace: true});
  }

  if (isLoading || !activeSeat) {
    return <LoadingBox />;
  }

  // Celebration view — all nodes complete.
  if (graduated) {
    return (
      <CelebrationView
        onBack={() => void navigate({to: '/m/home'})}
        onViewMap={() => void navigate({to: '/m/notebook', search: {}})}
      />
    );
  }

  // Node view — ?node=N param present.
  if (search.node !== undefined) {
    return (
      <NotebookNodeView
        nodeIndex={search.node}
        seatId={activeSeat.id}
        language={activeSeat.language}
        alreadyComplete={nodes[search.node] === true}
        onComplete={() => void handleComplete(search.node as number)}
        onBack={() => void navigate({to: '/m/notebook', search: {}})}
      />
    );
  }

  // Default: journey map.
  return (
    <NotebookJourneyMap
      nodes={nodes}
      seatColor={activeSeat.color}
      onNodeTap={idx => void navigate({to: '/m/notebook', search: {node: idx}})}
      onTapLogo={() => void navigate({to: '/m/home'})}
      onTapSeat={() => void navigate({to: '/m/seats'})}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Centered loading placeholder. */
function LoadingBox(): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography>Loading…</Typography>
    </Box>
  );
}

/** Props for CelebrationView. */
interface CelebrationViewProps {
  onBack: () => void;
  onViewMap: () => void;
}

/** Full-screen celebration shown when all nodes are complete. */
function CelebrationView({
  onBack,
  onViewMap,
}: CelebrationViewProps): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 3,
        px: 4,
        textAlign: 'center',
      }}
    >
      <FontAwesomeV6Icon
        iconName="circle-check"
        style={{fontSize: 72, color: 'var(--mui-palette-success-main)'}}
      />
      <Typography variant="h5" fontWeight={700}>
        You finished the Python Notebook Lab!
      </Typography>
      <Typography color="text.secondary">
        You ran code, used variables, and built your first notebooks. Your work
        is saved — come back any time from the Notebooks tab.
      </Typography>
      <Button variant="contained" onClick={onBack} sx={{mt: 1}}>
        Back to home
      </Button>
      <Button variant="text" onClick={onViewMap}>
        View journey map
      </Button>
    </Box>
  );
}
