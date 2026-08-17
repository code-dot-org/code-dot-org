import {
  Markdown,
  type MarkdownExtension,
  type MarkdownProps,
} from '@code-dot-org/markdown';
import * as BlocklyCore from 'blockly/core';
import React, {
  createElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import {blockly} from './blockly';

// Default gate: create the workspace right away.
const createImmediately = (create: () => void) => create();

interface WorkspaceProps {
  /**
   * The passthrough-rendered Blockly subtree (`<block>`, `<field>`, ...) for one
   * `<xml>`, as mapped by the {@link blockly} extension.
   */
  children?: ReactNode;
  isRtl?: boolean;
  /** Called after this workspace (re)builds — e.g. so a host can resize. */
  onRender?: () => void;
  /**
   * Gate for workspace creation: receives a callback and decides when to run it.
   * Defaults to immediate. A lab passes `Blockly.BlockSpace.onMainBlockSpaceCreated`
   * so embedded workspaces are not built before the main one exists.
   */
  defer?: (create: () => void) => void;
}

/**
 * Renders a single embedded `<xml>` as a read-only Blockly workspace, using the
 * stock Blockly instance shared by the labs (`Blockly.createEmbeddedWorkspace`).
 *
 * Two sibling elements keep React and Blockly from fighting over one node — the
 * hazard the imperative legacy `convertXmlToBlockly` scan lived with:
 *
 *   - a hidden `<xml>`, owned by React, holding the passthrough-rendered blocks.
 *     Blockly only *reads* it (via `domToText`), never mutates it, so React
 *     stays the sole writer.
 *   - an empty host `<span>`, into which Blockly injects (and owns) the rendered
 *     workspace SVG, exactly as the dance-party AiBlockPreview component does.
 *
 * Creation runs in a layout effect (like the legacy EmbeddedWorkspace's
 * componentDidMount) so a host's own layout phase sees the built blocks; it is
 * rebuilt only when the serialized block content or reading direction changes,
 * and disposed on unmount.
 */
const BlocklyMarkdownWorkspace = ({
  children,
  isRtl = false,
  onRender,
  defer = createImmediately,
}: WorkspaceProps) => {
  const xmlRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLSpanElement>(null);
  const workspaceRef = useRef<BlocklyCore.WorkspaceSvg | null>(null);
  // Signature of the last workspace we built, so re-renders that change nothing
  // observable leave the existing workspace (and its SVG) untouched.
  const lastSignature = useRef<string | null>(null);
  // Set on unmount so a deferred creation that fires late becomes a no-op.
  const unmounted = useRef(false);

  // Runs after every render; the signature guard makes it idempotent. Refs are
  // populated before layout effects run, so xmlRef holds the freshly rendered
  // blocks.
  useLayoutEffect(() => {
    const xml = xmlRef.current;
    const host = hostRef.current;
    if (!xml || !host) {
      return;
    }

    const signature = `${isRtl}|${xml.innerHTML}`;
    if (signature === lastSignature.current) {
      return;
    }
    lastSignature.current = signature;

    defer(() => {
      if (unmounted.current || !xmlRef.current || !hostRef.current) {
        return;
      }
      workspaceRef.current?.dispose();
      workspaceRef.current = Blockly.createEmbeddedWorkspace(
        hostRef.current,
        xmlRef.current,
        {
          // Fall back to the wrapper's default theme (CdoTheme) when no main
          // workspace exists yet — e.g. standalone documentation with no lab.
          theme: Blockly.getMainWorkspace()?.getTheme(),
          rtl: isRtl,
        } as BlocklyCore.BlocklyOptions
      );
      onRender?.();
    });
  });

  // Dispose on unmount, tearing down Blockly's listeners and injected SVG, and
  // disarm any still-pending deferred creation.
  useEffect(
    () => () => {
      unmounted.current = true;
      workspaceRef.current?.dispose();
    },
    []
  );

  return (
    <>
      {createElement(
        'xml',
        {is: 'xml', ref: xmlRef, style: {display: 'none'}},
        children
      )}
      <span ref={hostRef} />
    </>
  );
};

/*
 * An extension whose only job is to turn each embedded `<xml>` into a live
 * workspace. It overrides the passthrough `xml` mapping the `blockly` extension
 * (composed ahead of it) installed; the inner block tags keep their passthrough
 * mapping, so `<xml>`'s children render as the DOM blocks the workspace reads.
 */
const workspaceExtension = (
  isRtl: boolean,
  onRender?: () => void,
  defer?: (create: () => void) => void
): MarkdownExtension => ({
  name: 'blockly-workspace',
  components: {
    xml: ({children}: {children?: ReactNode}) => (
      <BlocklyMarkdownWorkspace isRtl={isRtl} onRender={onRender} defer={defer}>
        {children}
      </BlocklyMarkdownWorkspace>
    ),
  } as MarkdownExtension['components'],
});

export interface BlocklyMarkdownProps extends MarkdownProps {
  /** True when displaying in a right-to-left language. */
  isRtl?: boolean;
  /**
   * Called after each embedded workspace (re)builds. A host uses this to react
   * to the layout change embedded blocks cause (e.g. resize an instructions
   * pane), since the blocks may appear asynchronously under {@link
   * BlocklyMarkdownProps.deferWorkspaceCreation}.
   */
  onWorkspaceRender?: () => void;
  /**
   * Optionally hold each embedded workspace's creation until some condition is
   * met, by supplying a function that runs the given create callback when ready.
   * Defaults to creating immediately. Lab consumers pass
   * `Blockly.BlockSpace.onMainBlockSpaceCreated` so no embedded workspace is
   * built before the main block space (Blockly assumes the main one exists).
   */
  deferWorkspaceCreation?: (create: () => void) => void;
}

/**
 * A markdown renderer that recognizes embedded `<xml>` sequences as read-only
 * Blockly workspaces — for instructions or documentation with inline blocks.
 *
 * Built on the shared `Markdown` component: the `blockly` extension permits the
 * Blockly tags past sanitization, and a local extension renders each `<xml>`
 * with the stock Blockly used across the labs. This deliberately avoids the
 * heavier `@code-dot-org/blockly` workspace package. Callers may pass additional
 * `extensions`; they compose after the Blockly handling.
 *
 * SECURITY: render TRUSTED content only (curriculum/levelbuilder markdown). The
 * `blockly` extension clears the sanitizer's `clobberPrefix`, dropping
 * DOM-clobbering protection on `id`/`name` for the whole document. Do not point
 * this component at student-authored or otherwise untrusted markdown.
 *
 * This will be eventually replaced by the BlocklyMarkdown in the frontend
 * Blockly package.
 */
const BlocklyMarkdown = ({
  isRtl = false,
  onWorkspaceRender,
  deferWorkspaceCreation,
  extensions: extraExtensions,
  ...props
}: BlocklyMarkdownProps) => {
  const markdownExtensions = useMemo(
    () => [
      blockly,
      workspaceExtension(isRtl, onWorkspaceRender, deferWorkspaceCreation),
      ...(extraExtensions ?? []),
    ],
    [isRtl, onWorkspaceRender, deferWorkspaceCreation, extraExtensions]
  );

  return <Markdown {...props} extensions={markdownExtensions} />;
};

export default BlocklyMarkdown;
