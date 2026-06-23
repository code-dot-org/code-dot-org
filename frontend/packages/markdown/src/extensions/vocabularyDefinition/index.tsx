import type {ElementContent, Nodes, Root} from 'hast';
import type {Components} from 'hast-util-to-jsx-runtime';
import type {ReactNode} from 'react';

import type {MarkdownExtension} from '../../extension';

import moduleStyles from './vocabularyDefinition.module.css';

/** A resolved vocabulary term. */
export interface VocabularyTerm {
  /** Display text. Defaults to the term key from the source. */
  word?: string;
  /** The definition, shown in the tooltip. */
  definition: string;
}

/**
 * Resolves a vocabulary term key to its definition. Synchronous: it should read
 * already-fetched data (e.g. a cache populated by an API call) and return
 * `undefined` on a miss. When the backing data later loads and the consumer
 * re-renders, the term re-resolves automatically.
 */
export type VocabularyLookup = (term: string) => VocabularyTerm | undefined;

export interface VocabularyDefinitionOptions {
  lookup: VocabularyLookup;
}

// `[v term]` — the term may contain spaces; capture everything up to `]`.
const VOCAB_TEST = /\[v [^\]]+\]/;
const VOCAB_RE = /\[v ([^\]]+)\]/g;
// Don't rewrite the syntax inside code, where it is literal.
const SKIP_TAGS = new Set(['code', 'pre']);

// Split a text value into text/`<vocab>` nodes around each `[v term]`.
const splitVocab = (value: string): ElementContent[] => {
  const parts: ElementContent[] = [];
  let last = 0;
  VOCAB_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = VOCAB_RE.exec(value)) !== null) {
    if (match.index > last) {
      parts.push({type: 'text', value: value.slice(last, match.index)});
    }
    parts.push({
      type: 'element',
      tagName: 'vocab',
      properties: {},
      children: [{type: 'text', value: match[1].trim()}],
    });
    last = match.index + match[0].length;
  }
  if (last < value.length) {
    parts.push({type: 'text', value: value.slice(last)});
  }
  return parts;
};

const vocabularySyntax = () => (tree: Root) => {
  const walk = (node: Nodes): void => {
    if (node.type === 'element' && SKIP_TAGS.has(node.tagName)) {
      return;
    }
    if (!('children' in node)) {
      return;
    }
    const next: ElementContent[] = [];
    for (const child of node.children) {
      if (child.type === 'text' && VOCAB_TEST.test(child.value)) {
        next.push(...splitVocab(child.value));
      } else {
        next.push(child as ElementContent);
        walk(child);
      }
    }
    node.children = next as typeof node.children;
  };
  walk(tree);
};

const textOf = (children: ReactNode): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(textOf).join('');
  }
  return '';
};

const makeVocab = (lookup: VocabularyLookup) => {
  const Vocab = ({children}: {children?: ReactNode}) => {
    const term = textOf(children).trim();
    const entry = lookup(term);

    // Fallback: an unknown term renders as its plain text.
    if (!entry) {
      return <span>{term}</span>;
    }

    // The definition shows in a native title tooltip. Vocab terms are inline
    // (mid-sentence), so this must be a phrasing element; the design-system
    // tooltip wraps its trigger in a block <div>, which is invalid inside the
    // <p> a term lives in. The native title is also what the legacy feature used.
    return (
      <span className={moduleStyles.vocab} title={entry.definition}>
        {entry.word ?? term}
      </span>
    );
  };
  Vocab.displayName = 'VocabularyDefinition';
  return Vocab;
};

/**
 * Resolves the `[v term]` syntax against an injected lookup, rendering each
 * known term with its definition in a hover tooltip and falling back to the
 * bare term otherwise.
 *
 * The lookup is synchronous (rendering is): point it at already-fetched data.
 * This replaces the legacy flow where Dashboard resolved `[v key]` server-side
 * against the database; resolution now happens client-side via the consumer's
 * data (eventually an API call).
 */
export const vocabularyDefinition = ({
  lookup,
}: VocabularyDefinitionOptions): MarkdownExtension => ({
  name: 'vocabularyDefinition',
  rehypePlugins: [vocabularySyntax],
  // `vocab` is the custom element the syntax produces; allow it through
  // sanitization. (A dedicated tag avoids colliding with the <span>-based
  // extensions.)
  sanitizeSchema: {tagNames: ['vocab']},
  components: {vocab: makeVocab(lookup)} as Partial<Components>,
});
