import GoogleBlockly from 'blockly/core';

export default class Toolbox extends GoogleBlockly.Toolbox {
  createDom_(workspace) {
    const container = super.createDom_(workspace);

    // Add the trashcan inside a holder svg element.
    this.trashcanHolder = Blockly.utils.dom.createSvgElement('svg', {
      id: 'trashcanHolder',
      height: 125,
      style: 'position: absolute; display: none;'
    });

    // Add the trashcan as the first child of the toolbox container. If it's the
    // second child after the categories, the trashcan renders "behind" the
    // categories and appears clipped.
    container.insertBefore(this.trashcanHolder, container.firstElementChild);

    this.trashcanHolder.appendChild(workspace.trashcan.svgGroup_);

    return container;
  }

  position() {
    this.trashcanHolder?.setAttribute('width', this.width_);
    return super.position();
  }
}
