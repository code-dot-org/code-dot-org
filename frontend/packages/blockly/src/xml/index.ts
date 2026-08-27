/**
 * This provides routines to convert generic Blockly XML to JSON that does not
 * require a Blockly workspace to do. That is, it can convert Blockly XML to
 * JSON offline for the purposes of compiling a cached version of a level file.
 */

import * as Blockly from 'blockly/core';

import type {Toolbox, ToolboxCategory} from '../toolbox/types';
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
): Toolbox {
  const xml = parser.parseFromString(xmlString, 'text/xml');
  if (Array.from(xml.documentElement.children).some(isCategoryElement)) {
    return convertBlocklyXmlToCategories(parser, xmlString);
  }

  const blocksArray = parseTopLevelBlocks(parser, xmlString).map(block => ({
    ...block,
    kind: 'block',
  }));

  return {
    name: categoryName || 'flyout',
    blocks: blocksArray,
  };
}

function isCategoryElement(el: Element): boolean {
  return el.tagName === 'category';
}

/**
 * Converts a `<category>`-wrapped toolbox (the real-world `toolbox_blocks`
 * shape used by ~515 maze .level files, e.g. course3_bee_functions_challenge1)
 * into the categories our Toolbox understands. `convertBlocklyXmlToToolbox`
 * delegates here whenever the root has any `<category>` child; the
 * single-flyout shape stays its default for everything else.
 */
export function convertBlocklyXmlToCategories(
  parser: DOMParser,
  xmlString: string,
): ToolboxCategory[] {
  const xml = parser.parseFromString(xmlString, 'text/xml');
  return Array.from(xml.documentElement.children)
    .filter(isCategoryElement)
    .map(parseCategoryXml);
}

// Blockly's built-in "give me the live procedure/variable blocks" flyouts.
// `custom="PROCEDURE"` / `custom="VARIABLE"` are the only values seen in
// dashboard/config/levels/custom/maze (grepped), so those are the only two
// wired up; an unrecognised custom value renders as an empty category rather
// than throwing.
const DYNAMIC_CATEGORY_LOADERS: Record<
  string,
  (workspace: Blockly.WorkspaceSvg) => Blockly.utils.toolbox.FlyoutItemInfoArray
> = {
  PROCEDURE: workspace => Blockly.Procedures.flyoutCategory(workspace),
  VARIABLE: workspace => Blockly.Variables.flyoutCategory(workspace),
};

function parseCategoryXml(categoryEl: Element): ToolboxCategory {
  const name = categoryEl.getAttribute('name') || '';
  const custom = categoryEl.getAttribute('custom');
  if (custom) {
    return {name, key: custom, onLoad: DYNAMIC_CATEGORY_LOADERS[custom]};
  }

  const blocks = Array.from(categoryEl.children)
    .filter(el => el.tagName === 'block')
    .map(el => ({...parseBlockXml(el), kind: 'block' as const}));

  return {name, blocks};
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
        // Place attributes into extra state, coerced and remapped to the
        // canonical JSON keys their mutators read (see mutationEntry).
        for (const attr of Array.from(child.attributes)) {
          block.extraState ??= {};
          const [key, value] = mutationEntry(attr.name, attr.value);
          block.extraState[key] = value;
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

        // Some specific legacy mutators also pull in attributes from the next
        // sibling; elseif overwrites, the rest only fill gaps (preserving the
        // original precedence).
        for (const attr of Array.from(
          child.nextElementSibling?.attributes || [],
        )) {
          block.extraState ??= {};
          const [key, value] = mutationEntry(attr.name, attr.value);
          if (attr.name === 'elseif') {
            block.extraState[key] = value;
          } else {
            block.extraState[key] ??= value;
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

// Translate a legacy <mutation> attribute into its canonical extraState entry.
// Values are coerced, so numeric/boolean attributes deserialize as numbers and
// booleans rather than strings (matching how block attributes are handled and
// what mutators' loadExtraState expects). controls_if's legacy attribute names
// are remapped to the keys its JSON mutator reads: `elseif` -> `elseIfCount`
// (a count) and `else` -> `hasElse` (a boolean flag).
function mutationEntry(
  name: string,
  value: string,
): [string, string | number | boolean] {
  if (name === 'elseif') {
    return ['elseIfCount', parseValue(value)];
  }
  if (name === 'else') {
    return ['hasElse', Boolean(parseValue(value))];
  }
  return [name, parseValue(value)];
}

function parseValue(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '') return '';
  if (!isNaN(Number(value))) return Number(value);
  return value;
}
