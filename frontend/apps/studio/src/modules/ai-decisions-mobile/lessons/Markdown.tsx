/**
 * Markdown — tiny inline markdown renderer for prod content text.
 *
 * Supports the subset prod actually uses in `.multi` / `.level_group` /
 * `long_instructions`:
 *   - `**bold**` and `__bold__`
 *   - `*italic*` and `_italic_`
 *   - headings `# … ######`
 *   - `[text](url)` links
 *   - `![alt](url)` images
 *   - `- item` and `1. item` lists
 *   - `> blockquote`
 *   - `` `code` `` inline code
 *   - blank-line paragraph breaks
 *
 * Deliberately tiny — no nested constructs, no tables, no syntax
 * highlighting.  Anything not handled passes through as plain text.
 *
 * Adding a real `react-markdown` dep would be cleaner but inflates the
 * bundle; this string-level parser keeps the mobile bundle small.
 */

import {Box, Link, Typography} from '@mui/material';
import type {ReactNode} from 'react';

export interface MarkdownProps {
  text: string;
  /** Optional sx override for the container. */
  sx?: object;
}

/** Detect HTML-bearing content (any `<tag>` or `<tag attr>` in the text).
 * Prod `.external` files for K-5 AI Data sometimes embed `<h3>`, `<img>`,
 * `<a>`, `<br>` etc. — those bypass our tiny markdown parser and render
 * through HTML pass-through instead. */
function hasHtmlTags(text: string): boolean {
  return /<[a-zA-Z][^>]*>/.test(text);
}

/** Render markdown text as React elements. */
export function Markdown({text, sx}: MarkdownProps) {
  if (!text) return null;
  // HTML content: pass through to dangerouslySetInnerHTML.  Content
  // origin is dashboard/config (internal, trusted) — XSS isn't in scope
  // for this prototype.  Styling targets common tags only.
  if (hasHtmlTags(text)) {
    return <HtmlPassthrough html={text} sx={sx} />;
  }
  // Normalise line endings.
  const normalised = text.replace(/\r\n/g, '\n');
  // Split into block-level chunks by blank lines.
  const blocks = normalised.split(/\n\s*\n/);
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, ...sx}}>
      {blocks.map((block, i) => (
        <BlockEl key={i} text={block} />
      ))}
    </Box>
  );
}

/** Render HTML-bearing prod content with mobile-friendly tag styling. */
function HtmlPassthrough({html, sx}: {html: string; sx?: object}) {
  // Prod content is desktop-authored: inline styles size things at 20%
  // width with float:left, and chunks of `<br><br><br>` exist for
  // spacer purposes.  Strip those so mobile flows full-width.  Also
  // convert leading `> ` markdown blockquotes into <blockquote>, and
  // inline `**bold**` into <strong>, since prod mixes both flavours.
  const sanitised = html
    .replace(/style="[^"]*"/gi, '')
    .replace(/^>\s?/gm, '')
    .replace(/(<br\s*\/?>\s*){2,}/gi, '<br />')
    .replace(/(<br\s*\/?>\s*)+$/i, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  return (
    <Box
      sx={{
        '& h3, & h4, & h5': {fontSize: '1.1rem', fontWeight: 700, marginY: 1},
        '& strong': {fontWeight: 700},
        '& a': {color: 'primary.main', textDecoration: 'underline'},
        // Prod authors size images for desktop (e.g. width:20%); on mobile
        // we force full-width so K-5 learners can actually see them.
        '& img': {
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          marginY: 1,
          borderRadius: 1,
        },
        '& details': {marginY: 1},
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          paddingLeft: 1.5,
          marginY: 1,
        },
        ...sx,
      }}
      dangerouslySetInnerHTML={{__html: sanitised}}
    />
  );
}

