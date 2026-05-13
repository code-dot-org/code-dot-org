/**
 * Shared markdown options used by `<AiTutorChat>` for tutor bubbles, and
 * exported so callers (lesson hosts, stage components) can render authored
 * content — MC chip labels, stage notes, summary bullets — with the *exact
 * same* rules. Keeps formatting consistent across the chat panel and the
 * stage, and means K–5-targeted content can use `**bold**` / `` `code` ``
 * / bullet lists once and have it render correctly everywhere.
 *
 * Paragraph tags collapse into `<span>` so callers can drop markdown into
 * any container without nested-paragraph margin chaos. `disableParsingRawHTML`
 * keeps the renderer safe — no embedded HTML, ever.
 */

export const MARKDOWN_OPTIONS = {
  overrides: {
    p: {component: 'span', props: {style: {display: 'block'}}},
  },
  disableParsingRawHTML: true,
} as const;
