import GoogleBlockly from 'blockly/core';

export default class Toolbox extends GoogleBlockly.Toolbox {
  createDom_(workspace) {
    const container = super.createDom_(workspace);

    // Add the trashcan inside a holder svg element.
    const trashcanHolder = Blockly.utils.dom.createSvgElement(
      'svg',
      {
        id: 'trashcanHolder',
        width: 70,
        height: 90,
        style: 'position: absolute'
      },
      container
    );
    trashcanHolder.appendChild(workspace.trashcan.svgGroup_);

    return container;
  }
}