/** Render a single block (paragraph, heading, list, blockquote). */
function BlockEl({text}: {text: string}) {
  const t = text.trim();
  if (!t) return null;
  // Headings
  const h = t.match(/^(#{1,6})\s+(.*)$/);
  if (h) {
    const level = h[1].length;
    const sizes = [
      'h4',
      'h5',
      'h6',
      'subtitle1',
      'subtitle2',
      'body1',
    ] as const;
    return (
      <Typography
        variant={sizes[level - 1]}
        component="div"
        sx={{fontWeight: 700}}
      >
        {renderInline(h[2])}
      </Typography>
    );
  }
  // Blockquote
  if (t.startsWith('> ')) {
    return (
      <Box
        sx={{
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          paddingLeft: 1.5,
          fontStyle: 'italic',
        }}
      >
        <Typography component="div">
          {renderInline(t.replace(/^>\s*/gm, ''))}
        </Typography>
      </Box>
    );
  }
  // Unordered list
  if (
    t
      .split('\n')
      .every(l => /^-\s+/.test(l) || /^\d+\.\s+/.test(l) || l.trim() === '')
  ) {
    const items = t
      .split('\n')
      .filter(l => l.trim())
      .map(l => l.replace(/^(-|\d+\.)\s+/, ''));
    const isOrdered = /^\d+\.\s+/.test(t.split('\n')[0]);
    return (
      <Box component={isOrdered ? 'ol' : 'ul'} sx={{paddingLeft: 3, margin: 0}}>
        {items.map((item, i) => (
          <Box component="li" key={i}>
            {renderInline(item)}
          </Box>
        ))}
      </Box>
    );
  }
  // Plain paragraph (line breaks inside the block become <br/>).
  return (
    <Typography component="div" variant="body1">
      {t.split('\n').map((line, i, arr) => (
        <span key={i}>
          {renderInline(line)}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </Typography>
  );
}

/** Render inline markdown (bold, italic, links, images, inline code). */
function renderInline(s: string): ReactNode {
  // Process in order: image → link → bold → italic → code → text.
  const parts: ReactNode[] = [];
  let remaining = s;
  let key = 0;
  while (remaining.length > 0) {
    // ![alt](url)
    let m = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (m) {
      parts.push(
        <Box
          component="img"
          key={key++}
          src={m[2]}
          alt={m[1]}
          sx={{maxWidth: '100%', verticalAlign: 'middle'}}
        />,
      );
      remaining = remaining.slice(m[0].length);
      continue;
    }
    // [text](url)
    m = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (m) {
      parts.push(
        <Link key={key++} href={m[2]} target="_blank" rel="noreferrer">
          {m[1]}
        </Link>,
      );
      remaining = remaining.slice(m[0].length);
      continue;
    }
    // **bold**.  Drop __bold__ flavor to avoid clashing with snake_case identifiers.
    m = remaining.match(/^\*\*([^*]+)\*\*/);
    if (m) {
      parts.push(<strong key={key++}>{m[1]}</strong>);
      remaining = remaining.slice(m[0].length);
      continue;
    }
    // *italic* (single).  Skip `_italic_` form because prod uses
    // underscored identifiers like `k5_ai_student_data` which would
    // falsely render as italic.  Keep only the `*` flavor for italic.
    m = remaining.match(/^\*([^*\s][^*]*)\*/);
    if (m) {
      parts.push(<em key={key++}>{m[1]}</em>);
      remaining = remaining.slice(m[0].length);
      continue;
    }
    // `code`
    m = remaining.match(/^`([^`]+)`/);
    if (m) {
      parts.push(
        <Box
          component="code"
          key={key++}
          sx={{
            backgroundColor: '#FFBD46',
            color: '#000',
            padding: '0 4px',
            borderRadius: 0.5,
            fontFamily: 'monospace',
          }}
        >
          {m[1]}
        </Box>,
      );
      remaining = remaining.slice(m[0].length);
      continue;
    }
    // Plain character — take everything up to the next special marker.
    const nextSpecial = remaining.search(/(!?\[|\*|`)/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    }
    if (nextSpecial === 0) {
      // Special marker didn't match a pattern — consume one char as literal.
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }
  return <>{parts}</>;
}
