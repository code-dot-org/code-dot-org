import fs from 'fs';
import path from 'path';

import {parseLevelConfig} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

// Every level file with a level_config holds a valid one: the lab ignores
// a config with problems whole.
const ROOT = path.resolve(__dirname, '../../../../../../../dashboard/config');
const DIRS = [
  'levels/custom/spritelab',
  'standalone_projects/levels/custom/spritelab',
];

const configs = DIRS.flatMap(dir =>
  fs
    .readdirSync(path.join(ROOT, dir))
    .filter(name => name.endsWith('.level'))
    .map(name => path.join(ROOT, dir, name))
    .map(file => [file, fs.readFileSync(file, 'utf8')] as const)
    .filter(([, text]) => text.includes('"level_config"'))
    .map(([file, text]) => {
      const json = text.match(/<config><!\[CDATA\[([\s\S]*?)\]\]><\/config>/);
      const config = JSON.parse(json?.[1] ?? '{}').properties?.level_config;
      return [path.basename(file), config] as const;
    })
);

describe('level files with a level_config', () => {
  it('include the quest-builder-2026 levels', () => {
    expect(configs.length).toBeGreaterThanOrEqual(15);
  });

  it.each(configs)('%s holds a valid one', (_name, config) => {
    expect(parseLevelConfig(config).problems).toEqual([]);
  });
});
