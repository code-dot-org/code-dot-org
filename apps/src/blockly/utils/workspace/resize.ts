import * as BlocklyCore from 'blockly/core';

import {ExtendedWorkspaceSvg} from '@cdo/apps/blockly/types';

/**
 * Shrink the DOM element containing the given workspace to the minimum size
 * required to contain the block space
 * @param {BlockSpace} workspace - the Blockly workspace to resize
 * @param {boolean} withPadding - whether or not to include padding
 * @see convertXmlToBlockly
 */
export function shrinkBlockSpaceContainer(
  workspace: ExtendedWorkspaceSvg,
  withPadding: boolean
) {
  const container = workspace.getContainer();

  // Calculate the minimum required size for the container,
  const metrics = workspace.getMetrics();
  let height = metrics.contentHeight;
  let width = metrics.contentWidth;

  if (withPadding) {
    height += metrics.contentTop * 2;
    width += metrics.contentLeft;
  }

  // and shrink it, triggering a workspace resize when we do so.
  const style = (container as HTMLElement)?.style;
  if (style) {
    style.height = height + 'px';
    style.width = width + 'px';
  }
  workspaceSvgResize(workspace);
}

export function workspaceSvgResize(workspace: BlocklyCore.WorkspaceSvg) {
  return Blockly.svgResize(workspace);
}
