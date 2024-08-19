import {Workspace, WorkspaceSvg} from 'blockly';

import {BLOCK_TYPES} from '../constants';
import {BlocklyWrapperType, XmlBlockConfig} from '../types';
import {
  FALSEY_DEFAULT,
  TRUTHY_DEFAULT,
  readBooleanAttribute,
  shouldSkipHiddenWorkspace,
} from '../utils';

// The user created attribute needs to be read from XML start blocks as 'usercreated'.
// Once this has been done, all subsequent steps in the serialization use userCreated.
const USER_CREATED_XML_ATTRIBUTE = 'usercreated';

export default function initializeBlocklyXml(
  blocklyWrapper: BlocklyWrapperType
) {
  // Clear xml namespace. This property is readonly in Google Blockly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (blocklyWrapper.utils.xml as any).NAME_SPACE = '';

  // Aliasing Google's domToBlock() so that we can override it, but still be able
  // to call Google's domToBlock() in the override function.
  const originalDomToBlock = blocklyWrapper.Xml.domToBlock;
  // Override domToBlock so that we can gracefully handle unknown blocks.
  blocklyWrapper.Xml.domToBlock = function (
    xmlBlock: Element,
    workspace: Workspace
  ) {
    let block;
    try {
      block = originalDomToBlock(xmlBlock, workspace);
    } catch (e) {
      console.warn(`Creating "unknown block". ${(e as Error).message}`);
      block = originalDomToBlock(
        blocklyWrapper.Xml.textToDom('<block type="unknown" />'),
        workspace
      );
      block
        ?.getField('NAME')
        ?.setValue(`unknown block: ${xmlBlock.getAttribute('type')}`);
    }
    return block;
  };

  /**
   * Decode an XML DOM and create blocks on the workspace while preserving the original order of blocks.
   *
   * @param {Blockly.Workspace} workspace - The Blockly workspace where blocks will be created.
   * @param {Element} xml - The XML DOM containing block elements to be created on the workspace.
   * @returns {Object[]} An array of objects containing the created blocks and their positions.
   */
  blocklyWrapper.Xml.domToBlockSpace = function (workspace, xml) {
    const blockElements = getBlockElements(xml);
    const blocks: XmlBlockConfig[] = [];
    // To position the blocks, we first render them all to the Block Space
    //  and parse any X or Y coordinates set in the XML. Then, we store
    //  the rendered blocks and the coordinates in an array so that we can
    //  position them.
    blockElements.forEach(xmlChild => {
      // Check xmlChild and its children for XML attributes that need to be manipulated.
      processBlockAndChildren(xmlChild);

      // Further manipulate the XML for specific top block types.
      addNameToBlockFunctionDefinitionBlock(xmlChild);
      addMutationToProcedureDefBlocks(xmlChild);
      addMutationToMiniToolboxBlocks(xmlChild);
      makeWhenRunUndeletable(xmlChild);

      const blockly_block = Blockly.Xml.domToBlock(xmlChild, workspace);
      const x = parseInt(xmlChild.getAttribute('x') || '0', 10);
      const y = parseInt(xmlChild.getAttribute('y') || '0', 10);
      blocks.push({
        blockly_block: blockly_block,
        x: x,
        y: y,
      });
    });

    return blocks;
  };

  blocklyWrapper.Xml.blockSpaceToDom = blocklyWrapper.Xml.workspaceToDom;
  blocklyWrapper.Xml.textToDom = blocklyWrapper.utils.xml.textToDom;
}
/**
 * Gets the XML representation for a project, including its workspace and, if applicable, the hidden definition workspace.
 *
 * @param {Blockly.Workspace} workspace - The workspace from which to obtain the project XML.
 * @returns {string} The XML representation of the project.
 *
 */
export function getProjectXml(workspace: WorkspaceSvg) {
  // Start by getting the XML for all blocks on the workspace.
  const workspaceXml = Blockly.Xml.blockSpaceToDom(workspace);

  if (shouldSkipHiddenWorkspace(workspace)) {
    return workspaceXml;
  }

  // Also serialize blocks on the hidden workspace for procedure definitions.
  const hiddenWorkspaceXml = Blockly.Xml.blockSpaceToDom(
    Blockly.getHiddenDefinitionWorkspace()
  );

  // Merge the hidden workspace XML into the primary XML
  hiddenWorkspaceXml.childNodes.forEach(node => {
    const clonedNode = node.cloneNode(true);
    workspaceXml.appendChild(clonedNode);
  });

  removeIdsFromBlocks(workspaceXml, Blockly.levelBlockIds);

  return workspaceXml;
}

