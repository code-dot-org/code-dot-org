// Not re-exported from index.ts: convertXmlToJson pulls in blockly/types,
// a heavy dependency graph the barrel's other modules avoid.

import * as BlocklyCore from 'blockly/core';

import {DYNAMIC_CATEGORY_OPTIONS} from '../../constants';
import {getSimplifiedStateForFlyout} from '../serialization/flyouts';
import {convertXmlToJson} from '../serialization/xmlToJson';

import {makeCategory, makeDynamicCategory} from './factories';

type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;
type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;

/**
 * Convert an XML toolbox — category or flyout — to a JSON toolbox
 * definition. Requires installed blocks (conversion loads blocks onto a
 * headless workspace). A category that fails to convert is dropped with a
 * warning.
 */
export function toolboxXmlToDefinition(xml: string): ToolboxInfo | undefined {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) {
    return undefined;
  }
  const categories = Array.from(doc.documentElement.children).filter(
    child => child.tagName === 'category'
  );

  // Flyout toolbox: bare blocks at the root.
  if (categories.length === 0) {
    try {
      const contents = getSimplifiedStateForFlyout(
        convertXmlToJson(doc.documentElement)
      );
      return contents.length ? {kind: 'flyoutToolbox', contents} : undefined;
    } catch (e) {
      console.warn('toolboxXmlToDefinition: flyout conversion failed', e);
      return undefined;
    }
  }

  const contents: ToolboxItemInfo[] = [];
  categories.forEach(child => {
    const name = child.getAttribute('name') || '';
    const custom = child.getAttribute('custom');
    if (custom) {
      // Dynamic categories are keyed by their DYNAMIC_CATEGORY_OPTIONS entry
      // (which names the category); a custom flyout with no entry (e.g.
      // legacy "Behavior") falls through to a static category of the XML
      // children.
      const key = Object.keys(DYNAMIC_CATEGORY_OPTIONS).find(
        k => DYNAMIC_CATEGORY_OPTIONS[k] === custom
      );
      if (key) {
        contents.push(makeDynamicCategory(key, custom));
        return;
      }
    }
    try {
      // domToBlockSpace only reads <block> children of an <xml> root, so
      // rewrap the category's blocks in one.
      const wrapper = doc.createElement('xml');
      Array.from(child.children).forEach(block =>
        wrapper.appendChild(block.cloneNode(true))
      );
      contents.push(
        makeCategory(
          name,
          getSimplifiedStateForFlyout(convertXmlToJson(wrapper))
        )
      );
    } catch (e) {
      console.warn(`toolboxXmlToDefinition: dropped category "${name}"`, e);
    }
  });
  return contents.length ? {kind: 'categoryToolbox', contents} : undefined;
}
