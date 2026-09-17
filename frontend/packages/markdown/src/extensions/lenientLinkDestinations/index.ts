import type {MarkdownExtension} from '../../extension';

// An inline link or image destination: what sits between `](` and the next `)`.
// A destination containing `(` is skipped rather than guessed at -- matching to
// the first `)` would cut a balanced-paren URL in half.
const DESTINATION_RE = /\]\(([^()]*)\)/g;

// A title trailing the destination, in any of the three forms CommonMark
// allows. Anchored to the end so only a real title is peeled off.
const TITLE_RE = /\s+("[^"]*"|'[^']*'|\([^()]*\))$/;

// Opens or closes a fenced code block (up to three leading spaces, per
// CommonMark).
const FENCE_RE = /^ {0,3}(?:`{3,}|~{3,})/;

// An inline code span: a backtick run closed by a run of the same length.
const CODE_SPAN_RE = /(`+)[\s\S]*?\1/g;

/*
 * Percent-encodes the whitespace in one destination, or returns undefined when
 * there is nothing to fix. Surrounding whitespace is dropped rather than
 * encoded: CommonMark already ignores it, so `](\thttps://x)` is well-formed
 * and only the space *inside* a destination is the problem.
 */
const encodeDestination = (raw: string): string | undefined => {
  const core = raw.trim();
  // A newline inside the destination itself is pathological; leave it be.
  if (!core || core.startsWith('<') || core.includes('\n')) {
    return undefined;
  }

  const title = TITLE_RE.exec(core);
  const destination = title ? core.slice(0, title.index) : core;
  if (!/\s/.test(destination)) {
    return undefined;
  }

  return destination.replace(/\s/g, '%20') + (title ? title[0] : '');
};

// Rewrites every destination in a run of markdown that is known to be outside
// both fenced blocks and code spans.
const encodeText = (text: string): string =>
  text.replace(DESTINATION_RE, (match, raw: string) => {
    const encoded = encodeDestination(raw);
    return encoded === undefined ? match : `](${encoded})`;
  });

// Applies encodeText to a run of prose, leaving its inline code spans alone.
// Takes the whole run at once rather than a line at a time, since a code span
// may cross a line ending.
const encodeProse = (prose: string): string => {
  let out = '';
  let last = 0;
  CODE_SPAN_RE.lastIndex = 0;
  let span: RegExpExecArray | null;
  while ((span = CODE_SPAN_RE.exec(prose)) !== null) {
    out += encodeText(prose.slice(last, span.index)) + span[0];
    last = span.index + span[0].length;
  }
  return out + encodeText(prose.slice(last));
};

/*
 * CommonMark ends a link or image destination at the first whitespace, so
 * `![](https://images.code.org/<hash>-cup stack ideas.png)` is not an image at
 * all -- it renders as literal text. Legacy code.org markdown (remark 8, before
 * micromark) accepted the space and percent-encoded it, and curriculum relies
 * on that: images uploaded with spaces in their filenames are referenced this
 * way throughout the lesson plans.
 *
 * This restores that leniency at the source level, which is the only place it
 * can be done -- once the parser has ruled, the link is ordinary text and the
 * structure is gone.
 *
 * Fenced blocks and inline code spans are skipped, so markdown *about* this
 * syntax still renders verbatim.
 */
const preprocessLinkDestinations = (markdown: string): string => {
  if (!markdown.includes('](')) {
    return markdown;
  }

  const out: string[] = [];
  let prose: string[] = [];
  let inFence = false;

  const flushProse = () => {
    if (prose.length) {
      out.push(encodeProse(prose.join('\n')));
      prose = [];
    }
  };

  for (const line of markdown.split('\n')) {
    if (FENCE_RE.test(line)) {
      flushProse();
      inFence = !inFence;
      out.push(line);
    } else if (inFence) {
      out.push(line);
    } else {
      prose.push(line);
    }
  }
  flushProse();

  return out.join('\n');
};

/**
 * Restores legacy leniency for link and image destinations containing spaces
 * (`![](https://example.com/my image.png)`). See the transformer above.
 */
export const lenientLinkDestinations: MarkdownExtension = {
  name: 'lenientLinkDestinations',
  preprocess: preprocessLinkDestinations,
};
