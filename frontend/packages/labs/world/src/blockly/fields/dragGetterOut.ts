// Pulling a variable getter out of a field, the way a flyout gives up a block.
//
// Blockly hands blocks out of flyouts through a Gesture: press a flyout block,
// move, and a copy is created on the target workspace already being dragged. A
// FIELD has no such path — the pointerdown it sees would otherwise start a drag
// of the block the field is on — so this does the same job by hand: create the
// block under the pointer, hand it to Blockly's own `Dragger`, and forward the
// pointer until it is let go.
//
// It is one function rather than a base class because the two callers are
// unrelated fields (a variable dropdown, and a rendered preview), and what they
// share is a gesture, not a shape.

import * as Blockly from 'blockly/core';

/** How far the pointer must travel before a press becomes a drag, in pixels. */
const dragRadius = (): number => Blockly.config.dragRadius ?? 5;

export interface GetterDragRequest {
  /** The workspace the getter is created on — the one the field's block is on. */
  workspace: Blockly.WorkspaceSvg;
  /** The variable the getter reads. */
  variableId: string;
  /** The block type that reads it (`variables_get_Number`, …). */
  getterType: string;
  /** The `pointerdown` that started this. */
  event: PointerEvent;
  /** Called instead of dragging when the pointer never left the press point. */
  onClick?: (event: PointerEvent) => void;
}

/**
 * Take a press and turn it into either a getter drag or a click.
 *
 * Nothing is created on the press itself: a press that never moves has to end
 * up being a click, and creating a block first would leave one behind every
 * time. The caller is expected to have claimed the event (`stopPropagation`)
 * before calling, since otherwise Blockly drags the field's own block.
 */
export function beginGetterDrag(request: GetterDragRequest): void {
  const {workspace, variableId, getterType, event, onClick} = request;
  const pressAt = {x: event.clientX, y: event.clientY};
  let dragger: Blockly.dragging.Dragger | null = null;
  let dragFrom: {x: number; y: number} | null = null;

  const start = (e: PointerEvent): void => {
    Blockly.Events.setGroup(true);
    const getter = workspace.newBlock(getterType) as Blockly.BlockSvg;
    getter.setFieldValue(variableId, 'VAR');
    getter.initSvg();
    getter.queueRender();
    // Rendered NOW, not on the next frame. A block whose render is still queued
    // has no measured size, so its output connection sits at its origin instead
    // of on its left edge — near enough to look right while dragging, and far
    // enough that the drop finds nothing to connect to.
    Blockly.renderManagement.triggerQueuedRenders(workspace);
    // Under the pointer, not centred on it: a block held by its top-left corner
    // is what dragging one out of a flyout feels like.
    const at = Blockly.utils.svgMath.screenToWsCoordinates(
      workspace,
      new Blockly.utils.Coordinate(e.clientX, e.clientY),
    );
    getter.moveTo(new Blockly.utils.Coordinate(at.x - 8, at.y - 8));
    dragger = new Blockly.dragging.Dragger(getter);
    dragFrom = {x: e.clientX, y: e.clientY};
    dragger.onDragStart(e);
  };

  let moveBinding: Blockly.browserEvents.Data | null = null;
  let upBinding: Blockly.browserEvents.Data | null = null;
  const unbind = (): void => {
    if (moveBinding) {
      Blockly.browserEvents.unbind(moveBinding);
      moveBinding = null;
    }
    if (upBinding) {
      Blockly.browserEvents.unbind(upBinding);
      upBinding = null;
    }
  };

  const move = (e: PointerEvent): void => {
    if (!dragger) {
      if (
        Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) < dragRadius()
      ) {
        return;
      }
      start(e);
    }
    if (dragger && dragFrom) {
      e.preventDefault();
      dragger.onDrag(
        e,
        new Blockly.utils.Coordinate(
          e.clientX - dragFrom.x,
          e.clientY - dragFrom.y,
        ),
      );
    }
  };

  const up = (e: PointerEvent): void => {
    unbind();
    if (dragger) {
      dragger.onDragEnd(e);
      dragger = null;
      // The creation and every move it caused are one entry, so a pull the
      // learner regrets is one undo rather than dozens.
      Blockly.Events.setGroup(false);
      return;
    }
    onClick?.(e);
  };

  // Bound without the capture-identifier check: the pointer leaves the field on
  // the first move of any real drag, and these must keep firing.
  moveBinding = Blockly.browserEvents.conditionalBind(
    document,
    'pointermove',
    null,
    move,
    true,
  );
  upBinding = Blockly.browserEvents.conditionalBind(
    document,
    'pointerup',
    null,
    up,
    true,
  );
}
