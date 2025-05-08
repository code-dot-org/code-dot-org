#!/usr/bin/env tsx

import {createClient, Entry} from 'contentful-management';
import {config} from 'dotenv';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import {fork} from './commands/fork';
import {publishSnapshot} from './commands/publish-snapshot';
import {updateSnapshot} from './commands/update-snapshot';
import {ALL_THE_THINGS_ENTRY_ID, ROOT_DIR} from './config';
import {CreateOrUpdateEntryInputProps, Environment} from './types';

console.log(`Using ${ROOT_DIR}/.env`);
config({path: `${ROOT_DIR}/.env`});

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const client = createClient({accessToken: ACCESS_TOKEN});

async function getEnvironment(environmentId: Environment) {
  const space = await client.getSpace(SPACE_ID);
  return space.getEnvironment(environmentId);
}

async function updateEntry({
  entryId,
  entryContent,
  environment,
  publish,
}: {
  entryId: string;
  entryContent: Entry;
  publish: boolean;
  environment: Environment;
}) {
  const env = await getEnvironment(environment);

  const entry = await env.getEntry(entryId);

  Object.keys(entryContent.fields).forEach(field => {
    entry.fields[field] = entryContent.fields[field];
  });

  await entry.update();

  return publish ? entry.publish() : entry;
}

async function createOrUpdateEntry({
  contentType,
  entryId,
  entryContent,
  environment,
  publish,
  reuseId,
}: CreateOrUpdateEntryInputProps) {
  const env = await getEnvironment(environment);

  // Check if the entry already exists
  const existingEntry =
    entryId && (await env.getEntry(entryId).catch(() => null));
  if (existingEntry) {
    // If it exists, update it
    return updateEntry({
      entryId,
      entryContent,
      publish,
      environment,
    });
  } else {
    // If it doesn't exist, create a new entry

    const entry =
      reuseId && entryId
        ? await env.createEntryWithId(contentType, entryId, entryContent)
        : await env.createEntry(contentType, entryContent);

    return publish ? entry.publish() : entry;
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .command(
      'update-snapshot',
      'Updates the source control version of All The Things',
      args => {
        args
          .option('environment', {type: 'string', default: 'production'})
          .option('source-entry-id', {
            type: 'string',
            default: ALL_THE_THINGS_ENTRY_ID,
          });
      },
    )
    .command(
      'publish-snapshot',
      'Publishes the source control version of All The Things to Contentful',
      args =>
        args.option('environment', {type: 'string', default: 'development'}),
    )
    .command(
      'fork',
      'Creates a fork of All The Things using the local snapshot',
    )
    .demandCommand(1)
    .help()
    .parse();

  const command = argv._[0];

  if (command === 'update-snapshot') {
    await updateSnapshot(
      client,
      argv.environment as Environment,
      argv.sourceEntryId as string,
    );
  } else if (command === 'publish-snapshot') {
    await publishSnapshot(argv.environment as Environment, createOrUpdateEntry);
  } else if (command === 'fork') {
    await fork(createOrUpdateEntry);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`❌ Error: ${error.message}`, error);
  process.exit(1);
});
