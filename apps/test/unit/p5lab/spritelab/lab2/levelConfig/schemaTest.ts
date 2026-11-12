import {parseLevelConfig} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

describe('parseLevelConfig', () => {
  it('accepts an empty config, and no config at all', () => {
    expect(parseLevelConfig({})).toEqual({config: {}, problems: []});
    expect(parseLevelConfig(undefined)).toEqual({config: {}, problems: []});
  });

  it('accepts both groups filled in', () => {
    const config = {
      images: {
        makes: {type: 'sprite', subject: 'object', role: 'treasure'},
        onlyThisImage: true,
        explainAi: true,
        source: 'cached',
      },
      world: {
        paletteRoles: ['treasure', 'block'],
        startPattern: ['.S........', 'BBBBBBBBBB'],
        startRoles: {F: 'friend'},
      },
    };
    expect(parseLevelConfig(config)).toEqual({config, problems: []});
  });

  it('says where a wrong value is', () => {
    const {config, problems} = parseLevelConfig({
      images: {makes: {type: 'cartoon'}},
    });
    expect(config).toBeUndefined();
    expect(problems.map(problem => problem.path)).toEqual([
      'images.makes.type',
    ]);
  });

  it('reports an option it does not know, such as a misspelling', () => {
    const {problems} = parseLevelConfig({world: {paletteRole: ['treasure']}});
    expect(problems).toEqual([
      {path: 'world', message: 'Unrecognized key: "paletteRole"'},
    ]);
  });

  it('allows a subject only on a sprite', () => {
    const {problems} = parseLevelConfig({
      images: {makes: {type: 'background', subject: 'object'}},
    });
    expect(problems).toEqual([
      {path: 'images.makes.subject', message: 'Only a sprite has a subject.'},
    ]);
  });

  it('wants a single letter for each start pattern role', () => {
    const {problems} = parseLevelConfig({
      world: {startRoles: {Friend: 'friend'}},
    });
    expect(problems.map(problem => problem.path)).toEqual([
      'world.startRoles.Friend',
    ]);
  });
});
