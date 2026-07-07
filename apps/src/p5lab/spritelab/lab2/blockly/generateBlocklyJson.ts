import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

/**
 * Convert an indentation-based pseudocode description into a Sprite Lab Blockly
 * workspace serialization. Modeled on Music Lab's generateBlocklyJson, but
 * targets Sprite Lab block types and the `next`-chain / statement-input shape.
 *
 * The AI prompt in generateContent.ts is constrained to this vocabulary:
 *
 *   when_run                          program-start hat (first, unindented line)
 *   repeat <n>                        controls_repeat_ext, body indented
 *   set_background <image>            gamelab_setBackgroundImageAs
 *   make_sprite <costume> <x> <y>     gamelab_makeNewSpriteAnon at a location
 *   make_grid <costume> <rows...>     gamelab_makeSpritesGrid; each row is a
 *                                     string of 0/1, top row first
 *   gravity <costume> <low|medium|high>      GameDev_gravity on those sprites
 *   set_type <costume> <player|environment>  GameDev_setGroup
 *   set_size <costume> <number>       gamelab_setProp "size"
 *   say <costume> <text...>           gamelab_spriteSay
 *
 * Indentation defines nesting; sibling statements chain via `next`. Commands
 * that target sprites do so via all-sprites-with-costume, matching the blocks
 * in the student toolbox.
 */

// Standard Blockly statement input name for controls_repeat_ext.
const REPEAT_BODY_INPUT = 'DO';

// GameDev_gravity's dropdown values by friendly strength name.
const GRAVITY_VALUES: {[name: string]: string} = {
  low: '-0.25',
  medium: '-0.5',
  high: '-1',
};

// GameDev_setGroup's dropdown values by friendly type name.
const GROUP_VALUES: {[name: string]: string} = {
  player: '"players"',
  environment: '"walls"',
};

interface ScopeFrame {
  // The block new statements at this scope attach to (the hat, or a container).
  container: JsonBlockConfig;
  // For container blocks (repeat), the statement input that holds the body.
  // null for the root hat, which chains its body via `next`.
  inputName: string | null;
  // The last block appended at this scope (for chaining via `next`).
  tail: JsonBlockConfig | null;
  // Indentation (space count) of the line that opened this scope.
  indentation: number;
}

