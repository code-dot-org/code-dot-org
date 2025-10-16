import {ClientAPI} from 'contentful-management';
import {ensureDir, writeJSON} from 'fs-extra';

import {buildComponentTree} from '../component-tree/builder';
import {ComponentNode} from '../component-tree/component-tree';
import {SNAPSHOT_DIR, ALL_THE_THINGS_ENTRY_ID} from '../config';
import type {Environment} from '../types';

export async function updateSnapshot(
  client: ClientAPI,
  environment: Environment,
  sourceEntryId: string,
) {
  console.log(
    `Updating snapshot using entry ${sourceEntryId} FORK=${sourceEntryId !== ALL_THE_THINGS_ENTRY_ID}`,
  );

  const isFork = sourceEntryId !== ALL_THE_THINGS_ENTRY_ID;
  if (isFork) {
    console.warn(
      `⚠️ You are updating the snapshot using a forked version of All The Things`,
    );
  }

  await ensureDir(SNAPSHOT_DIR);

  // Fetch the target environment from where the entry is
  const env = await client
    .getSpace(process.env.CONTENTFUL_SPACE_ID!)
    .then(space => space.getEnvironment(environment));
  const rootEntry = await env.getEntry(sourceEntryId);

  // Build the component tree
  const rootNode = await buildComponentTree(env, rootEntry);

  // Using DFS, serialize the component tree and track post-order traversal for bottoms-up deserialization
  const postOrderNodes: string[] = [];

  async function dfs(node: ComponentNode) {
    await node.serialize(isFork);

    for (const child of node.children) {
      await dfs(child);
    }

    postOrderNodes.push(node.entryId);
  }

  await dfs(rootNode);

  await writeJSON(`${SNAPSHOT_DIR}/entries.json`, postOrderNodes, {
    spaces: 2,
  });

  console.log(`Post order of the component tree: ${postOrderNodes}`);
}
