/**
 * This provides routines to convert generic Blockly XML to JSON that does not
 * require a Blockly workspace to do. That is, it can convert Blockly XML to
 * JSON offline for the purposes of compiling a cached version of a level file.
 */

import type {BlocklySerialization} from '../types';

export function convertBlocklyXmlToJson(
  parser: DOMParser,
  xmlString: string,
): BlocklySerialization {
  const xml = parser.parseFromString(xmlString, 'text/xml');

  const blocksArray = Array.from(xml.documentElement.children)
    .filter(el => el.tagName === 'block')
    .map(el => parseBlockXml(el));

  return {
    blocks: {
      blocks: blocksArray,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBlockXml(blockEl: Element): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const block: any = {
    type: blockEl.getAttribute('type') || undefined,
    id: blockEl.getAttribute('id') || undefined,
    deletable: blockEl.hasAttribute('deletable')
      ? parseValue(blockEl.getAttribute('deletable') || 'true')
      : undefined,
    movable: blockEl.hasAttribute('movable')
      ? parseValue(blockEl.getAttribute('movable') || 'true')
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
          const subBlock = child.querySelector('block');
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
          const nextBlock = child.querySelector('block');
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
          block.extraState ??= {};
          block.extraState.params ??= [];
          block.extraState.params.push(param.getAttribute('name'));
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

function parseValue(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '') return '';
  if (!isNaN(Number(value))) return Number(value);
  return value;
}
