import {LevelProperties, MultiFileSource} from '@cdo/apps/lab2/types';
import getInitialSources, {
  asProjectSources,
  getStartOverSources,
} from '@cdo/apps/lab2/utils/getInitialSources';

const bare: MultiFileSource = {
  folders: {},
  files: {'1': {id: '1', name: 'index.html', contents: '', folderId: '0'}},
};
const wrapped = {source: bare};
const level = (overrides: Partial<LevelProperties> = {}): LevelProperties => ({
  id: 1,
  name: 'level',
  appName: 'weblab2',
  ...overrides,
});

describe('asProjectSources', () => {
  it('wraps a bare source and passes ProjectSources through', () => {
    expect(asProjectSources(bare)).toEqual(wrapped);
    expect(asProjectSources(wrapped)).toBe(wrapped);
    expect(asProjectSources(undefined)).toBeUndefined();
  });
});

describe('getInitialSources', () => {
  it('prefers project sources, then template, then start, all wrapped', () => {
    const project = {source: {...bare, openFiles: ['1']}};
    expect(getInitialSources(level({startSources: bare}), project)).toBe(
      project
    );
    expect(
      getInitialSources(level({templateSources: bare, startSources: wrapped}))
    ).toEqual(wrapped);
    expect(getInitialSources(level({startSources: bare}))).toEqual(wrapped);
    expect(getInitialSources(level())).toBeUndefined();
  });
});

describe('getStartOverSources', () => {
  const defaults = {source: 'default'};

  it('resets to the template, then start sources, wrapped', () => {
    expect(
      getStartOverSources(level({templateSources: bare}), defaults)
    ).toEqual(wrapped);
    expect(getStartOverSources(level({startSources: bare}), defaults)).toEqual(
      wrapped
    );
  });

  it('falls back to the defaults when the level has none', () => {
    expect(getStartOverSources(level(), defaults)).toBe(defaults);
  });
});
