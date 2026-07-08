import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

/**
 * Convert an indentation-based pseudocode description into a Sprite Lab Blockly
 * workspace serialization. Modeled on Music Lab's generateBlocklyJson, but
 * targets Sprite Lab block types and the `next`-chain / statement-input shape.
 *
 * The AI prompt in generateContent.ts is constrained to this vocabulary.
 *
 * Event hats (unindented; each starts a new top-level block whose body is the
 * indented lines below it; when_run must come first):
 *
 *   when_run                          program-start hat
 *   when_key <key>                    gamelab_whenKey (fires once per press)
 *   while_key <key>                   gamelab_whileKey (fires while held; a
 *                                     loop-style hat — body goes in its DO
 *                                     statement input, it has no next)
 *   when_touching <a> <b>             gamelab_whenTouching
 *
 * Statements:
 *
 *   repeat <n>                        controls_repeat_ext, body indented
 *   set_background <image>            gamelab_setBackgroundImageAs
 *   make_sprite <costume> <x> <y>     gamelab_makeNewSpriteAnon at a location
 *   make_grid <costume> <rows...>     gamelab_makeSpritesGrid; each row is a
 *                                     string of 0/1, top row first
 *   gravity <costume> <low|medium|high>      GameDev_gravity on those sprites
 *   set_type <costume> <player|environment>  GameDev_setGroup
 *   set_size <costume> <number>       gamelab_setProp "size"
 *   say <costume> <text...>           gamelab_spriteSay
 *   move <costume> <pixels> <direction>      gamelab_moveInDirection
 *   jump <small|medium|big>           GameDev_playerJump
 *   behavior <costume> <name...>      gamelab_addBehaviorSimple + the named
 *                                     predefined behavior block
 *   go_to_scene <scene name...>       spritelab2_goToScene; needs the caller's
 *                                     sceneIdByName map (field stores the id)
 *
 * Indentation defines nesting; sibling statements chain via `next`. Commands
 * that target sprites do so via all-sprites-with-costume, matching the blocks
 * in the student toolbox.
 */

// Standard Blockly statement input name for controls_repeat_ext.
const REPEAT_BODY_INPUT = 'DO';

// Vertical spacing between top-level hat blocks in the workspace.
const HAT_SPACING = 160;

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

// gamelab_whenKey / gamelab_whileKey KEY dropdown options.
const KEY_NAMES = ['up', 'down', 'left', 'right', 'space', 'a', 'w', 's', 'd'];

// gamelab_moveInDirection DIRECTION values by friendly direction name.
const DIRECTION_VALUES: {[name: string]: string} = {
  up: '"North"',
  north: '"North"',
  down: '"South"',
  south: '"South"',
  left: '"West"',
  west: '"West"',
  right: '"East"',
  east: '"East"',
};

// GameDev_playerJump STRENGTH dropdown values by friendly strength name.
const JUMP_VALUES: {[name: string]: string} = {
  small: '10',
  medium: '13',
  big: '17',
};

// Predefined behavior block types by normalized friendly name (lowercased,
// letters only). Keep in sync with PREDEFINED_BEHAVIOR_BLOCKS in setup.ts.
const BEHAVIOR_BLOCK_TYPES: {[name: string]: string} = {
  draggable: 'gamelab_draggable',
  avoidingtargets: 'gamelab_avoidingTargets',
  followingtargets: 'gamelab_followingTargets',
  tumbling: 'gamelab_tumbling',
  patrollingupanddown: 'gamelab_patrollingUpDown',
  movingleft: 'spritelab2_movingLeft',
  movingwitharrowkeys: 'spritelab2_movingWithArrowKeys',
  patrollingleftandright: 'spritelab2_patrollingLeftRight',
};

