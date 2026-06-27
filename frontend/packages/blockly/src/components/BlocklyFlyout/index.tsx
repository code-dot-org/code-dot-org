import * as Blockly from 'blockly/core';
import {useEffect, useRef} from 'react';
import type {MutableRefObject, ReactElement} from 'react';

import {DriverEvent} from '../../Driver';
import {useBlocklyContext} from '../../contexts/BlocklyContext';

/**
 * An inline flyout: a panel of blocks that can be dragged out to create real
 * blocks in the provider's main workspace.
 *
 * The base VerticalFlyout sizes its width from content but takes its height from
 * the target workspace's viewport (set in the base position()) and pins itself
 * to that workspace's edge — wrong for a free-standing panel. This subclass sizes
 * to its own content and sits at the origin of its own SVG.
 */
class InlineFlyout extends Blockly.VerticalFlyout {
  override autoClose = false;

  override isScrollable(): boolean {
    return false;
  }

  override reflowInternal_(): void {
    super.reflowInternal_();
    // VerticalFlyout never sets height_ in reflow (it normally fills the target
    // viewport); derive it from the content so the panel sizes to its blocks.
    const workspace = this.getWorkspace();
    const box = workspace.getBlocksBoundingBox();
    this.height_ = (box.bottom + this.MARGIN) * workspace.scale;
    this.position();
  }

  override position(): void {
    if (!this.isVisible() || !this.targetWorkspace) {
      return;
    }
    this.positionAt_(this.getWidth(), this.getHeight(), 0, 0);
  }
}

/**
 * A drag from an external flyout creates the real block on the canvas's drag
 * layer, which is clipped to the canvas — so the block is hidden until it
 * crosses into the canvas. To keep the drag readable, mirror the grabbed block
 * with a lightweight clone on a top-level, click-through overlay that follows
 * the pointer. Purely cosmetic: the real block still does the work, the clone is
 * removed on drop, and the two coincide once the real block reaches the canvas.
 */
function showDragGhostOnPointerDown(event: PointerEvent): void {
  const target = event.target as Element | null;
  const block = target?.closest(
    '.blocklyDraggable',
  ) as SVGGraphicsElement | null;
  const ctm = block?.getScreenCTM();
  if (!block || !ctm) {
    return;
  }

  const clone = block.cloneNode(true) as SVGGraphicsElement;
  // Make the clone inert. It carries the real block's identifiers and focusable
  // attributes; left in the DOM those collide with the real node and make
  // Blockly's focus manager resolve to the clone ("focus unregistered node").
  // The ghost is pure decoration, so strip everything that identifies it as a
  // real, focusable block.
  const deidentify = (node: Element) => {
    node.removeAttribute('id');
    node.removeAttribute('data-id');
    node.removeAttribute('tabindex');
    node.removeAttribute('role');
  };
  deidentify(clone);
  clone
    .querySelectorAll('[id], [data-id], [tabindex], [role]')
    .forEach(deidentify);
  clone.setAttribute('aria-hidden', 'true');
  // Position the clone exactly over the original (matrix carries scale + offset).
  clone.setAttribute(
    'transform',
    `matrix(${ctm.a},${ctm.b},${ctm.c},${ctm.d},${ctm.e},${ctm.f})`,
  );
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.classList.add('blocklyFlyoutDragGhost');
  // The overlay is purely decorative; hide it from the accessibility tree so AT
  // cannot traverse into it during a drag. The inner clone already carries
  // aria-hidden, but hiding the wrapper is required — AT can still discover
  // children of a non-hidden ancestor even when each child is individually hidden.
  overlay.setAttribute('aria-hidden', 'true');
  // Block text font and fill are scoped to `.<renderer> .blocklyText`, where the
  // renderer/theme classes live on the workspace's injection div. The overlay
  // sits on document.body, outside that scope, so carry those classes (taken
  // from the flyout's container, which already has them) onto it — otherwise the
  // clone's labels fall back to defaults (black, wrong font).
  const scope = block.closest('.injectionDiv');
  if (scope) {
    overlay.classList.add(...scope.classList);
  }
  overlay.style.position = 'fixed';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.overflow = 'visible';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '2147483647';
  overlay.appendChild(clone);

  const startX = event.clientX;
  const startY = event.clientY;
  let shown = false;

  const onMove = (move: PointerEvent) => {
    const dx = move.clientX - startX;
    const dy = move.clientY - startY;
    if (!shown) {
      // Defer until past the click threshold so a tap doesn't flash a ghost.
      if (Math.hypot(dx, dy) < 3) {
        return;
      }
      document.body.appendChild(overlay);
      shown = true;
    }
    overlay.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onEnd = () => {
    overlay.remove();
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onEnd);
    document.removeEventListener('pointercancel', onEnd);
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onEnd);
  document.addEventListener('pointercancel', onEnd);
}

