/**
 * Pure UI component for surfacing a Python exception to the learner.
 *
 * Translates a raw exception into a friendly message via getEmpathyMessage,
 * optionally shows the line number, and hides the full traceback behind a
 * disclosure toggle so it is accessible to curious students without being
 * the first thing they see.
 *
 * This component has no runtime store dependency; all data flows through props.
 */

import {useState, useCallback} from 'react';
import {Box, Button, Collapse, Typography} from '@mui/material';
import {getEmpathyMessage} from './empathyMessages';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the EmpathyCard component. */
export interface EmpathyCardProps {
  /** Exception class name (e.g. "NameError", "SyntaxError"). */
  name: string;
  /** Raw exception message (e.g. "name 'x' is not defined"). */
  message: string;
  /** 1-based line number of the offending line, if determinable. */
  line?: number;
  /** Full traceback string shown under the disclosure toggle. */
  traceback: string;
  /** Called when the learner clicks the "Try again" button. */
  onTryAgain: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a learner-facing error card with a friendly one-liner, an optional
 * line label, a "Show details" disclosure for the raw traceback, and a
 * "Try again" action.
 */
export function EmpathyCard({
  name,
  message,
  line,
  traceback,
  onTryAgain,
}: EmpathyCardProps): React.ReactElement {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleToggleDetails = useCallback((): void => {
    setDetailsOpen(prev => !prev);
  }, []);

  const friendlyMessage = getEmpathyMessage(name, message);
  const detailsLabel = detailsOpen ? 'Hide details' : 'Show details';

  return (
    <Box
      role="alert"
      sx={{
        mt: 1,
        p: 1.5,
        bgcolor: 'error.light',
        borderRadius: 1,
        border: 1,
        borderColor: 'error.main',
      }}
    >
      {/* Error title */}
      <Typography variant="subtitle2" color="error.dark" gutterBottom>
        Something went wrong
      </Typography>

      {/* Optional line number badge */}
      {line !== undefined && (
        <Typography variant="caption" color="error.dark" display="block" gutterBottom>
          {`Line ${line}`}
        </Typography>
      )}

      {/* Friendly one-liner */}
      <Typography variant="body2" color="error.dark" gutterBottom>
        {friendlyMessage}
      </Typography>

      {/* Action row */}
      <Box sx={{display: 'flex', gap: 1, mt: 1}}>
        <Button size="small" variant="outlined" color="error" onClick={handleToggleDetails}>
          {detailsLabel}
        </Button>
        <Button size="small" variant="contained" color="error" onClick={onTryAgain}>
          Try again
        </Button>
      </Box>

      {/* Disclosure: raw traceback */}
      <Collapse in={detailsOpen}>
        <Box
          component="pre"
          data-testid="empathy-traceback"
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 0.5,
            fontSize: '0.78rem',
            fontFamily: 'JetBrainsMono, "Fira Mono", monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowX: 'auto',
          }}
        >
          {traceback}
        </Box>
      </Collapse>
    </Box>
  );
}
