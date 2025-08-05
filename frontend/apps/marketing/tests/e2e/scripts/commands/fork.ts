import {readJSON} from 'fs-extra';
import {simpleGit} from 'simple-git';

import {SNAPSHOT_DIR, ALL_THE_THINGS_ENTRY_ID} from '../config';
import {CreateOrUpdateEntryType, SerializedComponent} from '../types';

export async function fork(createOrUpdateEntry: CreateOrUpdateEntryType) {
  const snapshotFile = `${SNAPSHOT_DIR}/${ALL_THE_THINGS_ENTRY_ID}.json`;
  const serializedComponent: SerializedComponent = await readJSON(snapshotFile);
  const snapshotData = serializedComponent.entryContent;

  // Change the slug and title for clarity
  const branchName = (await simpleGit().branch()).current.replaceAll('/', '-');

  const title = `[Fork] All The Things - ${branchName}`;
  const slug = `/engineering/all-the-things-${branchName}`;

  snapshotData.fields.slug['en-US'] = slug;
  snapshotData.fields.title['en-US'] = title;
  snapshotData.fields.pageHeading['en-US'] = title;

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
