import {Entry} from 'contentful-management';
import {readJSON, writeJSON} from 'fs-extra';

import {ALL_THE_THINGS_ENTRY_ID, SNAPSHOT_DIR} from '../config';
import {SerializedComponent} from '../types';

export class ComponentNode {
  public children: ComponentNode[];
  public entryId: string;
  public entry: Entry;

  constructor(entryId: string, entry: Entry) {
    this.entryId = entryId;
    this.entry = entry;
    this.children = [];
  }

  add(component: ComponentNode) {
    this.children.push(component);
  }

  async serialize(isFork: boolean) {
    const entryPlainObject = this.entry.toPlainObject();

    // If this is a fork, do not overwrite the title, slug and pageHeading
    if (isFork && this.entryId === ALL_THE_THINGS_ENTRY_ID) {
      const originalSerializedComponent: SerializedComponent = await readJSON(
        `${SNAPSHOT_DIR}/${this.entryId}.json`,
      );

      const originalEntry = originalSerializedComponent.entryContent;

      entryPlainObject.fields.title['en-US'] =
        originalEntry.fields.title['en-US'];
      entryPlainObject.fields.slug['en-US'] =
        originalEntry.fields.slug['en-US'];
      entryPlainObject.fields.pageHeading['en-US'] =
        originalEntry.fields.pageHeading['en-US'];
    }

    await writeJSON(
      `${SNAPSHOT_DIR}/${this.entryId}.json`,
      {
        entryContent: {fields: entryPlainObject.fields},
        contentType: entryPlainObject.sys.contentType.sys.id,
      },
      {
        spaces: 2,
      },
    );

    console.log(`Serialized ${SNAPSHOT_DIR}/${this.entryId}.json`);
  }
}
