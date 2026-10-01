import type {PoolBlock} from '../blockly/pool';

// Block pools as dashboard's Block#block_options serves them to a level:
// each block's JSON file, named for the file, with the helper code of the
// .js file beside it, if any.
const configs = import.meta.glob<{
  category?: string;
  config: PoolBlock['config'];
}>(
  [
    '../../../../../../dashboard/config/blocks/GamelabJr/*.json',
    '../../../../../../dashboard/config/blocks/GameDev/*.json',
  ],
  {eager: true, import: 'default'},
);
const helpers = import.meta.glob<string>(
  [
    '../../../../../../dashboard/config/blocks/GamelabJr/*.js',
    '../../../../../../dashboard/config/blocks/GameDev/*.js',
  ],
  {eager: true, query: '?raw', import: 'default'},
);

function baseName(path: string): string {
  return (path.split('/').pop() as string).replace(/\.[^.]+$/, '');
}

function poolName(path: string): string {
  return path.split('/').at(-2) as string;
}

const helperByPath = new Map(
  Object.entries(helpers).map(([path, code]) => [
    path.replace(/\.js$/, ''),
    code,
  ]),
);

const ALL: PoolBlock[] = Object.entries(configs)
  .map(([path, {category, config}]) => ({
    name: baseName(path),
    pool: poolName(path),
    category,
    config,
    helperCode: helperByPath.get(path.replace(/\.json$/, '')) ?? null,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** The blocks of the named pools, as a level naming them gets them. */
export function poolBlocks(...pools: string[]): PoolBlock[] {
  return ALL.filter(block => !!block.pool && pools.includes(block.pool));
}

export const GAMELAB_JR_POOL = poolBlocks('GamelabJr');
