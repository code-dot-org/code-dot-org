/**
 * Parses level data.
 */

import type * as Blockly from 'blockly/core';

import {convertBlocklyXmlToJson} from '@code-dot-org/blockly-workspace/xml';

import type {BlocklyData} from '../types';

/**
 * Parses a level config to produce the level data we need to supply to
 * the level component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(config: {[key: string]: any}, xml?: Document, parser?: DOMParser): BlocklyData {
  const parseXml = (root: HTMLElement | undefined) =>
    root?.querySelector('xml > *') ? root?.innerHTML?.trim() : undefined;

  const convert = (xmlString?: string) =>
    (xmlString && parser) ? convertBlocklyXmlToJson(parser, xmlString) : undefined;

  // Gather the XML data for various level data
  const roots = ['start_blocks', 'toolbox_blocks', 'solution_blocks'].map(
    tag => xml ?
      xml.querySelector(`blocks > ${tag} > xml`)?.parentNode as
        | HTMLElement
        | undefined : undefined,
  );

  const createFlyoutToolbox = (
    blocks: Blockly.serialization.blocks.State[],
  ) => ({
    kind: 'flyoutToolbox',
    contents: blocks.map(block => ({
      ...block,
      kind: 'block',
    })),
  });

  // Place that block data into the outgoing blockly data, but ensure where the XML data
  // is empty (the <xml> tag has no children), that these fields are undefined.
  return {
    startBlocks: convert(parseXml(roots[0])),
    toolboxBlocks: createFlyoutToolbox(
      convert(parseXml(roots[1]))?.blocks?.blocks || [],
    ),
    solutionBlocks: convert(parseXml(roots[2])),
    idealBlockCount: config.properties?.ideal
      ? parseInt(config.properties.ideal)
      : undefined,
  };
}

export default load;