/**
 * Removes the 'id' attribute from all 'block' elements except those specified to be preserved.
 * This is intended to prevent writing duplicate entries to the level_sources table,
 * but it can also be used in other contexts where block ids are not desired.
 * @param {Element} element - The XML element to process.
 * @param {Set<string>} [idsToExempt=new Set<string>] - An optional set of ids to preserve, if found.
 */
export function removeIdsFromBlocks(
  element: Element,
  idsToExempt: Set<string> = new Set<string>()
) {
  // Find all 'block' elements including nested children, including the current element if it's a block.
  const blockElements = element.querySelectorAll(':scope block');

  // Iterate over each found 'block' element
  blockElements.forEach(blockElement => {
    const id = blockElement.getAttribute('id');
    if (id && !idsToExempt.has(id)) {
      blockElement.removeAttribute('id');
    }
  });
}

/**
 * Adds a mutation element to a block if it should have an open miniflyout.
 * CDO Blockly uses an unsupported method for serializing miniflyout state
 * where arbitrary block attribute could be used to manage extra state.
 * Mainline Blockly expects a mutator. The presence of the mutation element
 * will trigger the block's domToMutation function to run, if it exists.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToMiniToolboxBlocks(blockElement: Element) {
  const miniflyoutAttribute = blockElement.getAttribute('miniflyout');
  const existingMutationElement =
    blockElement.querySelector(':scope > mutation');
  if (!miniflyoutAttribute || existingMutationElement) {
    // The block is the wrong type or has somehow already been processed.
    return;
  }
  // The default icon is a '+' symbol which represents a currently-closed flyout.
  const useDefaultIcon = miniflyoutAttribute === 'open' ? 'false' : 'true';

  // The mutation element does not exist, so create it.
  const newMutationElement =
    blockElement.ownerDocument.createElement('mutation');

  // Create new mutation attribute based on original block attribute.
  newMutationElement.setAttribute('useDefaultIcon', useDefaultIcon);

  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(newMutationElement, blockElement.firstChild);

  // Remove the miniflyout attribute from the parent block element.
  blockElement.removeAttribute('miniflyout');
}

/**
 * Sets the deletable attribute on when_run blocks to false.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function makeWhenRunUndeletable(blockElement: Element) {
  if (blockElement.getAttribute('type') !== BLOCK_TYPES.whenRun) {
    return;
  }
  blockElement.setAttribute('deletable', 'false');
}

/**
 * Adds a mutation element to a block if it is a behavior block.
 * CDO Blockly uses an unsupported method for serializing state
 * where arbitrary XML attributes could hold important information.
 * Mainline Blockly expects a mutator. The presence of the mutation element
 * will trigger the block's domToMutation function to run, if it exists.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToBehaviorBlocks(blockElement: Element) {
  const blockType = blockElement.getAttribute('type');
  const behaviorTypes: string[] = [
    BLOCK_TYPES.behaviorDefinition,
    BLOCK_TYPES.behaviorGet,
  ];
  if (blockType && !behaviorTypes.includes(blockType)) {
    return;
  }
  const mutationElement =
    blockElement.querySelector(':scope > mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);

  // We need to keep track of whether the user created the behavior or not.
  // If not, it needs a static behavior id in order to be translatable
  // (e.g. shared behaviors).
  // In CDO Blockly, the 'usercreated' flag was set on the block. Google Blockly
  // expects this kind of extra state in a mutator.
  const userCreated = readBooleanAttribute(
    blockElement,
    USER_CREATED_XML_ATTRIBUTE,
    FALSEY_DEFAULT
  );
  mutationElement.setAttribute('userCreated', `${userCreated}`);

  // In CDO Blockly, behavior ids were stored on the field. Google Blockly
  // expects this kind of extra state in a mutator.
  const nameField =
    getFieldOrTitle(blockElement, 'VAR') ||
    getFieldOrTitle(blockElement, 'NAME');
  const idAttribute = nameField && nameField.getAttribute('id');
  if (idAttribute) {
    // Create new mutation attribute based on original block attribute.
    mutationElement.setAttribute('behaviorId', idAttribute);
  }
}

/**
 * Adds a mutation element to a block if it is a procedure definition.
 * Currently, the only reason to have a mutator for procedures is to store
 * the 'usercreated' property. Behavior definition mutators are more complicated,
 * see addMutationToBehaviorDefBlocks.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToProcedureDefBlocks(blockElement: Element) {
  if (blockElement.getAttribute('type') !== BLOCK_TYPES.procedureDefinition) {
    return;
  }
  const mutationElement =
    blockElement.querySelector(':scope > mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);

  // We need to keep track of whether the user created the procedure definition.
  // In CDO Blockly, the 'usercreated' flag was set on the block. Google Blockly
  // expects this kind of extra state in a mutator.
  const userCreated = readBooleanAttribute(
    blockElement,
    USER_CREATED_XML_ATTRIBUTE,
    FALSEY_DEFAULT
  );
  mutationElement.setAttribute('userCreated', `${userCreated}`);
}

/**
 * Adds a mutation element to a block if it should be invisible.
 * These blocks will be loaded onto the hidden workspace for procedure definitions.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToInvisibleBlocks(blockElement: Element) {
  const invisible = !readBooleanAttribute(
    blockElement,
    'uservisible',
    TRUTHY_DEFAULT
  );

  if (!invisible) {
    return;
  }
  const mutationElement =
    blockElement.querySelector(':scope > mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);
  mutationElement.setAttribute('invisible', `${invisible}`);
}

/**
 * In the event that a legacy project has functions without names, add a name
 * to the definition block's NAME field.
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addNameToBlockFunctionDefinitionBlock(blockElement: Element) {
  const blockType = blockElement.getAttribute('type');
  if (blockType !== BLOCK_TYPES.procedureDefinition) {
    return;
  }
  const fieldElement = getFieldOrTitle(blockElement, 'NAME');
  if (!fieldElement) {
    return;
  }

  if (fieldElement.textContent === '') {
    fieldElement.textContent = Blockly.Msg.UNNAMED_KEY;
  }
}

/**
 * In the event that a legacy project has functions without names, add a name
 * to a call block's mutator.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addNameToBlockFunctionCallBlock(blockElement: Element) {
  const blockType = blockElement.getAttribute('type');
  if (blockType !== BLOCK_TYPES.procedureCall) {
    return;
  }
  const mutationElement =
    blockElement.querySelector(':scope > mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);
  if (!mutationElement.getAttribute('name')) {
    mutationElement.setAttribute('name', Blockly.Msg.UNNAMED_KEY);
  }
}

/**
 * If a field should was serialized before we had behavior ids, manually add
 * one based on the behavior name found in the field.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
function addMissingBehaviorId(blockElement: Element) {
  const blockType = blockElement.getAttribute('type');
  if (blockType === BLOCK_TYPES.behaviorGet) {
    const behaviorNameField =
      // CDO Blockly projects used a VAR field to store the behavior name.
      getFieldOrTitle(blockElement, 'VAR') ||
      // Google Blockly projects use a NAME field to store the behavior name.
      getFieldOrTitle(blockElement, 'NAME');
    setIdFromTextContent(behaviorNameField);
  } else if (blockType === BLOCK_TYPES.behaviorDefinition) {
    setIdFromTextContent(getFieldOrTitle(blockElement, 'NAME'));
  }
}

/**
 * If a field should was serialized before we had behavior ids, manually add
 * one based on the behavior name found in the field.
 *
 * @param {Element} element - The XML element (title or field) for a block.
 */
