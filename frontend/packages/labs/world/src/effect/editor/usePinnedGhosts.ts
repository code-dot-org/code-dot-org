import {
  useReactFlow,
  useStoreApi,
  useUpdateNodeInternals,
  type XYPosition,
} from '@xyflow/react';
import {useEffect, useState, type RefObject} from 'react';

/** Screen-space anchor elements by ghost node id, supplied by the fixed rows. */
export type GhostAnchors = ReadonlyMap<string, HTMLElement | null>;

/**
 * Edge length of a ghost node, in flow units.
 *
 * Ghosts are not zero-sized: React Flow measures nodes to place their handles,
 * and a box with no area gives it nothing to measure.
 */
export const GHOST_SIZE = 14;

/**
 * How far inside the canvas a ghost's centre is held.
 *
 * The knobs live in the fixed rows, which are *outside* the canvas element, so
 * their raw screen positions fall beyond it — and the canvas clips its
 * contents. Clamping keeps each ghost just inside the near edge, directly
 * below (or above) its knob, so the wire runs to the knob instead of being cut
 * off. Half the dot puts its outer edge flush with the canvas border, which is
 * as close to the knob as it can get without being clipped.
 */
const EDGE_INSET = GHOST_SIZE / 2;

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

function samePositions(
  left: ReadonlyMap<string, XYPosition>,
  right: ReadonlyMap<string, XYPosition>,
): boolean {
  if (left.size !== right.size) {
    return false;
  }
  for (const [id, position] of right) {
    const existing = left.get(id);
    if (!existing || existing.x !== position.x || existing.y !== position.y) {
      return false;
    }
  }
  return true;
}

/**
 * Work out where each ghost node has to sit to stay under its row knob.
 *
 * The rows do not pan or zoom; the canvas does. So every time the viewport
 * moves, the flow-space point that lands under a given screen pixel changes,
 * and each ghost has to move to compensate. That is what makes wires appear
 * anchored to the rows while the workspace slides beneath them.
 *
 * **Timing is the whole trick.** React Flow moves the viewport with a direct
 * DOM write inside a store subscription — no React render — which is why its
 * panning is paint-synchronous with input. Anything React-rendered updates a
 * scheduler task later, after a paint: an effect-and-state version of this
 * hook left the dots trailing the seam by one step every frame. So this hook
 * mirrors React Flow's own pattern exactly: it subscribes to the store, and
 * inside the same synchronous notification that moves the viewport it writes
 * each ghost wrapper's `transform` directly to the DOM. React state is
 * updated too, and later renders the identical transform — the imperative
 * write is a paint-deadline fast path, not a second source of truth.
 *
 * (The wire *paths* into the ghosts are React-rendered SVG and can still
 * trail by one frame at most — far less visible than two misaligned dots.)
 *
 * Positions are returned rather than pushed into React Flow's store: the
 * canvas passes `nodes` as a controlled prop, so anything written straight to
 * the store would be discarded on the next render.
 */
export function usePinnedGhosts(
  anchors: GhostAnchors,
  containerRef: RefObject<HTMLElement | null>,
): ReadonlyMap<string, XYPosition> {
  const store = useStoreApi();
  const {screenToFlowPosition} = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const [positions, setPositions] = useState<ReadonlyMap<string, XYPosition>>(
    () => new Map(),
  );

  useEffect(() => {
    let lastZoom: number | null = null;

    const compute = () => {
      const container = containerRef.current;
      if (!container || anchors.size === 0) {
        return;
      }

      const bounds = container.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) {
        return;
      }

      const next = new Map<string, XYPosition>();
      for (const [nodeId, element] of anchors) {
        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        const point = screenToFlowPosition({
          x: clamp(
            rect.left + rect.width / 2,
            bounds.left + EDGE_INSET,
            bounds.right - EDGE_INSET,
          ),
          y: clamp(
            rect.top + rect.height / 2,
            bounds.top + EDGE_INSET,
            bounds.bottom - EDGE_INSET,
          ),
        });

        // Node positions are top-left corners; offset so the ghost's centre —
        // where its handle sits — lands on the anchor point.
        next.set(nodeId, {
          x: point.x - GHOST_SIZE / 2,
          y: point.y - GHOST_SIZE / 2,
        });
      }

      // The paint-deadline fast path: move the ghost wrappers now, in the
      // same task as the viewport's own direct DOM write, so knob and dot
      // paint together. React re-renders the same values afterwards.
      for (const [nodeId, position] of next) {
        const wrapper = container.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${CSS.escape(nodeId)}"]`,
        );
        if (wrapper) {
          wrapper.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }
      }

      setPositions(current => (samePositions(current, next) ? current : next));

      // Handle bounds are cached in flow units, which pan and zoom leave
      // alone in principle — but a zoom change alters the px→flow conversion
      // the next measurement would use, so re-measure then. Never per pan
      // frame: `updateNodeInternals` schedules rAF measurement work, and
      // running it continuously is churn that reads as jitter.
      const zoom = store.getState().transform[2];
      if (zoom !== lastZoom) {
        lastZoom = zoom;
        updateNodeInternals([...next.keys()]);
      }
    };

    // Initial placement, and whenever the set of knobs changes.
    compute();

    // Synchronous with every viewport change; see the doc comment for why
    // this must not be an effect on the transform.
    let previousTransform = store.getState().transform;
    const unsubscribe = store.subscribe(state => {
      if (state.transform !== previousTransform) {
        previousTransform = state.transform;
        compute();
      }
    });

    // Panels opening, rows growing, the window resizing: the knobs move on
    // screen without any viewport change.
    const observer = new ResizeObserver(() => compute());
    observer.observe(containerRef.current ?? document.body);

    // A knob strip that scrolls is the other way a knob moves without anything
    // here changing: more parameters than fit make the row scrollable, and
    // sliding it sideways slides every knob on it. Captured at the document,
    // because a scroll event does not bubble — and because the strip is not the
    // only scroller that can move a knob (a pane, a panel, the page itself).
    const onScroll = () => compute();
    document.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      unsubscribe();
      observer.disconnect();
      document.removeEventListener('scroll', onScroll, {capture: true});
    };
  }, [anchors, containerRef, screenToFlowPosition, store, updateNodeInternals]);

  return positions;
}
