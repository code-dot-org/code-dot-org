// The server does not check the datasets that levelbuilders save. This test is the
// CI guard for the files that the levelbuilder content commit adds to the repo.

import fs from 'fs';
import path from 'path';

import {parseCsvText} from '@cdo/apps/ailab/engine/csvReaderWrapper';
import type {Metadata} from '@cdo/apps/ailab/engine/types';

const CONTENT_DIR = path.resolve(
  __dirname,
  '../../../../dashboard/config/level_content/ailab_datasets'
);
const MANIFEST_FILE = path.join(CONTENT_DIR, 'manifest.json');

interface StoredEntry {
  id: string;
  rowCount: number;
}

const read = (fileName: string) =>
  fs.readFileSync(path.join(CONTENT_DIR, fileName), 'utf-8');

// No manifest file means that no levelbuilder has saved a dataset.
const storedEntries = (): StoredEntry[] =>
  fs.existsSync(MANIFEST_FILE)
    ? JSON.parse(read('manifest.json')).datasets
    : [];

function problemsIn({id, rowCount}: StoredEntry): string[] {
  const csv = parseCsvText(read(`${id}.csv`));
  if (!csv.ok) {
    return [`${id}: the CSV does not load (${csv.reason})`];
  }
  const metadata: Metadata = JSON.parse(read(`${id}.json`));
  const columns = Object.keys(csv.rows[0]);
  const problems = (metadata.fields ?? [])
    .filter(field => !columns.includes(field.id!))
    .map(field => `${id}: the CSV has no column "${field.id}"`);
  if (csv.rows.length !== rowCount) {
    problems.push(
      `${id}: rowCount is ${rowCount}, but the CSV loads ${csv.rows.length} rows`
    );
  }
  if (metadata.name !== id) {
    problems.push(`${id}: the metadata name is "${metadata.name}"`);
  }
  return problems;
}

describe('stored AI Lab datasets', () => {
  it('have files that agree with their manifest entries', () => {
    expect(storedEntries().flatMap(problemsIn)).toEqual([]);
  });
});
