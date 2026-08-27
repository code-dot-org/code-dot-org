import type {Element} from 'hast';
import {toHtml} from 'hast-util-to-html';
import {useMemo} from 'react';

import {Markdown} from '@code-dot-org/markdown';
import type {MarkdownExtension, MarkdownProps} from '@code-dot-org/markdown';

import type {Plugin} from '../../plugins';
import type {ToolboxFlyout} from '../../toolbox/types';
import type {Theme, Renderer, BlockDefinitions} from '../../types';
import {convertBlocklyXmlToJson, convertBlocklyXmlToToolbox} from '../../xml';
import BlocklyFlyout from '../BlocklyFlyout';
import type {BlocklyFlyoutProps} from '../BlocklyFlyout';
import BlocklyWorkspace from '../BlocklyWorkspace';

import {blockly} from './blockly';

export interface BlocklyMarkdownProps extends MarkdownProps {
  blocks?: BlockDefinitions;
  renderer?: Renderer;
  plugins?: Plugin[];
  theme?: Theme;
  /**
   * Render each embedded `<xml>` as a draggable {@link BlocklyFlyout} instead of
   * a static preview, so readers can drag (or keyboard-place) its blocks into
   * the workspace. Requires a {@link BlocklyProvider} ancestor with a main
   * workspace — the flyout's drag target. Without one, the previews render empty.
   */
  draggable?: boolean;
}

// The XML never depends on a workspace to parse, so one parser serves every
// embedded block across every render.
const parser = new DOMParser();

interface WorkspaceOptions {
  blocks?: BlockDefinitions;
  renderer?: Renderer;
  plugins?: Plugin[];
  theme?: Theme;
  draggable?: boolean;
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
  draggable,
}: WorkspaceOptions): MarkdownExtension => {
  const Workspace = ({node}: {node?: Element}) => {
    if (!node) {
      return null;
    }
    const xml = toHtml(node);
    // Draggable: offer the embedded blocks for drag/keyboard placement into the
    // enclosing provider's main workspace, rather than a read-only preview.
    // containerRole="group" rather than the default "region": this flyout is
    // inline in prose, not a standalone page section, so it must not create a
    // landmark entry. A group + aria-label still announces name and role on
    // focus; it just stays out of the screen-reader landmark navigation list.
    // This also prevents multiple <xml> snippets in one document from
    // producing identically-named "Block palette" region landmarks that are
    // indistinguishable to AT users.
    if (draggable) {
      // inline: an <xml> can appear mid-paragraph in prose, so the flyout flows
      // as an inline-block span (a block element would break the surrounding
      // <p>), matching how the static inline preview renders.
      return (
        <BlocklyFlyout
          containerRole="group"
          inline
          blocks={
            // Embedded markdown snippets are always a flat block list, never
            // a <category>-wrapped toolbox.
            (convertBlocklyXmlToToolbox(parser, xml) as ToolboxFlyout)
              .blocks as BlocklyFlyoutProps['blocks']
          }
        />
      );
    }
    return (
      <BlocklyWorkspace
        blocks={blocks}
        renderer={renderer}
        plugins={plugins}
        theme={theme}
        inline
        startBlocks={convertBlocklyXmlToJson(parser, xml)}
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
  draggable,
  extensions: extraExtensions,
  ...props
}: BlocklyMarkdownProps) => {
  const markdownExtensions = useMemo(
    () => [
      blockly,
      workspaceExtension({blocks, renderer, plugins, theme, draggable}),
      ...(extraExtensions ?? []),
    ],
    [blocks, renderer, plugins, theme, draggable, extraExtensions],
  );

  return <Markdown {...props} extensions={markdownExtensions} />;
};

export default BlocklyMarkdown;
