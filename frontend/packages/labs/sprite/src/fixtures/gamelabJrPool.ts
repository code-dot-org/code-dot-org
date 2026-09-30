import type {PoolBlock} from '../blockly/pool';

// The GamelabJr block pool as dashboard's Block#block_options serves it to
// a level: each block's JSON file, named for the file, with the helper code
// of the .js file beside it, if any.
const configs = import.meta.glob<{
  category?: string;
  config: PoolBlock['config'];
}>('../../../../../../dashboard/config/blocks/GamelabJr/*.json', {
  eager: true,
  import: 'default',
});
const helpers = import.meta.glob<string>(
  '../../../../../../dashboard/config/blocks/GamelabJr/*.js',
  {eager: true, query: '?raw', import: 'default'},
);

function baseName(path: string): string {
  return (path.split('/').pop() as string).replace(/\.[^.]+$/, '');
}

const helperByName = new Map(
  Object.entries(helpers).map(([path, code]) => [baseName(path), code]),
);

export const GAMELAB_JR_POOL: PoolBlock[] = Object.entries(configs)
  .map(([path, {category, config}]) => ({
    name: baseName(path),
    pool: 'GamelabJr',
    category,
    config,
    helperCode: helperByName.get(baseName(path)) ?? null,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
