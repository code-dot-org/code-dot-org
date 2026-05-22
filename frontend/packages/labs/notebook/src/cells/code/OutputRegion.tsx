/**
 * OutputRegion — unified output renderer for a code cell.
 *
 * Handles three mutually exclusive rendering paths:
 *   1. Error: parses the raw error string via extractException and delegates
 *      to EmpathyCard.  Stdout is suppressed on error runs.
 *   2. Clean run with stdout and/or MIME results: renders each in turn.
 *   3. No output: renders null.
 *
 * Long stdout (> 20 lines) is collapsed with a "Show all N lines" toggle to
 * avoid overwhelming the viewport.  MIME result rendering supports
 * text/plain, text/html, image/png, and image/svg+xml; all HTML/SVG content
 * is sanitised via DOMPurify before being inserted.
 */

import { useState, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { extractException } from './extractException';
import { EmpathyCard } from './EmpathyCard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of stdout lines shown before the collapse toggle appears. */
const STDOUT_COLLAPSE_THRESHOLD = 20;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for OutputRegion. */
interface OutputRegionProps {
  /** Stdout text accumulated from the last run. */
  stdout: string;
  /** MIME-keyed result objects from execute_result messages. */
  results: Array<Record<string, unknown>>;
  /** Full error string on run failure, or null. */
  error: string | null;
  /** Called when the learner taps "Try again" on the EmpathyCard. */
  onTryAgain: () => void;
}

// ---------------------------------------------------------------------------
// Internal sub-renderers
// ---------------------------------------------------------------------------

/** Props for StdoutBlock. */
interface StdoutBlockProps {
  /** Accumulated stdout text. */
  text: string;
}

/**
 * Renders stdout text in a monospace pre block.
 * When the content exceeds STDOUT_COLLAPSE_THRESHOLD lines a "Show all N
 * lines" button is displayed and the block is clamped to the threshold until
 * expanded.
 */
function StdoutBlock({ text }: StdoutBlockProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const lines = text.split('\n');
  const lineCount = lines.length;
  const isLong = lineCount > STDOUT_COLLAPSE_THRESHOLD;

  const handleExpand = useCallback((): void => {
    setExpanded(true);
  }, []);

  const displayText =
    isLong && !expanded
      ? lines.slice(0, STDOUT_COLLAPSE_THRESHOLD).join('\n')
      : text;

  return (
    <Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflowX: 'auto',
          fontFamily: 'JetBrainsMono, "Fira Mono", monospace',
          fontSize: '0.85rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {displayText}
      </Box>
      {isLong && !expanded && (
        <Button
          variant="text"
          size="small"
          onClick={handleExpand}
          sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: 'none', color: 'text.secondary' }}
        >
          {`Show all ${lineCount} lines`}
        </Button>
      )}
    </Box>
  );
}

/** Props for a single MIME result entry. */
interface MimeResultProps {
  /** MIME-keyed dict from an execute_result message. */
  result: Record<string, unknown>;
}

/**
 * Renders a single MIME result object.
 * Supported MIME types, in preference order:
 *   - text/html (sanitised via DOMPurify)
 *   - image/png (base64 data URI)
 *   - image/svg+xml (sanitised via DOMPurify)
 *   - text/plain (monospace pre)
 * Returns null for unsupported or empty results.
 */
function MimeResult({ result }: MimeResultProps): React.ReactElement | null {
  const html = result['text/html'];
  if (typeof html === 'string') {
    return (
      <Box
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        sx={{ overflowX: 'auto' }}
      />
    );
  }

  const png = result['image/png'];
  if (typeof png === 'string') {
    return (
      <Box component="img"
        src={`data:image/png;base64,${png}`}
        alt="cell output"
        sx={{ maxWidth: '100%', display: 'block' }}
      />
    );
  }

  const svg = result['image/svg+xml'];
  if (typeof svg === 'string') {
    return (
      <Box
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } }) }}
        sx={{ overflowX: 'auto' }}
      />
    );
  }

  const plain = result['text/plain'];
  if (typeof plain === 'string') {
    return (
      <Typography
        component="pre"
        sx={{
          fontFamily: 'JetBrainsMono, "Fira Mono", monospace',
          fontSize: '0.85rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          m: 0,
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        {plain}
      </Typography>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Unified output renderer for a code cell.
 *
 * When `error` is non-null the cell ran with an exception: parse it and show
 * an EmpathyCard.  On a clean run, render stdout and/or MIME results in order.
 * Returns null when there is nothing to display.
 */
export function OutputRegion({
  stdout,
  results,
  error,
  onTryAgain,
}: OutputRegionProps): React.ReactElement | null {
  if (error !== null) {
    const parsed = extractException(error);
    return (
      <EmpathyCard
        name={parsed.name}
        message={parsed.message}
        line={parsed.line}
        traceback={error}
        onTryAgain={onTryAgain}
      />
    );
  }

  const hasStdout = stdout.length > 0;
  const hasResults = results.length > 0;

  if (!hasStdout && !hasResults) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
      {hasStdout && <StdoutBlock text={stdout} />}
      {hasResults && results.map((result, index) => (
        <MimeResult key={index} result={result} />
      ))}
    </Box>
  );
}

export default OutputRegion;
