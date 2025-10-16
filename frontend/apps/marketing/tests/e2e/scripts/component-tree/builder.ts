import {Entry, Environment} from 'contentful-management';

import {ALL_THE_THINGS_ENTRY_ID} from '../config';

import {ComponentNode} from './component-tree';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLinkedEntryIdsFromExperience(datasources: any[]) {
  const linkedEntryIdSet = new Set<string>();

  for (const datasource of datasources) {
    if (datasource.sys?.linkType === 'Entry') {
      linkedEntryIdSet.add(datasource.sys.id);
    }
  }

  return linkedEntryIdSet;
}

/**
 * The Experience JSON contains a field called "dataSource" which
 * is a map of datasources. Each datasource references another asset or entry in a
 * tree structure. In this case, the "All The Things" experience entry is the root node
 * and the datasources are the direct children.
 */
function getRootNodeChildrenIdSet(entry: Entry) {
  const datasources = Object.values(entry.fields.dataSource['en-US']);
  const linkedEntryIdSet = getLinkedEntryIdsFromExperience(datasources);

  // Also add the SEO entry id as a direct child of the experience entry
  const seoEntryId = entry.fields.seoMetadata['en-US'].sys.id;
  linkedEntryIdSet.add(seoEntryId);

  return linkedEntryIdSet;
}

/**
 * Recursively build the Component Tree, with "All The Things" experience entry as the root node
 */
export async function buildComponentTree(env: Environment, entry: Entry) {
  const rootNode = new ComponentNode(ALL_THE_THINGS_ENTRY_ID, entry);
  const rootNodeChildrenIdSet = getRootNodeChildrenIdSet(entry);

  /**
   * Reads each field (which is a 'variable' in experience) and checks if it is a linked entry.
   * If it is, add it to the linkedEntryIdSet.
   */
  async function getLinkedEntriesFromEntry(entry: Entry) {
    const linkedEntryIdSet = new Set<string>();

    for (const field of Object.values(entry.fields)) {
      const entries = Array.isArray(field['en-US'])
        ? field['en-US']
        : [field['en-US']];

      for (const entry of entries) {
        if (entry?.sys?.linkType === 'Entry') {
          linkedEntryIdSet.add(entry.sys.id);
        }
      }
    }

    return linkedEntryIdSet;
  }

  /**
   * Using depth-first traversal, build the component tree.
   */
  async function dfs(env: Environment, entryId: string) {
    const entry = await env.getEntry(entryId);
    const node = new ComponentNode(entryId, entry);

    const linkedEntryIdSet = await getLinkedEntriesFromEntry(entry);

    for (const linkedEntryId of linkedEntryIdSet) {
      const linkedEntryNode = await dfs(env, linkedEntryId);
      node.add(linkedEntryNode);
    }

    return node;
  }

  // Starting from the root node's children, perform dfs traversal to build the tree
  for (const linkedEntryId of rootNodeChildrenIdSet) {
    const linkedEntryNode = await dfs(env, linkedEntryId);

    rootNode.add(linkedEntryNode);
  }

  return rootNode;
}