export interface GenerateBlocklyJsonOptions {
  // Scene name (lowercased) -> scene id, for go_to_scene. The block's SCENE
  // field stores the id; the model only knows names.
  sceneIdByName?: {[lowerCaseName: string]: string};
  // The project's costume / background image names. When provided, every name
  // the pseudocode references is validated (case-insensitively, rewritten to
  // the canonical casing) and unknown names throw — a name the dropdown
  // can't validate would otherwise half-load as an "unknown block". Omit to
  // skip validation.
  costumeNames?: string[];
  backgroundNames?: string[];
}

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
  pseudocode: string,
  options: GenerateBlocklyJsonOptions = {}
): WorkspaceSerialization {
  let counter = 0;
  const nextId = () => `block-${counter++}`;

  // Updated each loop iteration so name-validation errors can cite the line.
  let currentLineNumber = 0;

  // lowercased name -> canonical casing, or null when validation is off.
  const canonicalNames = (names?: string[]) => {
    if (!names) {
      return null;
    }
    const map: {[lower: string]: string} = {};
    names.forEach(n => (map[n.toLowerCase()] = n));
    return map;
  };
  const knownCostumes = canonicalNames(options.costumeNames);
  const knownBackgrounds = canonicalNames(options.backgroundNames);

  // Dropdowns store the quoted name. Strip any quotes the model added, then
  // validate against the project's images (when provided): a name the
  // dropdown can't validate would half-load as an "unknown block".
  const imageValue = (
    raw: string,
    known: {[lower: string]: string} | null,
    kind: string
  ) => {
    const name = raw.replace(/"/g, '');
    if (known) {
      const match = known[name.toLowerCase()];
      if (!match) {
        throw new Error(
          `"${name}" isn't one of this project's ${kind}s (line ${currentLineNumber}). Add it in the Images tab or try rephrasing.`
        );
      }
      return `"${match}"`;
    }
    return `"${name}"`;
  };
  const costumeValue = (raw: string) => imageValue(raw, knownCostumes, 'image');
  const backgroundValue = (raw: string) =>
    imageValue(raw, knownBackgrounds, 'background');

  // Take a costume name off the front of a token list, matching the LONGEST
  // token-prefix against the project's costumes so multi-word names ("Hero
  // Cat") survive whitespace tokenization. Returns the quoted canonical name
  // and the remaining tokens. Without a known-name list, takes one token.
  const takeCostume = (tokens: string[]): [string, string[]] => {
    if (knownCostumes) {
      for (let n = Math.min(tokens.length, 6); n >= 1; n--) {
        const match = knownCostumes[tokens.slice(0, n).join(' ').toLowerCase()];
        if (match) {
          return [`"${match}"`, tokens.slice(n)];
        }
      }
      throw new Error(
        `"${
          tokens[0] || ''
        }" isn't one of this project's images (line ${currentLineNumber}). Add it in the Images tab or try rephrasing.`
      );
    }
    return [costumeValue(tokens[0] || ''), tokens.slice(1)];
  };

  // Sprite-type value input: all sprites wearing the given (quoted) costume.
  const spriteInput = (quotedCostume: string): {block: JsonBlockConfig} => ({
    block: {
      type: 'gamelab_allSpritesWithAnimation',
      id: nextId(),
      fields: {ANIMATION: quotedCostume},
    },
  });

  const numberInput = (value: number): {block: JsonBlockConfig} => ({
    block: {type: 'math_number', id: nextId(), fields: {NUM: value}},
  });

  // Models sometimes frame the pseudocode despite instructions — markdown
  // fences, or a prose preamble. Drop fence lines, then everything before
  // the first when_run.
  let lines = pseudocode
    .split('\n')
    .map(line => line.replace(/\s+$/, ''))
    .filter(line => line.trim() !== '' && !line.trim().startsWith('```'));
  const firstWhenRun = lines.findIndex(line => line.trim() === 'when_run');
  if (firstWhenRun === -1) {
    throw new Error(
      "The AI's answer didn't contain a program (no when_run). Try rephrasing."
    );
  }
  lines = lines.slice(firstWhenRun);

  const root: JsonBlockConfig = {
    type: 'when_run',
    id: nextId(),
    x: 20,
    y: 20,
    deletable: false,
    movable: false,
  };
  const roots: JsonBlockConfig[] = [root];

  // Event hats chain their body via `next`, so a hat's tail starts as itself.
  const scopeStack: ScopeFrame[] = [
    {container: root, inputName: null, tail: root, indentation: -1},
  ];

  // Start a new top-level hat: place it below the previous ones and make it
  // the sole scope, so subsequent indented lines form its body. Most hats
  // chain their body via `next`; loop-style hats (while_key) have no next
  // connection and take their body in a statement input instead.
  const startHat = (hat: JsonBlockConfig, bodyInputName: string | null) => {
    hat.x = 20;
    hat.y = 20 + roots.length * HAT_SPACING;
    roots.push(hat);
    scopeStack.length = 0;
    scopeStack.push({
      container: hat,
      inputName: bodyInputName,
      tail: bodyInputName ? null : hat,
      indentation: -1,
    });
  };

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
    currentLineNumber = i + 1;
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

    if (command === 'when_key' || command === 'while_key') {
      if (indentation !== 0) {
        throw new Error(
          `'${command}' must be unindented — it starts a new event (line ${
            i + 1
          }).`
        );
      }
      const key = (args[0] || '').toLowerCase();
      if (!KEY_NAMES.includes(key)) {
        throw new Error(
          `'${command}' needs one of ${KEY_NAMES.join('/')} (line ${
            i + 1
          }): "${line}"`
        );
      }
      startHat(
        {
          type: command === 'when_key' ? 'gamelab_whenKey' : 'gamelab_whileKey',
          id: nextId(),
          fields: {KEY: `"${key}"`},
        },
        // gamelab_whileKey is a loop-style hat: no next connection, body in DO.
        command === 'while_key' ? 'DO' : null
      );
      continue;
    }

    if (command === 'when_touching') {
      if (indentation !== 0) {
        throw new Error(
          `'when_touching' must be unindented — it starts a new event (line ${
            i + 1
          }).`
        );
      }
      if (args.length < 2) {
        throw new Error(
          `'when_touching' needs two costumes (line ${i + 1}): "${line}"`
        );
      }
      const [costumeA, afterA] = takeCostume(args);
      const [costumeB] = takeCostume(afterA);
      startHat(
        {
          type: 'gamelab_whenTouching',
          id: nextId(),
          inputs: {
            SPRITE1: spriteInput(costumeA),
            SPRITE2: spriteInput(costumeB),
          },
        },
        null
      );
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
        // The image name is the whole rest of the line (names can have spaces).
        attach(frame, {
          type: 'gamelab_setBackgroundImageAs',
          id: nextId(),
          fields: {IMG: backgroundValue(args.join(' '))},
        });
        break;
      }
      case 'make_sprite': {
        if (args.length < 3) {
          throw new Error(
            `'make_sprite' needs a costume, x, and y (line ${i + 1}): "${line}"`
          );
        }
        const [costume, restArgs] = takeCostume(args);
        const x = parseInt(restArgs[0], 10);
        const y = parseInt(restArgs[1], 10);
        if (isNaN(x) || isNaN(y)) {
          throw new Error(
            `'make_sprite' needs a costume, x, and y (line ${i + 1}): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_makeNewSpriteAnon',
          id: nextId(),
          fields: {ANIMATION_NAME: costume},
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
        if (args.length < 2) {
          throw new Error(
            `'make_grid' needs a costume and rows of 0/1 (line ${
              i + 1
            }): "${line}"`
          );
        }
        const [costume, rows] = takeCostume(args);
        const grid = rows
          .filter(row => /^[01]+$/.test(row))
          .map(row => [...row].map(c => (c === '1' ? 1 : 0)));
        if (grid.length === 0) {
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
            ANIMATION_NAME: costume,
            // The bitmap field has no loadState, so field state round-trips
            // through the XML hooks: a plain array would hit DOMParser and
            // load as an "unknown block". This matches what workspaces.save
            // emits for a real grid block.
            GRID: `<field name="GRID">${JSON.stringify(grid)}</field>`,
          },
        });
        break;
      }
      case 'gravity': {
        const [costume, restArgs] = takeCostume(args);
        const velocity = GRAVITY_VALUES[(restArgs[0] || '').toLowerCase()];
        if (!velocity) {
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
        const [costume, restArgs] = takeCostume(args);
        const group = GROUP_VALUES[(restArgs[0] || '').toLowerCase()];
        if (!group) {
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
        const [costume, restArgs] = takeCostume(args);
        const size = parseInt(restArgs[0], 10);
        if (isNaN(size)) {
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
        if (args.length < 2) {
          throw new Error(
            `'say' needs a costume and some text (line ${i + 1}): "${line}"`
          );
        }
        const [costume, words] = takeCostume(args);
        if (words.length === 0) {
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
      case 'move': {
        const [costume, restArgs] = takeCostume(args);
        const pixels = parseInt(restArgs[0], 10);
        const direction = DIRECTION_VALUES[(restArgs[1] || '').toLowerCase()];
        if (isNaN(pixels) || !direction) {
          throw new Error(
            `'move' needs a costume, pixels, and a direction (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_moveInDirection',
          id: nextId(),
          fields: {DIRECTION: direction},
          inputs: {SPRITE: spriteInput(costume), DISTANCE: numberInput(pixels)},
        });
        break;
      }
      case 'jump': {
        const strength = JUMP_VALUES[(args[0] || '').toLowerCase()];
        if (!strength) {
          throw new Error(
            `'jump' needs small/medium/big (line ${i + 1}): "${line}"`
          );
        }
        attach(frame, {
          type: 'GameDev_playerJump',
          id: nextId(),
          fields: {STRENGTH: strength},
        });
        break;
      }
      case 'behavior': {
        if (args.length < 2) {
          throw new Error(
            `'behavior' needs a costume and a known behavior name (line ${
              i + 1
            }): "${line}"`
          );
        }
        const [costume, nameWords] = takeCostume(args);
        // Behavior names are matched letters-only, so "moving left",
        // "moving-left", and "movingLeft" all resolve.
        const normalized = nameWords
          .join('')
          .toLowerCase()
          .replace(/[^a-z]/g, '');
        const behaviorType = BEHAVIOR_BLOCK_TYPES[normalized];
        if (!behaviorType) {
          throw new Error(
            `'behavior' needs a costume and a known behavior name (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_addBehaviorSimple',
          id: nextId(),
          inputs: {
            SPRITE: spriteInput(costume),
            BEHAVIOR: {block: {type: behaviorType, id: nextId()}},
          },
        });
        break;
      }
      case 'go_to_scene': {
        const sceneName = args.join(' ');
        const sceneId = options.sceneIdByName?.[sceneName.toLowerCase()];
        if (!sceneId) {
          throw new Error(
            `'go_to_scene' names an unknown scene "${sceneName}" (line ${
              i + 1
            }).`
          );
        }
        attach(frame, {
          type: 'spritelab2_goToScene',
          id: nextId(),
          fields: {SCENE: sceneId},
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

  // A bare when_run (every line skipped or missing) would silently load as
  // an empty program; surface it instead.
  if (roots.length === 1 && !root.next) {
    throw new Error(
      "The AI didn't produce any usable commands. Try rephrasing your request."
    );
  }

  return {blocks: {blocks: roots}};
}
