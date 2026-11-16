import {parseLevelConfig} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

describe('parseLevelConfig', () => {
  const problemsOf = (value: unknown) =>
    parseLevelConfig(value).problems.map(problem => problem.path);

  it('takes no settings at all, which is free play', () => {
    expect(parseLevelConfig(undefined)).toEqual({config: {}, problems: []});
  });

  it('takes a level that names its focus and what the student edits', () => {
    const config = {
      focus: 'world',
      edits: ['images', 'world'],
      images: {makes: {type: 'sprite', role: 'friend'}, makeFirst: true},
      world: {palette: ['friend', 'block'], keepsOneOf: ['friend']},
      scenes: {starting: [{id: 'scene-1', name: 'Scene 1'}]},
    };
    expect(parseLevelConfig(config)).toEqual({config, problems: []});
  });

  it('wants a focus and what the student edits together', () => {
    expect(problemsOf({focus: 'code'})).toEqual(['edits']);
    expect(problemsOf({edits: ['code']})).toEqual(['focus']);
  });

  it('wants the focus to be something the student edits', () => {
    expect(problemsOf({focus: 'world', edits: ['images']})).toEqual(['edits']);
  });

  it('lets a level about playing edit nothing', () => {
    expect(problemsOf({focus: 'play', edits: []})).toEqual([]);
  });

  it('names a misspelled option by where it is', () => {
    expect(problemsOf({images: {onlyThisImge: true}})).toEqual(['images']);
    expect(problemsOf({wrold: {}})).toEqual(['']);
  });

  it('gives no config when any part is wrong', () => {
    const {config} = parseLevelConfig({
      focus: 'play',
      edits: [],
      images: {generationLimit: 0},
    });
    expect(config).toBeUndefined();
  });

  it('keeps a subject for sprites', () => {
    expect(
      problemsOf({images: {makes: {type: 'block', subject: 'object'}}})
    ).toEqual(['images.makes.subject']);
  });

  it('lets only a later scene be marked editable', () => {
    const scene = {id: 'scene-1', name: 'Scene 1'};
    const second = {id: 'second-scene', name: 'Scene 2', editable: true};
    expect(problemsOf({scenes: {starting: [scene, second]}})).toEqual([]);
    expect(
      problemsOf({scenes: {starting: [{...scene, editable: true}]}})
    ).toEqual(['scenes.starting.0.editable']);
  });

  it('lets a level set up scenes or let the student change them, not both', () => {
    const starting = [{id: 'scene-1', name: 'Scene 1'}];
    expect(problemsOf({scenes: {canChange: true}})).toEqual([]);
    expect(problemsOf({scenes: {starting, canChange: true}})).toEqual([
      'scenes.canChange',
    ]);
  });
});