function setIdFromTextContent(element: Element | null) {
  if (!element) {
    return;
  }
  if (!element.getAttribute('id') && element.textContent) {
    element.setAttribute('id', element.textContent);
  }
}
/**
 * Adds a mutation element to a block if it's a text join block with an input count.
 * CDO Blockly uses an unsupported method for serializing input count state
 * where an arbitrary block attribute could be used to manage extra state.
 * Mainline Blockly expects a mutator. The presence of the mutation element
 * will trigger the block's domToMutation function to run, if it exists.
 *
 * @param {Element} blockElement - The XML element for a single block.
 */
export function addMutationToTextJoinBlock(blockElement: Element) {
  const blockType = blockElement.getAttribute('type');
  if (blockType && !['text_join', 'text_join_simple'].includes(blockType)) {
    return;
  }
  const mutationElement =
    blockElement.querySelector(':scope > mutation') ||
    blockElement.ownerDocument.createElement('mutation');
  // Place mutator before fields, values, and other nested blocks.
  blockElement.insertBefore(mutationElement, blockElement.firstChild);

  // We need to keep track of the expected number of inputs in order to create them all.
  // Google Blockly expects this kind of extra state to be in a mutator.
  const inputCount = blockElement.getAttribute('inputcount');
  mutationElement.setAttribute('items', `${inputCount}`);
}

