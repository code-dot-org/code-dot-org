import localization from '@cdo/apps/localization';
import {localizeLevelText} from '@cdo/apps/p5lab/spritelab/lab2/blockly/localizeLevelText';

const SPANISH: {[source: string]: string} = {
  "What's next?": '¿Y ahora qué?',
  'We did it!': '¡Lo logramos!',
  'Welcome to Scene 2': 'Bienvenidos a la escena 2',
  'You win!': '¡Ganaste!',
  'Game over': 'Fin del juego',
};

let locale = 'es-MX';
let translate: jest.SpyInstance;

beforeEach(() => {
  locale = 'es-MX';
  jest.spyOn(localization, 'locale', 'get').mockImplementation(() => locale);
  translate = jest
    .spyOn(localization, 'translate')
    .mockImplementation(
      (text: unknown) => (SPANISH[text as string] ?? text) as never
    );
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Start sources as Sprite Lab 2 saves them: scenes of serialized blocks.
const START_SOURCES = {
  scenes: [
    {
      id: 'scene-1',
      name: 'Scene 1',
      source: {
        blocks: {
          blocks: [
            {
              type: 'when_run',
              id: 'run',
              next: {
                block: {
                  type: 'gamelab_spriteSay',
                  data: 'friend-says',
                  fields: {SPEECH: "What's next?"},
                  next: {
                    block: {
                      type: 'spritelab2_showTitle',
                      fields: {TEXT: 'You win!'},
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
  ],
};

describe('localizeLevelText', () => {
  it('translates the words a sprite says and a title shows', () => {
    const localized = localizeLevelText(START_SOURCES);
    const say = localized.scenes[0].source.blocks.blocks[0].next.block;
    expect(say.fields.SPEECH).toBe('¿Y ahora qué?');
    expect(say.next.block.fields.TEXT).toBe('¡Ganaste!');
  });

  it('keeps block types, tags, ids and scene names', () => {
    const localized = localizeLevelText(START_SOURCES);
    const scene = localized.scenes[0];
    expect(scene.name).toBe('Scene 1');
    expect(scene.source.blocks.blocks[0].id).toBe('run');
    expect(scene.source.blocks.blocks[0].next.block.data).toBe('friend-says');
  });

  it('leaves the data it was given unchanged', () => {
    localizeLevelText(START_SOURCES);
    expect(
      START_SOURCES.scenes[0].source.blocks.blocks[0].next.block.fields.SPEECH
    ).toBe("What's next?");
  });

  it('translates toolbox blocks', () => {
    const toolbox = {
      kind: 'flyoutToolbox',
      contents: [
        {
          kind: 'block',
          type: 'gamelab_spriteSay',
          fields: {SPEECH: 'We did it!'},
        },
        {
          kind: 'block',
          type: 'spritelab2_showTitle',
          fields: {TEXT: 'Welcome to Scene 2'},
        },
      ],
    };
    const localized = localizeLevelText(toolbox);
    expect(
      localized.contents.map(item => Object.values(item.fields)[0])
    ).toEqual(['¡Lo logramos!', 'Bienvenidos a la escena 2']);
  });

  it('translates a text block plugged into a block whose words are shown', () => {
    const print = {
      type: 'gamelab_printText',
      inputs: {
        TEXT: {block: {type: 'text', fields: {TEXT: 'Game over'}}},
      },
    };
    expect(localizeLevelText(print).inputs.TEXT.block.fields.TEXT).toBe(
      'Fin del juego'
    );
  });

  it('leaves other fields and other blocks alone', () => {
    const blocks = [
      {type: 'spritelab2_playSoundEffect', fields: {PATTERN: 'You win!'}},
      {type: 'text', fields: {TEXT: 'You win!'}},
    ];
    expect(localizeLevelText(blocks)).toEqual(blocks);
  });

  it('returns the data itself in English', () => {
    locale = 'en-US';
    expect(localizeLevelText(START_SOURCES)).toBe(START_SOURCES);
    expect(translate).not.toHaveBeenCalled();
  });
});