export function generateBlocklyJson(
  pseudocode: string
): WorkspaceSerialization {
  let counter = 0;
  const nextId = () => `block-${counter++}`;

  // Costume/background dropdowns store the quoted name; strip any quotes the
  // model added and re-quote canonically.
  const costumeValue = (name: string) => `"${name.replace(/"/g, '')}"`;

  // Sprite-type value input: all sprites wearing the given costume.
  const spriteInput = (costume: string): {block: JsonBlockConfig} => ({
    block: {
      type: 'gamelab_allSpritesWithAnimation',
      id: nextId(),
      fields: {ANIMATION: costumeValue(costume)},
    },
  });

  const numberInput = (value: number): {block: JsonBlockConfig} => ({
    block: {type: 'math_number', id: nextId(), fields: {NUM: value}},
  });

  const lines = pseudocode
    .split('\n')
    .map(line => line.replace(/\s+$/, ''))
    .filter(line => line.trim() !== '');

  const root: JsonBlockConfig = {
    type: 'when_run',
    id: nextId(),
    x: 20,
    y: 20,
    deletable: false,
    movable: false,
  };

  // The root hat chains its body via `next`, so its tail starts as itself.
  const rootFrame: ScopeFrame = {
    container: root,
    inputName: null,
    tail: root,
    indentation: -1,
  };
  const scopeStack: ScopeFrame[] = [rootFrame];

  const attach = (frame: ScopeFrame, block: JsonBlockConfig) => {
    if (frame.tail) {
      frame.tail.next = {block};
    } else if (frame.inputName) {
      frame.container.inputs = frame.container.inputs || {};
      frame.container.inputs[frame.inputName] = {block};
    }
    frame.tail = block;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indentation = (line.match(/^\s*/)?.[0] || '').length;
    const trimmed = line.trim();
    const [command, ...rest] = trimmed.split(/\s+/);
    const args = rest.map(a => a.replace(/"/g, ''));

    if (command === 'when_run') {
      if (i !== 0 || indentation !== 0) {
        throw new Error(
          `'when_run' must be the first, unindented line (line ${i + 1}).`
        );
      }
      continue;
    }

    // Close any scopes that this line is no longer nested within.
    while (
      scopeStack.length > 1 &&
      indentation <= scopeStack[scopeStack.length - 1].indentation
    ) {
      scopeStack.pop();
    }
    const frame = scopeStack[scopeStack.length - 1];

    switch (command) {
      case 'repeat': {
        const times = parseInt(args[0], 10);
        if (isNaN(times)) {
          throw new Error(
            `'repeat' needs a number of times (line ${i + 1}): "${line}"`
          );
        }
        const block: JsonBlockConfig = {
          type: 'controls_repeat_ext',
          id: nextId(),
          inputs: {TIMES: numberInput(times)},
        };
        attach(frame, block);
        scopeStack.push({
          container: block,
          inputName: REPEAT_BODY_INPUT,
          tail: null,
          indentation,
        });
        break;
      }
      case 'set_background': {
        if (!args[0]) {
          throw new Error(
            `'set_background' needs an image name (line ${i + 1}): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_setBackgroundImageAs',
          id: nextId(),
          fields: {IMG: costumeValue(args[0])},
        });
        break;
      }
      case 'make_sprite': {
        const [costume, xArg, yArg] = args;
        const x = parseInt(xArg, 10);
        const y = parseInt(yArg, 10);
        if (!costume || isNaN(x) || isNaN(y)) {
          throw new Error(
            `'make_sprite' needs a costume, x, and y (line ${i + 1}): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_makeNewSpriteAnon',
          id: nextId(),
          fields: {ANIMATION_NAME: costumeValue(costume)},
          inputs: {
            LOCATION: {
              block: {
                type: 'gamelab_location_picker',
                id: nextId(),
                fields: {LOCATION: JSON.stringify({x, y})},
              },
            },
          },
        });
        break;
      }
      case 'make_grid': {
        const [costume, ...rows] = args;
        const grid = rows.map(row => [...row].map(c => (c === '1' ? 1 : 0)));
        if (!costume || grid.length === 0 || grid.some(r => r.length === 0)) {
          throw new Error(
            `'make_grid' needs a costume and rows of 0/1 (line ${
              i + 1
            }): "${line}"`
          );
        }
        // The bitmap field requires a rectangular grid; pad short rows.
        const width = Math.max(...grid.map(r => r.length));
        grid.forEach(r => {
          while (r.length < width) {
            r.push(0);
          }
        });
        attach(frame, {
          type: 'gamelab_makeSpritesGrid',
          id: nextId(),
          fields: {
            ANIMATION_NAME: costumeValue(costume),
            // CdoFieldBitmap accepts a plain 2D array at load time, but
            // JsonBlockConfig's field type doesn't admit arrays.
            GRID: grid as unknown as number,
          },
        });
        break;
      }
      case 'gravity': {
        const [costume, strength] = args;
        const velocity = GRAVITY_VALUES[(strength || '').toLowerCase()];
        if (!costume || !velocity) {
          throw new Error(
            `'gravity' needs a costume and low/medium/high (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'GameDev_gravity',
          id: nextId(),
          fields: {VELOCITY: velocity},
          inputs: {SPRITE: spriteInput(costume)},
        });
        break;
      }
      case 'set_type': {
        const [costume, kind] = args;
        const group = GROUP_VALUES[(kind || '').toLowerCase()];
        if (!costume || !group) {
          throw new Error(
            `'set_type' needs a costume and player/environment (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'GameDev_setGroup',
          id: nextId(),
          fields: {GROUP: group},
          inputs: {SPRITE: spriteInput(costume)},
        });
        break;
      }
      case 'set_size': {
        const [costume, sizeArg] = args;
        const size = parseInt(sizeArg, 10);
        if (!costume || isNaN(size)) {
          throw new Error(
            `'set_size' needs a costume and a number (line ${i + 1}): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_setProp',
          id: nextId(),
          // The block's "size" dropdown option stores the value "scale".
          fields: {PROPERTY: '"scale"'},
          inputs: {SPRITE: spriteInput(costume), VAL: numberInput(size)},
        });
        break;
      }
      case 'say': {
        const [costume, ...words] = args;
        if (!costume || words.length === 0) {
          throw new Error(
            `'say' needs a costume and some text (line ${i + 1}): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_spriteSay',
          id: nextId(),
          fields: {SPEECH: words.join(' ')},
          inputs: {SPRITE: spriteInput(costume)},
        });
        break;
      }
      default:
        // Unknown command: skip leniently rather than break the whole program.
        console.warn(
          `generateBlocklyJson: skipping unsupported command "${command}" (line ${
            i + 1
          })`
        );
        break;
    }
  }

  return {blocks: {blocks: [root]}};
}