function getFieldOrTitle(blockElement: Element, name: string) {
  // Title is the legacy name for field, we support getting name from
  // either field or title.
  return (
    //The :scope pseudo-class is used to refer to the parent element (blockElement)
    // It ensures that the subsequent selectors target only immediate children.
    blockElement.querySelector(`:scope > field[name="${name}"]`) ||
    blockElement.querySelector(`:scope > title[name="${name}"]`)
  );
}

/**
 * A helper function designed to process each individual block in an XML tree.
 * Exported for testing.
 * @param {Element} block - The XML element for a single block.
 */
export function processBlockAndChildren(block: Element) {
  processIndividualBlock(block);

  // Blocks can contain other blocks so we must process all of their children.
  // This query will get all child blocks of the current block, not just direct descendants.
  const childBlocks = block.querySelectorAll('block');
  childBlocks.forEach(childBlock => {
    processIndividualBlock(childBlock);
  });
}

/**
 * Perform any need manipulations for a given XML block element.
 * @param {Element} block - The XML element for a single block.
 */
export function processIndividualBlock(block: Element) {
  addNameToBlockFunctionCallBlock(block);
  addMissingBehaviorId(block);
  addMutationToBehaviorBlocks(block);
  // Convert unsupported can_disconnect_from_parent attributes.
  makeLockedBlockImmovable(block);
  addMutationToTextJoinBlock(block);
  addMutationToInvisibleBlocks(block);
}

/**
 * CDO Blockly supported a can_disconnect_from_parent attribute that
 * effectively worked like the modern movable property. To prevent
 * unintended movability changes to student code, we convert the unsupported
 * can_disconnect_from_parentto movable.
 * @param {Element} block - The XML element for a single block.
 */
function makeLockedBlockImmovable(block: Element) {
  const canDisconnectValue = block.getAttribute('can_disconnect_from_parent');
  // If present, value will be either "true" or "false" (string, not boolean)
  if (canDisconnectValue) {
    block.setAttribute('movable', canDisconnectValue);
    block.removeAttribute('can_disconnect_from_parent');
  }
}

/**
 * Extracts block elements from the provided XML and returns them partitioned based on their types.
 * If no block elements are found in the XML, an empty array is returned.
 *
 * @param {Element} xml - The XML element containing block elements.
 * @returns {Element[]} An array of block elements or an empty array if no blocks are present.
 */
export function getBlockElements(xml: Element) {
  // Convert XML to an array of block elements
  return Array.from(xml.querySelectorAll('xml > block'));
}

/**
 * Removes all top-level invisible blocks from a Blockly xml element. "Top-level" blocks
 * in this case also includes blocks that nested directly within a category element.
 * Used to (unsupported) invisible blocks from a toolbox definition
 */
export function removeInvisibleBlocks(xml: Element) {
  const categories = xml.getElementsByTagName('category');
  const blocks = xml.getElementsByTagName('block');

  // Convert HTMLCollection to an array to iterate safely
  const blocksArray = Array.from(blocks);
  const categoriesArray = Array.from(categories);

  blocksArray.forEach(block => {
    if (
      (block.parentElement === xml ||
        categoriesArray.includes(block.parentElement as Element)) &&
      block.getAttribute('uservisible') === 'false'
    ) {
      block.remove();
    }
  });
  return xml;
}

/**
 * Removes statically-defined procedure call blocks from the auto-populated
 * Functions toolbox category. Call blocks are automatically supplied by the
 * flyout category callback.
 */
export function removeStaticCallBlocks(xml: Element) {
  // Find the auto-populated Functions category, if it exists.
  const procedureCategory = Array.from(
    xml.getElementsByTagName('category')
  ).find(category => category.getAttribute('custom') === 'PROCEDURE');

  if (procedureCategory) {
    // Find any procedure call blocks defined within the XML for this category
    const procedureCallBlocks = Array.from(
      procedureCategory.getElementsByTagName('block')
    ).filter(block => block.getAttribute('type') === BLOCK_TYPES.procedureCall);

    // Remove each of the filtered blocks
    procedureCallBlocks.forEach(block => block.remove());
  }
  return xml;
}
