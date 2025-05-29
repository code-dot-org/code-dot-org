import {readJSON} from 'fs-extra';
import os from 'node:os';

import {SNAPSHOT_DIR, ALL_THE_THINGS_ENTRY_ID} from '../config';
import {CreateOrUpdateEntryType, SerializedComponent} from '../types';

export async function fork(createOrUpdateEntry: CreateOrUpdateEntryType) {
  const snapshotFile = `${SNAPSHOT_DIR}/${ALL_THE_THINGS_ENTRY_ID}.json`;
  const serializedComponent: SerializedComponent = await readJSON(snapshotFile);
  const snapshotData = serializedComponent.entryContent;

  // Change the slug and title for clarity
  const username = os.userInfo().username;
  const title = `[${username}] All The Things - ${new Date().toISOString()}`;
  const slug = `all-the-things-${username}-${Date.now()}`;

  snapshotData.fields.slug['en-US'] = slug;
  snapshotData.fields.title['en-US'] = title;

  const createdEntry = await createOrUpdateEntry({
    contentType: serializedComponent.contentType,
    entryContent: snapshotData,
    publish: false,
    environment: 'development',
  });

  console.log(`✅ Created fork ${title}`);
  console.log(
    `View on Experience Builder: https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID!}/environments/development/experiences/${createdEntry.sys.id}`,
  );
}
