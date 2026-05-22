/**
 * Markdown cell renderer.
 *
 * Applies locale-aware source resolution (via cell.metadata.i18n), parses the
 * result with `marked` in GFM+breaks mode, sanitises the HTML through
 * DOMPurify, and injects it via dangerouslySetInnerHTML.
 *
 * DOMPurify guards against XSS in curriculum-authored content, which may
 * arrive via the import path without prior server-side vetting.
 */

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { Cell } from '../../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for MarkdownCell. */
interface MarkdownCellProps {
  /** Cell object containing source and optional locale overrides. */
  cell: Cell;
  /** Active locale for i18n source resolution. */
  locale: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the displayable source for a markdown cell.
 * Uses `cell.metadata.i18n[locale]` when available, falling back to
 * `cell.source`, then to an empty array.
 *
 * @param cell Source cell
 * @param locale Active locale string
 * @returns Joined source string ready for the markdown parser
 */
function resolveMarkdownSource(cell: Cell, locale: string): string {
  const i18n = cell.metadata.i18n;
  const lines = (i18n && i18n[locale]) ?? cell.source ?? [];
  return lines.join('');
}

/**
 * Parses markdown to HTML and sanitises the result.
 * `marked.parse` returns `string | Promise<string>` in v15+; the synchronous
 * overload is selected by passing `async: false` explicitly.
 *
 * @param source Raw markdown string
 * @returns Sanitised HTML string safe for dangerouslySetInnerHTML
 */
function renderMarkdown(source: string): string {
  const raw = marked.parse(source, { gfm: true, breaks: true, async: false }) as string;
  return DOMPurify.sanitize(raw);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a markdown cell as sanitised HTML prose inside a MUI Box.
 */
export function MarkdownCell({ cell, locale }: MarkdownCellProps): React.ReactElement {
  const source = useMemo(
    () => resolveMarkdownSource(cell, locale),
    [cell, locale]
  );

  const html = useMemo(() => renderMarkdown(source), [source]);

  return (
    <Box
      sx={{
        p: 2,
        color: 'text.primary',
        lineHeight: 1.7,
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          color: 'text.primary',
          mt: 2,
          mb: 1,
        },
        '& p': { mt: 0, mb: 1 },
        '& code': {
          fontFamily: 'JetBrainsMono, "Fira Mono", monospace',
          bgcolor: 'action.hover',
          px: 0.5,
          borderRadius: 0.5,
        },
        '& pre': {
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          overflowX: 'auto',
        },
        '& ul, & ol': { pl: 3, mb: 1 },
        '& a': { color: 'primary.main' },
        '& blockquote': {
          borderLeft: 4,
          borderColor: 'divider',
          pl: 2,
          my: 1,
          color: 'text.secondary',
        },
      }}
      // DOMPurify sanitises the HTML before it reaches the DOM.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownCell;
