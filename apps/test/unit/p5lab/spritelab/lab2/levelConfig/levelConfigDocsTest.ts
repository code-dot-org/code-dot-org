import fs from 'fs';
import path from 'path';

import {
  jsonSchemaFor,
  markdownFor,
} from '@cdo/apps/lab2/levelEditors/schemaForm/schemaDocs';
import {LEVEL_CONFIG_DOCS} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/levelConfigDocs';
import {levelConfigSchema} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

// The generated reference for the level settings, for people and for AI,
// stays in step with the schema. Run with UPDATE_SCHEMA_DOCS=1 to rewrite.
const REPO = path.resolve(__dirname, '../../../../../../..');
const OUT = path.join(REPO, 'apps/src/p5lab/spritelab/lab2/levelConfig');
const LEVELS = path.join(REPO, 'dashboard/config/levels/custom/spritelab');

function configOf(levelName: string): unknown {
  const text = fs.readFileSync(path.join(LEVELS, `${levelName}.level`), 'utf8');
  const json = text.match(/<config><!\[CDATA\[([\s\S]*?)\]\]><\/config>/);
  return JSON.parse(json?.[1] ?? '{}').properties.level_config;
}

const examples = [
  {
    title: 'Plain Sprite Lab',
    description: 'The Code tab and the game.',
    value: {},
  },
  {
    title: 'A level with the World tab',
    description:
      'The student also places images on the World grid, from the images in these roles, and cannot erase the last hero.',
    value: {world: {palette: ['hero', 'block'], keepsOneOf: ['hero']}},
  },
  {
    title: 'An image level (quest-builder-2026, level 3)',
    value: configOf('hoai2026-dev-make-a-character_final_2026'),
  },
  {
    title: 'A code level with scaffolding (quest-builder-2026, level 11)',
    value: configOf('hoai2026-dev-when-you-meet_final_2026'),
  },
  {
    title: 'Free play (quest-builder-2026, level 14)',
    value: configOf('hoai2026-dev-free-play_final_2026'),
  },
];

const files = {
  'level-config.schema.json': `${JSON.stringify(
    jsonSchemaFor(levelConfigSchema, LEVEL_CONFIG_DOCS),
    null,
    2
  )}\n`,
  'LEVEL_CONFIG.md': markdownFor(levelConfigSchema, {
    ...LEVEL_CONFIG_DOCS,
    examples,
  }),
};

describe('the level settings reference', () => {
  if (process.env.UPDATE_SCHEMA_DOCS) {
    Object.entries(files).forEach(([name, text]) =>
      fs.writeFileSync(path.join(OUT, name), text)
    );
  }

  it.each(Object.entries(files))(
    '%s is up to date (UPDATE_SCHEMA_DOCS=1 rewrites it)',
    (name, text) => {
      expect(fs.readFileSync(path.join(OUT, name), 'utf8')).toBe(text);
    }
  );
});
