import localization from '@cdo/apps/localization';
import {
  createLocaleChangeHandler,
  RELOCALIZE_RETRY_MS,
  relocalizeWorkspace,
  shownToolbox,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/localizeBlocks';

const calls: string[] = [];

jest.mock('@cdo/apps/block_utils', () => ({
  installCustomBlocks: () => calls.push('install shared blocks'),
}));
jest.mock('@cdo/apps/blockly/utils', () => ({
  getBlockDefinitionsForUpdatedLocale: () => [],
  localizeInitBlocks: () => calls.push('wrap init blocks'),
}));
jest.mock('@cdo/apps/blockly/utils/workspace/refresh', () => ({
  refreshWorkspace: () => calls.push('reload'),
}));

const SPANISH: {[source: string]: string} = {
  Sprites: 'Objetos',
  World: 'Mundo',
};

const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Sprites',
      contents: [{kind: 'block', type: 'spritelab2_makeSpriteAtPosition'}],
    },
    {kind: 'category', name: 'World', contents: []},
  ],
};

let locale = 'es-MX';

beforeEach(() => {
  calls.length = 0;
  locale = 'es-MX';
  (global as unknown as {Blockly: unknown}).Blockly = {
    SourceCustomInputTypes: {},
  };
  jest.spyOn(localization, 'locale', 'get').mockImplementation(() => locale);
  jest
    .spyOn(localization, 'translate')
    .mockImplementation(
      (text: unknown) => (SPANISH[text as string] ?? text) as never
    );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('shownToolbox', () => {
  it('translates category names in a copy', () => {
    const shown = shownToolbox(TOOLBOX) as typeof TOOLBOX;
    expect(shown.contents.map(c => c.name)).toEqual(['Objetos', 'Mundo']);
    expect(shown.contents[0].contents).toEqual(TOOLBOX.contents[0].contents);
    expect(TOOLBOX.contents[0].name).toBe('Sprites');
  });

  it('returns the toolbox itself in English', () => {
    locale = 'en-US';
    expect(shownToolbox(TOOLBOX)).toBe(TOOLBOX);
  });
});

describe('relocalizeWorkspace', () => {
  const workspace = (rendered = true) => ({
    rendered,
    updateToolbox: (toolbox: typeof TOOLBOX) =>
      calls.push(`toolbox ${toolbox.contents.map(c => c.name).join(', ')}`),
  });

  it('counts the reload as a load before reloading', () => {
    relocalizeWorkspace(workspace() as never, TOOLBOX, () =>
      calls.push('count load')
    );
    expect(calls).toEqual([
      'install shared blocks',
      'wrap init blocks',
      'toolbox Objetos, Mundo',
      'count load',
      'reload',
    ]);
  });

  it('leaves the toolbox alone on a workspace without one', () => {
    relocalizeWorkspace(workspace() as never, undefined, () =>
      calls.push('count load')
    );
    expect(calls).not.toContainEqual(expect.stringMatching(/^toolbox/));
  });
});

describe('createLocaleChangeHandler', () => {
  let dragging = false;
  const workspace = {
    rendered: true,
    isDragging: () => dragging,
    updateToolbox: () => calls.push('toolbox'),
  };
  const handler = () =>
    createLocaleChangeHandler({
      getWorkspace: () => workspace as never,
      getToolbox: () => TOOLBOX,
      beforeReload: () => calls.push('count load'),
    });
  const reloads = () => calls.filter(c => c === 'reload').length;

  beforeEach(() => {
    jest.useFakeTimers();
    dragging = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('redraws for a new language', () => {
    handler().handle();
    expect(reloads()).toBe(1);
  });

  it('waits for a drag to end before redrawing', () => {
    const {handle} = handler();
    dragging = true;
    handle();
    jest.advanceTimersByTime(RELOCALIZE_RETRY_MS * 3);
    expect(reloads()).toBe(0);
    dragging = false;
    jest.advanceTimersByTime(RELOCALIZE_RETRY_MS);
    expect(reloads()).toBe(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('keeps one pending redraw across repeated changes', () => {
    const {handle} = handler();
    dragging = true;
    handle();
    handle();
    expect(jest.getTimerCount()).toBe(1);
  });

  it('drops a pending redraw when disposed', () => {
    const {handle, dispose} = handler();
    dragging = true;
    handle();
    dispose();
    dragging = false;
    jest.advanceTimersByTime(RELOCALIZE_RETRY_MS);
    expect(reloads()).toBe(0);
  });

  it('does not redraw when English stays English', () => {
    locale = 'en-US';
    handler().handle();
    expect(reloads()).toBe(0);
  });

  it('redraws when switching back to English', () => {
    const {handle} = handler();
    locale = 'en-US';
    handle();
    expect(reloads()).toBe(1);
  });
});
