import type {Element} from 'hast';
import {toHtml} from 'hast-util-to-html';
import {useMemo} from 'react';

import {Markdown} from '@code-dot-org/markdown';
import type {MarkdownExtension, MarkdownProps} from '@code-dot-org/markdown';

import type {Plugin} from '../../plugins';
import type {Theme, Renderer, BlockDefinitions} from '../../types';
import {convertBlocklyXmlToJson} from '../../xml';
import BlocklyWorkspace from '../BlocklyWorkspace';

import {blockly} from './blockly';

export interface BlocklyMarkdownProps extends MarkdownProps {
  blocks?: BlockDefinitions;
  renderer?: Renderer;
  plugins?: Plugin[];
  theme?: Theme;
}

// The XML never depends on a workspace to parse, so one parser serves every
// embedded block across every render.
const parser = new DOMParser();

interface WorkspaceOptions {
  blocks?: BlockDefinitions;
  renderer?: Renderer;
  plugins?: Plugin[];
  theme?: Theme;
}

/*
 * An extension whose only job is to render each embedded `<xml>` as a live,
 * inline Blockly workspace. The `blockly` extension (composed ahead of this one)
 * has already widened the sanitizer allowlist so the `<xml>` subtree survives;
 * here we override its passthrough `xml` mapping with the real workspace.
 *
 * The mapped component receives its source hast node (the pipeline runs with
 * passNode). We re-serialize that subtree to an XML string and parse it into the
 * workspace's start blocks — operating on the tree rather than walking rendered
 * React, which the markdown package documents as the fragile path it replaced.
 */
const workspaceExtension = ({
  blocks,
  renderer,
  plugins,
  theme,
}: WorkspaceOptions): MarkdownExtension => {
  const Workspace = ({node}: {node?: Element}) => {
    if (!node) {
      return null;
    }
    return (
      <BlocklyWorkspace
        blocks={blocks}
        renderer={renderer}
        plugins={plugins}
        theme={theme}
        inline
        startBlocks={convertBlocklyXmlToJson(parser, toHtml(node))}
      />
    );
  };
  Workspace.displayName = 'BlocklyMarkdownWorkspace';

  return {
    name: 'blockly-workspace',
    components: {xml: Workspace} as MarkdownExtension['components'],
  };
};

/**
 * A markdown renderer that recognizes embedded `<xml>` sequences as Blockly
 * workspaces, useful for instructions or documentation with inline blocks.
 *
 * Built on the shared `Markdown` component: the `blockly` extension permits the
 * Blockly tags past sanitization, and a local extension turns each `<xml>` into
 * a live workspace. Callers may pass additional `extensions`; they compose after
 * the Blockly handling.
 *
 * SECURITY: render TRUSTED content only (curriculum/levelbuilder markdown). The
 * `blockly` extension clears the sanitizer's `clobberPrefix`, which drops
 * DOM-clobbering protection on `id`/`name` for the whole document. Do not point
 * this component at student-authored or otherwise untrusted markdown.
 */
const BlocklyMarkdown = ({
  blocks,
  renderer,
  plugins,
  theme,
  extensions: extraExtensions,
  ...props
}: BlocklyMarkdownProps) => {
  const markdownExtensions = useMemo(
    () => [
      blockly,
      workspaceExtension({blocks, renderer, plugins, theme}),
      ...(extraExtensions ?? []),
    ],
    [blocks, renderer, plugins, theme, extraExtensions],
  );

  return <Markdown {...props} extensions={markdownExtensions} />;
};

export default BlocklyMarkdown;
