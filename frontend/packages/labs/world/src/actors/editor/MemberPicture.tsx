// A member drawn as the block it makes (specs/ACTOR_BLOCKS_PLAN.md, step 2).
//
// A read-only workspace holding the one block, sized to it. Not an inline
// one (`BlocklyMarkdown`): that is drawn off the page, where text measures
// as nothing, so a hat's words came out on top of each other.
//
// An image named by its reading. The workspace carries Blockly's own focus
// and roles, so it is made inert: out of the tab order and out of the
// accessibility tree, where the name already says what it shows.

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
  Blockly,
  BlocklyProvider,
  BlocklyWorkspace,
  type BlocklySerialization,
} from '@code-dot-org/blockly';

import {useWorldBlocklyTheme} from '../../blockly/worldBlocklyTheme';

import styles from './actorEditor.module.css';
import type {MemberPalette} from './memberPalette';

export interface MemberPictureProps {
  palette: MemberPalette;
  type: string;
  /** What the picture says: the member's reading (`memberReading`). */
  label: string;
}

/** Room around the block, in pixels. */
const PAD = 4;

const OPTIONS: Blockly.BlocklyOptions = {
  readOnly: true,
  scrollbars: false,
  trashcan: false,
  move: {scrollbars: false, drag: false, wheel: false},
  zoom: {controls: false, wheel: false, startScale: 0.9},
};

export const MemberPicture = ({palette, type, label}: MemberPictureProps) => {
  const {theme} = useWorldBlocklyTheme();
  const drawing = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{width: number; height: number} | null>(
    null,
  );
  // React 18 does not know `inert`, so it is set on the element.
  useEffect(() => {
    drawing.current?.setAttribute('inert', '');
  }, []);
  const startBlocks = useMemo(
    () =>
      ({
        blocks: {languageVersion: 0, blocks: [{type, x: 0, y: 0}]},
      }) as unknown as BlocklySerialization,
    [type],
  );
  // Measured once the block is laid out on the page, and the view moved so
  // the block's corner is the workspace's.
  const fit = useCallback((workspace: Blockly.WorkspaceSvg) => {
    // Drawn now: a queued render measures as the block it was before.
    Blockly.renderManagement.triggerQueuedRenders(workspace);
    const box = workspace.getBlocksBoundingBox();
    const scale = workspace.scale || 1;
    setSize({
      width: Math.ceil((box.right - box.left) * scale) + PAD * 2,
      height: Math.ceil((box.bottom - box.top) * scale) + PAD * 2,
    });
    requestAnimationFrame(() => {
      Blockly.svgResize(workspace);
      workspace.scroll(PAD - box.left * scale, PAD - box.top * scale);
    });
  }, []);
  return (
    <span role="img" aria-label={label} className={styles.memberPicture}>
      <span
        ref={drawing}
        aria-hidden="true"
        className={styles.memberDrawing}
        style={
          size
            ? {width: size.width, height: size.height}
            : {visibility: 'hidden'}
        }
      >
        <BlocklyProvider blocks={palette.blocks} theme={theme}>
          <BlocklyWorkspace
            embedded
            options={OPTIONS}
            startBlocks={startBlocks}
            positionBlocks={fit}
            theme={theme}
          />
        </BlocklyProvider>
      </span>
    </span>
  );
};
