import Popover from '@code-dot-org/component-library/popover';
import classNames from 'classnames';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

import {BlockHelp} from '../blockHelp/blockHelpContent';

import moduleStyles from './sprite-lab2-view.module.scss';

// The design system's tail is this far from the callout's edge.
const TAIL_PX = 12;
const VIEWPORT_MARGIN_PX = 8;

interface BlockHelpCalloutProps {
  help: BlockHelp;
  /** The help icon's screen rectangle; the callout opens to its right. */
  anchor: DOMRect;
  onClose: () => void;
}

/**
 * The callout a toolbox help icon opens: the design system's popover, fixed
 * to the right of the icon with its tail on the icon. It is kept on screen,
 * and the tail slides to stay on the icon when the body is clamped. Rendered
 * in place (not portaled) so the lab's theme reaches it.
 */
const BlockHelpCallout: React.FunctionComponent<BlockHelpCalloutProps> = ({
  help,
  anchor,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{top: number; tailTop: number}>();

  useLayoutEffect(() => {
    const height = ref.current?.offsetHeight ?? 0;
    const anchorMiddle = anchor.top + anchor.height / 2;
    const top = Math.min(
      Math.max(anchorMiddle - height / 2, VIEWPORT_MARGIN_PX),
      window.innerHeight - height - VIEWPORT_MARGIN_PX
    );
    setLayout({top, tailTop: anchorMiddle - top - TAIL_PX});
  }, [anchor, help]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    // Capture phase: Blockly stops pointerdown at its workspace.
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [onClose]);

  return (
    <div className={moduleStyles.blockHelpAnchor}>
      <Popover
        ref={ref}
        role="dialog"
        aria-label={help.title}
        className={classNames(moduleStyles.blockHelpCallout, {
          [moduleStyles.blockHelpCalloutPlaced]: !!layout,
        })}
        direction="onRight"
        title={help.title}
        // The popover pins `content` above the children; ours scrolls with
        // the rest, so the summary goes in the body and this stays empty.
        content=""
        image={help.image}
        onClose={onClose}
        style={
          {
            top: layout?.top ?? anchor.top,
            left: anchor.right + TAIL_PX,
            '--tail-top': `${layout?.tailTop ?? 0}px`,
          } as React.CSSProperties
        }
      >
        <div className={moduleStyles.blockHelpBody}>
          <p>{help.summary}</p>
          {help.body}
        </div>
      </Popover>
    </div>
  );
};

export default BlockHelpCallout;
