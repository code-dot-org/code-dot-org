import GoogleBlockly from 'blockly/core';

export default class CdoTrashcan extends GoogleBlockly.DeleteArea {
  constructor(workspace) {
    super();
    this.workspace = workspace;
    this.id = 'cdoTrashcan';
  }

  /**
   * Called by Blockly.inject after the workspace is created
   */
  init() {
    this.workspace.addChangeListener(this.workspaceChangeHandler.bind(this));

    const svg = this.workspace.getParentSvg();
    this.container = document.createElement('div');
    this.container.style.backgroundColor = 'pink';
    this.container.style.visibility = 'hidden';
    this.position(this.workspace.getMetricsManager().getUiMetrics());
    svg.parentNode.insertBefore(this.container, svg);

    this.workspace.getComponentManager().addComponent({
      component: this,
      weight: 1,
      capabilities: [
        Blockly.ComponentManager.Capability.DELETE_AREA,
        Blockly.ComponentManager.Capability.DRAG_TARGET,
        Blockly.ComponentManager.Capability.POSITIONABLE
      ]
    });
    this.workspace.recordDragTargets();
  }

  workspaceChangeHandler(blocklyEvent) {
    if (blocklyEvent.type === Blockly.Events.BLOCK_DRAG) {
      this.container.style.visibility = blocklyEvent.isStart
        ? 'visible'
        : 'hidden';
    }
  }

  /**
   * IPositionable method
   * Positions the element. Called when the window is resized.
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics) {
    console.log(metrics);
    this.container.style.height = '100px';
    this.container.style.width = '100px';
    this.container.style.left = '400px';
    this.container.style.top = '100px';
    this.container.style.position = 'absolute';
    this.container.style.zIndex = '100';
  }

  /**
   * IPositionable method
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {?Blockly.utils.Rect} The UI elements’s bounding box. Null if
   *   bounding box should be ignored by other UI elements.
   */
  getBoundingRectangle() {
    return this.getClientRect();
  }

  /**
   * IDragTarget method
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to the Blockly injection div.
   * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect() {
    const toolboxRect = this.container.getBoundingClientRect();
    return new Blockly.utils.Rect(
      toolboxRect.top,
      toolboxRect.bottom,
      toolboxRect.left,
      toolboxRect.right
    );
  }

  /**
   * IDragTarget method
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDragEnter(_dragElement) {
    this.container.style.backgroundColor = 'aliceblue';
  }

  /**
   * IDragTarget method
   * Handles when a cursor with a block or bubble is dragged over this drag
   * target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDragOver(_dragElement) {}

  /**
   * IDragTarget method
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDragExit(_dragElement) {
    this.container.style.backgroundColor = 'peachpuff';
  }

  /**
   * IDragTarget method
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   */
  onDrop(_dragElement) {}

  /**
   * IDragTarget method
   * Returns whether the provided block or bubble should not be moved after being
   * dropped on this component. If true, the element will return to where it was
   * when the drag started.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @return {boolean} Whether the block or bubble provided should be returned to
   *     drag start.
   */
  shouldPreventMove(_dragElement) {
    return false;
  }
}
