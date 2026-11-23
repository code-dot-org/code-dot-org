import {
  editableParts,
  levelConfigSchema,
  parseLevelConfig,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

describe('levelConfigSchema', () => {
  it('takes an empty config, which is plain Sprite Lab', () => {
    expect(parseLevelConfig({}).config).toEqual({});
    expect(editableParts({})).toEqual(['code']);
  });

  it('turns on the Images and World tabs with their groups', () => {
    expect(editableParts({images: {}})).toEqual(['code', 'images']);
    expect(editableParts({world: {}})).toEqual(['code', 'world']);
  });

  it('lets edits limit the parts to fewer than the groups give', () => {
    expect(editableParts({images: {}, world: {}, edits: ['world']})).toEqual([
      'world',
    ]);
  });

  it('refuses edits of a part whose group is not there', () => {
    const {problems} = parseLevelConfig({edits: ['code', 'world']});
    expect(problems.map(problem => problem.path)).toEqual(['edits']);
  });

  it('refuses to open on a part the student cannot change', () => {
    const {problems} = parseLevelConfig({focus: 'world'});
    expect(problems.map(problem => problem.path)).toEqual(['focus']);
    expect(parseLevelConfig({focus: 'play', edits: []}).problems).toEqual([]);
  });

  it('refuses a setting outside its group', () => {
    const {problems} = parseLevelConfig({palette: ['hero']});
    expect(problems).toHaveLength(1);
  });

  it('gives a subject only to a sprite', () => {
    const {problems} = parseLevelConfig({
      images: {makes: {type: 'background', subject: 'object'}},
    });
    expect(problems.map(problem => problem.path)).toEqual([
      'images.makes.subject',
    ]);
  });

  it('checks each kind of checklist step by its own fields', () => {
    const steps = (check: unknown) => ({
      objectives: {steps: [{text: 'x', check}]},
    });
    expect(parseLevelConfig(steps({kind: 'play'})).problems).toEqual([]);
    expect(
      parseLevelConfig(steps({kind: 'block', type: ['a', 'b'], under: 'c'}))
        .problems
    ).toEqual([]);
    expect(parseLevelConfig(steps({kind: 'scene'})).problems).toHaveLength(1);
    expect(parseLevelConfig(steps({kind: 'teleport'})).problems).toHaveLength(
      1
    );
  });

  it('keeps a level that sets up scenes from letting the student change them', () => {
    const {problems} = parseLevelConfig({
      scenes: {starting: [{id: 'scene-1', name: 'Scene 1'}], canChange: true},
    });
    expect(problems.map(problem => problem.path)).toEqual(['scenes.canChange']);
  });

  it('gives every option a title', () => {
    const untitled: string[] = [];
    const visit = (schema: unknown, path: string) => {
      const def = (schema as {_zod: {def: Record<string, unknown>}})._zod.def;
      if (def.type === 'object') {
        Object.entries(def.shape as Record<string, unknown>).forEach(
          ([key, child]) => {
            const meta = (
              child as {meta: () => {title?: string} | undefined}
            ).meta();
            if (!meta?.title) {
              untitled.push(`${path}${key}`);
            }
            visit(child, `${path}${key}.`);
          }
        );
      } else if (def.type === 'optional' || def.type === 'array') {
        visit(def.innerType ?? def.element, path);
      } else if (def.type === 'union') {
        (def.options as unknown[]).forEach(option => visit(option, path));
      }
    };
    visit(levelConfigSchema, '');
    // A checklist step's kind is chosen from the step's own titled menu.
    expect(untitled.filter(path => !path.endsWith('.kind'))).toEqual([]);
  });
});
