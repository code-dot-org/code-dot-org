import type {Element, Nodes, Root} from 'hast';

import type {MarkdownExtension} from '../../extension';

// Opening line: 3+ colons, optional space, "details", optional space, a
// [summary] in brackets, optional trailing colons. Matches the legacy syntax in
// all its spacing variants (`:::details [x]`, `::: details  [x]`, ...).
const OPEN_RE = /^(:{3,})[ \t]*details[ \t]*\[([^\]]*)\][ \t]*:*[ \t]*$/;
// Closing line: a run of colons on its own.
const CLOSE_RE = /^(:{3,})[ \t]*$/;

/*
 * Rewrites the legacy `::: details [summary] ... :::` block into the
 * `<details>/<summary>` HTML the pipeline already renders. The legacy syntax
 * does not follow markdown's block rules (no blank line after the opener), so it
 * must be rewritten before parsing rather than handled by a remark plugin.
 *
 * Blank lines are inserted around the summary and body so both parse as
 * markdown (summaries are routinely bold/`code`/etc.); the summary's wrapping
 * paragraph is unwrapped afterward by `unwrapSummaryParagraph`. Nesting is
 * tracked with a colon-count stack.
 */
const preprocessDetails = (markdown: string): string => {
  if (!/:{3,}/.test(markdown)) {
    return markdown;
  }
  const out: string[] = [];
  const openColons: number[] = [];

  for (const line of markdown.split('\n')) {
    const open = OPEN_RE.exec(line);
    if (open) {
      openColons.push(open[1].length);
      out.push(
        '<details>',
        '<summary>',
        '',
        open[2].trim(),
        '',
        '</summary>',
        '',
      );
      continue;
    }

    const close = CLOSE_RE.exec(line);
    if (
      close &&
      openColons.length &&
      close[1].length >= openColons[openColons.length - 1]
    ) {
      openColons.pop();
      out.push('', '</details>');
      continue;
    }

    out.push(line);
  }

  // Defensively close anything left open.
  while (openColons.length) {
    openColons.pop();
    out.push('', '</details>');
  }

  return out.join('\n');
};

const isWhitespaceText = (node: Nodes): boolean =>
  node.type === 'text' && node.value.trim() === '';

/*
 * The blank-line rewrite parses each summary's content as a paragraph, leaving
 * `<summary><p>...</p></summary>`. Unwrap that single paragraph so the summary
 * holds inline content (as the legacy plugin produced, and so it is valid —
 * <summary> takes phrasing content, not a block <p>).
 */
const unwrapSummaryParagraph = () => (tree: Root) => {
  const walk = (node: Nodes): void => {
    if (node.type === 'element' && node.tagName === 'summary') {
      const meaningful = node.children.filter(
        child => !isWhitespaceText(child),
      );
      const only = meaningful[0];
      if (
        meaningful.length === 1 &&
        only.type === 'element' &&
        only.tagName === 'p'
      ) {
        node.children = (only as Element).children;
      }
    }
    if ('children' in node) {
      node.children.forEach(child => walk(child));
    }
  };
  walk(tree);
};

/**
 * Collapsible content via the legacy `::: details [summary]` syntax.
 *
 * Authors write (colon and space counts are flexible):
 *
 *     ::: details [**Show a hint**]
 *     The body, which may be any markdown.
 *     :::
 *
 * It renders as `<details><summary>…</summary>…</details>`. `<details>` and
 * `<summary>` are already in the sanitization allowlist, so no schema change is
 * needed. Raw `<details>` HTML works without this extension too; this only adds
 * the `:::` sugar.
 */
export const details: MarkdownExtension = {
  name: 'details',
  preprocess: preprocessDetails,
  rehypePlugins: [unwrapSummaryParagraph],
};