export interface BlocklyFlyoutProps {
  /** The blocks to offer for dragging (toolbox/flyout content). */
  blocks: Blockly.utils.toolbox.FlyoutDefinition;
  /** Optional class for the container element. */
  className?: string;
  /**
   * Accessible name announced by screen readers when the user navigates to or
   * into this element. Defaults to "Block palette". Override when context makes
   * a more specific name meaningful, e.g. "Sprite blocks".
   */
  label?: string;
  /**
   * ARIA role for the container element.
   *
   * - `"region"` (default) — creates a named landmark. Correct for a
   *   standalone side-panel flyout that users should be able to jump to via
   *   screen-reader landmark navigation.
   * - `"group"` — groups the blocks without creating a landmark. Use this
   *   when the flyout is embedded inline in prose (e.g. from
   *   {@link BlocklyMarkdown}), where a region landmark would clutter the
   *   page's landmark list, and identically-named regions across multiple
   *   `<xml>` snippets would be indistinguishable. A `group` + `aria-label`
   *   still announces name and role on focus; it simply does not appear in the
   *   screen-reader landmark summary.
   */
  containerRole?: 'region' | 'group';
  /** Receives the flyout's internal workspace once it is created. */
  workspaceRef?: MutableRefObject<Blockly.WorkspaceSvg | null>;
}

/**
 * Renders a flyout of draggable blocks, in its own DOM, wired to the main
 * workspace of the enclosing {@link BlocklyProvider}. Dragging a block out
 * creates a real block in that workspace at the drop point.
 *
 * The flyout lives outside the workspace's container, so it can be placed
 * anywhere (e.g. in instructions). One consequence: a dragged block renders on
 * the workspace's drag layer, which is clipped to the canvas, so while the
 * pointer is still over this (external) flyout the block is not yet visible — it
 * appears as it crosses into the canvas. The drop itself is correct. (There is
 * no page-level drag surface in Blockly v13 to avoid this; keeping the flyout
 * inside the canvas's injection div would, at the cost of no longer being
 * external.)
 *
 * Requires a BlocklyProvider ancestor; without one it renders empty.
 */
