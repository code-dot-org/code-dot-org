/**
 * CompletionArtifact — read-only, print-friendly view of an artifact.
 *
 * Renders notebook title, optional unit, generation date, and a table of
 * cells with kind badge, runState chip, and optional output preview.
 * Never renders cell.source.
 */

import './print.css';
import {Box, Chip, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import type {CompletionArtifact as CompletionArtifactType, ArtifactCell, ArtifactOutput, RunState} from './artifactPayload';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for CompletionArtifact. */
export interface CompletionArtifactProps {
  /** Decoded artifact to render. */
  artifact: CompletionArtifactType;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Color mapping for runState chips. */
const RUN_STATE_COLORS: Record<RunState, 'success' | 'error' | 'default'> = {
  'ran-ok': 'success',
  'ran-error': 'error',
  'untried': 'default',
  'n/a': 'default',
};

/** Human-readable labels for runState values. */
const RUN_STATE_LABELS: Record<RunState, string> = {
  'ran-ok': 'Ran OK',
  'ran-error': 'Error',
  'untried': 'Untried',
  'n/a': 'N/A',
};

/**
 * Formats a Unix ms timestamp as a localised date string.
 * @param ms Unix millisecond timestamp
 * @returns Localised date string
 */
function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Renders the output preview for a cell.
 * Images are shown as the placeholder text "[image]" rather than inline data,
 * keeping the print view readable.
 * @param output ArtifactOutput to display
 */
function OutputPreview({output}: {output: ArtifactOutput}): React.ReactElement {
  if (output.kind === 'png' || output.kind === 'svg') {
    return (
      <Typography variant="caption" color="text.secondary" fontStyle="italic">
        [image]
      </Typography>
    );
  }

  return (
    <Typography
      variant="caption"
      component="pre"
      sx={{
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        maxWidth: '40ch',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        m: 0,
      }}
    >
      {output.preview}
    </Typography>
  );
}

/**
 * Renders a single row in the cell table.
 * @param cell ArtifactCell to render
 * @param index Row index for display numbering
 */
function CellRow({cell, index}: {cell: ArtifactCell; index: number}): React.ReactElement {
  const stateColor = RUN_STATE_COLORS[cell.runState];
  const stateLabel = RUN_STATE_LABELS[cell.runState];

  return (
    <TableRow data-artifact-cell>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Chip label={cell.kind} size="small" variant="outlined" />
      </TableCell>
      <TableCell>
        <Chip
          label={stateLabel}
          size="small"
          color={stateColor}
          variant={stateColor === 'default' ? 'outlined' : 'filled'}
        />
      </TableCell>
      <TableCell>
        {cell.lastOutput !== undefined && (
          <OutputPreview output={cell.lastOutput} />
        )}
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Read-only print-friendly view of a CompletionArtifact.
 *
 * Cell sources are never rendered; images are replaced with "[image]"
 * placeholders for clean print output.
 */
export function CompletionArtifact({artifact}: CompletionArtifactProps): React.ReactElement {
  return (
    <Box sx={{p: 3, maxWidth: 800, mx: 'auto'}} className="completion-artifact">
      <Typography variant="h4" gutterBottom>
        {artifact.notebookTitle}
      </Typography>

      {artifact.unit !== undefined && (
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {artifact.unit}
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Generated: {formatDate(artifact.generatedAt)}
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{mt: 2}}>
        <Table size="small" aria-label="Notebook cells summary">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Kind</TableCell>
              <TableCell>Run State</TableCell>
              <TableCell>Output Preview</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artifact.cells.map((cell, index) => (
              <CellRow key={cell.cellId} cell={cell} index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
