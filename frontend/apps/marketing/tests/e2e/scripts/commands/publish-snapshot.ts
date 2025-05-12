import {readJSON} from 'fs-extra';

import {ALL_THE_THINGS_ENTRY_ID, SNAPSHOT_DIR} from '../config';
import {
  CreateOrUpdateEntryType,
  Environment,
  SerializedComponent,
} from '../types';

export async function publishSnapshot(
  environment: Environment,
  createOrUpdateEntry: CreateOrUpdateEntryType,
) {
  console.log(`Publishing snapshots to ${environment}`);

  const postOrderEntryIds = await readJSON(`${SNAPSHOT_DIR}/entries.json`);

  // entries.json is a post-order traversal of the component tree which means that
  // each entry will be created from the leaf nodes of the tree up to the root node
  for (const entryId of postOrderEntryIds) {
    console.log(`Uploading linked entry ${entryId}`);
    const linkedEntrySnapshotData: SerializedComponent = await readJSON(
      `${SNAPSHOT_DIR}/${entryId}.json`,
    );

    const entry = linkedEntrySnapshotData.entryContent;

    await createOrUpdateEntry({
      contentType: linkedEntrySnapshotData.contentType,
      entryContent: entry,
      entryId,
      reuseId: true,
      publish: false,
      environment,
    });
  }

  console.log(`✅ Saved All The Things to ${environment} (Did not publish)`);
  console.log(
    `View on Experience Builder: https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID!}/environments/development/experiences/${ALL_THE_THINGS_ENTRY_ID}`,
  );
}