export function BlocklyFlyout({
  blocks,
  className,
  label = 'Block palette',
  containerRole = 'region',
  workspaceRef,
}: BlocklyFlyoutProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<InlineFlyout | null>(null);
  const {driver} = useBlocklyContext();

  useEffect(() => {
    const driverInstance = driver?.current;
    if (!driverInstance) {
      return;
    }
    let disposed = false;
    let frame = 0;

    // Re-measure and re-lay-out every block, then resize the flyout. Blockly
    // does not relayout on a font-size change (google/blockly#7782), and a
    // freshly shown flyout may have measured against a not-yet-loaded font, so
    // this is used after both events.
    const relayout = (flyout: InlineFlyout) => {
      const ws = flyout.getWorkspace();
      (ws.getAllBlocks(false) as Blockly.BlockSvg[]).forEach(block =>
        block.markDirty(),
      );
      ws.render();
      Blockly.renderManagement.triggerQueuedRenders();
      flyout.reflow();
    };

    // Mount once the main workspace exists and our container is in the document.
    // Both can lag this effect (the workspace injects in its own effect; under
    // StrictMode this first runs while the container is transiently detached, and
    // a flyout laid out in a detached SVG measures every block as zero), so poll
    // on animation frames until they settle, then mount once.
    const tryMount = () => {
      if (disposed || flyoutRef.current) {
        return;
      }
      const container = containerRef.current;
      const mainWorkspace = driverInstance.mainWorkspace;
      if (container?.isConnected && mainWorkspace) {
        // Matching the main workspace's options gives the same renderer (whose
        // unique name is still registered while that workspace is alive) and RTL,
        // so previews look identical to the canvas. Take the theme from
        // getTheme() rather than options.theme: options holds the *injection-time*
        // theme, which setTheme never updates, so a flyout (re)created after a
        // theme change — as happens when an enclosing BlocklyMarkdown re-renders —
        // would otherwise be built with the stale original theme.
        const flyout = new InlineFlyout({
          ...mainWorkspace.options,
          RTL: mainWorkspace.RTL,
          theme: mainWorkspace.getTheme(),
        } as Blockly.Options);
        flyoutRef.current = flyout;
        const svg = flyout.createDom(Blockly.utils.Svg.SVG);
        // Blockly styles `.blocklyFlyout` position:absolute (a toolbox flyout
        // overlays its workspace). Out of flow, our container can't size to it
        // and collapses; relative puts it back in normal flow.
        svg.style.position = 'relative';
        container.appendChild(svg);
        // Mirror a dragged block with a click-through overlay clone so the drag
        // stays visible while the real block is still clipped to the canvas.
        // Capture phase: Blockly's block handler stops propagation, so a
        // bubble-phase listener here would never see the pointerdown.
        svg.addEventListener('pointerdown', showDragGhostOnPointerDown, true);
        // Route keyboard shortcuts to this flyout. Blockly binds its keydown
        // handler to the main workspace's injection div, which an external flyout
        // sits outside of — so arrow/enter navigation never reaches it. Forward
        // keydowns to the shortcut registry against the flyout's own workspace
        // (it scopes to the focused node internally). Escape is left to the
        // flyout's built-in handler.
        svg.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            return;
          }
          Blockly.ShortcutRegistry.registry.onKeyDown(
            flyout.getWorkspace(),
            event,
          );
        });
        // init sets the flyout's targetWorkspace — the workspace a dragged block
        // is created in.
        flyout.init(mainWorkspace);
        if (workspaceRef) {
          workspaceRef.current = flyout.getWorkspace();
        }
        // Copy the workspace injection div's classes onto our container. Two
        // reasons: (1) Blockly scopes block text font and fill to
        // `.<renderer> .blocklyText`, with the renderer/theme classes on the
        // injection div, so an external flyout without them renders its labels
        // with default colour/font; (2) the `injectionDiv` class is what
        // Blockly's focus and coordinate DOM walks look for, so tagging the
        // container keeps a drag from running off the top of the document. None
        // of these classes carry layout, only scoping.
        mainWorkspace
          .getInjectionDiv()
          .classList.forEach((cls: string) => container.classList.add(cls));
        // show() lays out the blocks; flush queued renders so they have geometry
        // before reflow measures them.
        flyout.show(blocks);
        Blockly.renderManagement.triggerQueuedRenders();
        flyout.reflow();

        // Block text is measured with the active font; if a web font is still
        // loading every block measures narrow and the panel collapses. The main
        // workspace re-renders when the font arrives; this flyout does not, so
        // re-measure once fonts are ready (resolves immediately if none pending).
        document.fonts?.ready.then(() => {
          if (disposed || flyoutRef.current !== flyout) {
            return;
          }
          relayout(flyout);
        });
        return;
      }
      frame = requestAnimationFrame(tryMount);
    };
    frame = requestAnimationFrame(tryMount);

    // The flyout is a separate workspace, so the main workspace's theme change
    // does not reach it. Re-theme its blocks (colours) and re-lay-out (the new
    // theme may change the font size). Text font and fill follow automatically:
    // they are global CSS scoped to the shared renderer class, which the main
    // workspace re-injects on its own theme refresh.
    const onThemeChanged = () => {
      const flyout = flyoutRef.current;
      if (!flyout) {
        return;
      }
      flyout.getWorkspace().setTheme(driverInstance.theme.instance);
      relayout(flyout);
    };
    driverInstance.addListener(DriverEvent.ThemeChanged, onThemeChanged);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      driverInstance.removeListener(DriverEvent.ThemeChanged, onThemeChanged);
      flyoutRef.current?.dispose();
      flyoutRef.current = null;
      if (workspaceRef) {
        workspaceRef.current = null;
      }
    };
    // Recreated only if the driver itself changes; block changes handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver]);

  // Re-show when the offered blocks change.
  useEffect(() => {
    const flyout = flyoutRef.current;
    if (flyout?.targetWorkspace) {
      flyout.show(blocks);
      Blockly.renderManagement.triggerQueuedRenders();
      flyout.reflow();
    }
  }, [blocks]);

  // role + aria-label names this element for screen readers:
  //   "region" (default): a named landmark for a standalone side-panel flyout
  //   that AT users can jump to via landmark navigation (e.g. VoiceOver rotor,
  //   NVDA elements list).
  //   "group": for a flyout embedded inline in prose — groups the blocks
  //   without adding a landmark entry, so multiple <xml> snippets in one doc
  //   do not produce a cluttered list of identically-named regions. A group
  //   with aria-label still announces name and role on focus.
  return (
    <div
      ref={containerRef}
      className={className}
      role={containerRole}
      aria-label={label}
    />
  );
}

export default BlocklyFlyout;
