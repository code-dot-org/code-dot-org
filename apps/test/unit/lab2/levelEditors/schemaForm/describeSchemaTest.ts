import {z} from 'zod';

import {describeSchema} from '@cdo/apps/lab2/levelEditors/schemaForm/describeSchema';
import {levelConfigSchema} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

describe('describeSchema', () => {
  it('gives each type of option its kind of field', () => {
    const fields = describeSchema(
      z.strictObject({
        on: z.boolean().optional(),
        size: z.enum(['small', 'large']),
        name: z.string().optional(),
        count: z.number().optional(),
        tags: z.array(z.string()).optional(),
        sizes: z.array(z.enum(['small', 'large'])).optional(),
        rows: z.array(z.string()).optional().meta({widget: 'lines'}),
        inner: z.strictObject({flag: z.boolean().optional()}).optional(),
        other: z.record(z.string(), z.string()).optional(),
      })
    );
    expect(fields.map(field => [field.key, field.kind])).toEqual([
      ['on', 'flag'],
      ['size', 'choice'],
      ['name', 'text'],
      ['count', 'number'],
      ['tags', 'names'],
      ['sizes', 'names'],
      ['rows', 'lines'],
      ['inner', 'group'],
      ['other', 'json'],
    ]);
    expect(fields[1]).toMatchObject({
      optional: false,
      choices: ['small', 'large'],
    });
    expect(fields[5].choices).toEqual(['small', 'large']);
    expect(fields[7].fields?.map(field => field.key)).toEqual(['flag']);
  });

  it('takes the title and description from the option, or makes a title from its key', () => {
    const [named, plain] = describeSchema(
      z.strictObject({
        paletteRoles: z
          .array(z.string())
          .optional()
          .meta({title: 'Palette roles', description: 'Which images.'}),
        startPattern: z.array(z.string()).optional(),
      })
    );
    expect(named).toMatchObject({
      title: 'Palette roles',
      description: 'Which images.',
      optional: true,
    });
    expect(plain.title).toBe('Start pattern');
  });

  it("describes the lab's level config as two titled groups", () => {
    const fields = describeSchema(levelConfigSchema);
    expect(fields.map(field => [field.key, field.kind, field.title])).toEqual([
      ['images', 'group', 'Images tab'],
      ['world', 'group', 'World tab'],
    ]);
    expect(fields[1].fields?.map(field => [field.key, field.kind])).toEqual([
      ['paletteRoles', 'names'],
      ['startPattern', 'lines'],
      ['startRoles', 'json'],
    ]);
  });
});
