import {createElement, type ReactNode} from 'react';

import type {MarkdownExtension} from '@code-dot-org/markdown';

const BLOCKLY_TAGS = [
  'block',
  'functional_input',
  'mutation',
  'next',
  'statement',
  'title',
  'field',
  'value',
  'xml',
] as const;

const BLOCKLY_ATTRS = ['block_text', 'id', 'inline', 'name', 'type'];

/*
 * Render each Blockly tag as its own custom element. The `is` attribute mirrors
 * the legacy wrappers and keeps React from warning about the unrecognized tag.
 * createElement is used because these tags are not valid JSX intrinsics.
 */
const passthrough = (tag: string) => {
  // `node` is the source hast node, supplied because the pipeline runs with
  // passNode; drop it so it is not spread onto the DOM element as an attribute.
  const Wrapper = ({
    children,
    node: _node,
    ...rest
  }: {
    children?: ReactNode;
    node?: unknown;
  }) => createElement(tag, {is: tag, ...rest}, children);
  Wrapper.displayName = `Blockly(${tag})`;
  return Wrapper;
};

/**
 * Permits inline Blockly XML (`<xml>`, `<block>`, `<field>`, ...) to survive
 * sanitization, and renders each tag as its custom element.
 *
 * This is the allowlist + passthrough rendering only; turning that XML into a
 * live Blockly workspace is downstream of this extension (see BlocklyMarkdown,
 * which composes a workspace extension over this one). `clobberPrefix` is
 * cleared so the sanitizer does not rewrite Blockly `id`/`name` values — this
 * matches legacy SafeMarkdown, which disabled clobbering entirely. Note the
 * effect is global: enabling this drops DOM-clobbering protection on `id`/`name`
 * for the whole document, so scope its use to trusted Blockly content.
 */
export const blockly: MarkdownExtension = {
  name: 'blockly',
  sanitizeSchema: {
    clobberPrefix: '',
    tagNames: [...BLOCKLY_TAGS],
    attributes: Object.fromEntries(
      BLOCKLY_TAGS.map(tag => [tag, BLOCKLY_ATTRS]),
    ),
  },
  components: Object.fromEntries(
    BLOCKLY_TAGS.map(tag => [tag, passthrough(tag)]),
  ) as MarkdownExtension['components'],
};
