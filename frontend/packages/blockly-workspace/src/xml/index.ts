/**
 * This provides routines to convert generic Blockly XML to JSON that does not
 * require a Blockly workspace to do. That is, it can convert Blockly XML to
 * JSON offline for the purposes of compiling a cached version of a level file.
 */

import type * as Blockly from 'blockly';

import type {ToolboxFlyout} from '../toolbox/types';
import type {BlocklySerialization} from '../types';

type BlockState = Blockly.serialization.blocks.State;

// Parse the root's direct <block> children into serialization state. Shared by
// the JSON and toolbox conversions, which differ only in how they wrap them.
function parseTopLevelBlocks(
  parser: DOMParser,
  xmlString: string,
): BlockState[] {
  const xml = parser.parseFromString(xmlString, 'text/xml');
  return Array.from(xml.documentElement.children)
    .filter(el => el.tagName === 'block')
    .map(el => parseBlockXml(el));
}

export function convertBlocklyXmlToJson(
  parser: DOMParser,
  xmlString: string,
): BlocklySerialization {
  return {
    blocks: {
      blocks: parseTopLevelBlocks(parser, xmlString),
    },
  };
}

export function convertBlocklyXmlToToolbox(
  parser: DOMParser,
  xmlString: string,
  categoryName?: string,
): ToolboxFlyout {
  const blocksArray = parseTopLevelBlocks(parser, xmlString).map(block => ({
    ...block,
    kind: 'block',
  }));

  return {
    name: categoryName || 'flyout',
    blocks: blocksArray,
  };
}

function parseBlockXml(blockEl: Element): BlockState {
  const block: BlockState = {
    type: blockEl.getAttribute('type') || '',
    id: blockEl.getAttribute('id') || undefined,
    // deletable/movable are boolean attributes; coerce the parsed value to the
    // boolean the serialization state expects.
    deletable: blockEl.hasAttribute('deletable')
      ? Boolean(parseValue(blockEl.getAttribute('deletable') || 'true'))
      : undefined,
    movable: blockEl.hasAttribute('movable')
      ? Boolean(parseValue(blockEl.getAttribute('movable') || 'true'))
      : undefined,
  };

  // Position (only in top-level blocks)
  const x = blockEl.getAttribute('x');
  const y = blockEl.getAttribute('y');
  if (x && y) {
    block.x = parseInt(x, 10);
    block.y = parseInt(y, 10);
  }

  // Collect user-defined attributes as extraState
  const knownAttrs = new Set(['type', 'id', 'x', 'y', 'deletable', 'movable']);
  const extraState: Record<string, string | number | boolean> = {};
  for (const attr of Array.from(blockEl.attributes)) {
    if (!knownAttrs.has(attr.name)) {
      extraState[attr.name] = parseValue(attr.value);
    }
  }
  if (Object.keys(extraState).length > 0) {
    block.extraState = extraState;
  }

  // Fields
  const fields = Array.from(blockEl.children).filter(
    el => el.tagName === 'field' || el.tagName === 'title',
  );
  if (fields.length > 0) {
    block.fields = {};
    for (const fieldEl of fields) {
      const name = fieldEl.getAttribute('name');
      if (name) {
        block.fields[name] = parseValue(fieldEl.textContent ?? '');
      }
    }
  }

  // Recursively parse values, statements, next
  for (const child of Array.from(blockEl.children)) {
    switch (child.tagName) {
      case 'value':
      case 'statement':
        {
          const inputName = child.getAttribute('name');
          // The connected block is the direct-child <block>; a descendant search
          // could wrongly pick a <block> buried in a preceding <shadow>.
          const subBlock = directChildBlock(child);
          if (inputName && subBlock) {
            block.inputs ??= {};
            block.inputs[inputName] = {
              block: parseBlockXml(subBlock),
            };
          }
        }
        break;

      case 'next':
        {
          const nextBlock = directChildBlock(child);
          if (nextBlock) {
            block.next = {
              block: parseBlockXml(nextBlock),
            };
          }
        }
        break;

      case 'mutation':
        // Place attributes into extra state
        for (const attr of Array.from(child.attributes)) {
          block.extraState ??= {};
          if (attr.name === 'elseif') {
            block.extraState['elseIfCount'] = attr.value;
          } else {
            block.extraState[attr.name] = attr.value;
          }
        }

        // Look for procedure arguments
        for (const param of Array.from(child.querySelectorAll('arg'))) {
          const name = param.getAttribute('name');
          if (name === null) {
            continue;
          }
          block.extraState ??= {};
          block.extraState.params ??= [];
          block.extraState.params.push(name);
        }

        // Some specific legacy mutators also pull in attributes from the next sibling
        for (const attr of Array.from(
          child.nextElementSibling?.attributes || [],
        )) {
          block.extraState ??= {};
          if (attr.name === 'elseif') {
            block.extraState['elseIfCount'] = attr.value;
          } else {
            block.extraState[attr.name] ??= attr.value;
          }
        }
        break;
    }
  }

  return block;
}

// The first direct-child <block> of a container element (<value>, <statement>,
// <next>), or undefined. Unlike querySelector('block'), this never descends into
// a preceding sibling such as a <shadow> default.
function directChildBlock(container: Element): Element | undefined {
  return Array.from(container.children).find(el => el.tagName === 'block');
}

function parseValue(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '') return '';
  if (!isNaN(Number(value))) return Number(value);
  return value;
}
