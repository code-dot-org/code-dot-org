import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {WHEN_RUN_BLOCK_TYPE} from './blockDefinitions/whenRun';

/**
 * Convert indentation-based pseudocode into a Sprite Lab workspace
 * serialization. The grammar is defined by the AI prompt in generateContent.ts;
 * keep the two in sync. Modeled on Music Lab's generateBlocklyJson.
 * Non-obvious shapes: sibling statements chain via `next`; while_key is a
 * loop-style hat (body in its DO input, no next); sprite-targeting commands go
 * through all-sprites-with-costume.
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

// Command allowlists mirroring the Platform and Story toolbox categories
// (setup.ts INJECTED_CATEGORIES) — keep in sync as the lineups evolve. A
// "profile: platform|story" first line restricts emission to that profile;
// without one the full legacy vocabulary applies.
export type CodegenProfile = 'platform' | 'story';
const PROFILE_COMMANDS: Record<CodegenProfile, Set<string>> = {
  platform: new Set([
    'when_run',
    'when_click',
    'when_touching',
    'at_time',
    'set_background',
    'platform_player',
    'platform_blocks',
    'say',
    'go_to_scene',
  ]),
  story: new Set([
    'when_run',
    'when_click',
    'at_time',
    'set_background',
    'make_sprite',
    'set_size',
    'say',
    'say_for',
    'behavior',
    'go_to_scene',
  ]),
};
// The Story category offers exactly these behaviors (letters-only keys, like
// BEHAVIOR_BLOCK_TYPES).
const STORY_BEHAVIORS = new Set(['movingleft', 'patrollingleftandright']);

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
  // Platform-tile image names ('blocks' category), for platform_blocks.
  blockNames?: string[];
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
  const knownBlocks = canonicalNames(options.blockNames);

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
  const backgroundValue = (raw: string) =>
    imageValue(raw, knownBackgrounds, 'background');

  // Take an image name off the front of a token list, matching the LONGEST
  // token-prefix against the given known names so multi-word names ("Hero
  // Cat") survive whitespace tokenization. Returns the quoted canonical name
  // and the remaining tokens. Without a known-name list, takes one token.
  const takeName = (
    tokens: string[],
    known: {[lower: string]: string} | null,
    kind: string
  ): [string, string[]] => {
    if (known) {
      for (let n = Math.min(tokens.length, 6); n >= 1; n--) {
        const match = known[tokens.slice(0, n).join(' ').toLowerCase()];
        if (match) {
          return [`"${match}"`, tokens.slice(n)];
        }
      }
      throw new Error(
        `"${
          tokens[0] || ''
        }" isn't one of this project's ${kind}s (line ${currentLineNumber}). Add it in the Images tab or try rephrasing.`
      );
    }
    return [`"${(tokens[0] || '').replace(/"/g, '')}"`, tokens.slice(1)];
  };
  const takeCostume = (tokens: string[]): [string, string[]] =>
    takeName(tokens, knownCostumes, 'image');
  const takeBlockImage = (tokens: string[]): [string, string[]] =>
    takeName(tokens, knownBlocks, 'block image');

  // Rows of 0/1 digits -> rectangular grid for the bitmap field (short rows
  // padded), or null when no valid rows are present.
  const parseGridRows = (rows: string[]): (0 | 1)[][] | null => {
    const grid = rows
      .filter(row => /^[01]+$/.test(row))
      .map(row => [...row].map(c => (c === '1' ? 1 : 0) as 0 | 1));
    if (grid.length === 0) {
      return null;
    }
    const width = Math.max(...grid.map(r => r.length));
    grid.forEach(r => {
      while (r.length < width) {
        r.push(0);
      }
    });
    return grid;
  };
  // See make_grid: the bitmap field has no loadState, so field state
  // round-trips through the XML hooks.
  const gridFieldValue = (grid: (0 | 1)[][]): string =>
    `<field name="GRID">${JSON.stringify(grid)}</field>`;

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
  // A "profile: platform|story" line ahead of the program restricts the
  // vocabulary to that profile (see PROFILE_COMMANDS).
  let profile: CodegenProfile | null = null;
  for (const line of lines.slice(0, firstWhenRun)) {
    const match = line.trim().match(/^profile:\s*(platform|story)$/i);
    if (match) {
      profile = match[1].toLowerCase() as CodegenProfile;
    }
  }
  lines = lines.slice(firstWhenRun);

  const root: JsonBlockConfig = {
    type: WHEN_RUN_BLOCK_TYPE,
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

    // Out-of-profile commands are skipped like unknown ones, so the emitted
    // workspace only ever holds the chosen category's blocks.
    if (profile && !PROFILE_COMMANDS[profile].has(command)) {
      console.warn(
        `generateBlocklyJson: skipping "${command}" — not in the ${profile} profile (line ${
          i + 1
        })`
      );
      continue;
    }

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

    if (command === 'when_click') {
      if (indentation !== 0) {
        throw new Error(
          `'when_click' must be unindented — it starts a new event (line ${
            i + 1
          }).`
        );
      }
      const [costume] = takeCostume(args);
      startHat(
        {
          type: 'gamelab_spriteClicked',
          id: nextId(),
          fields: {CONDITION: '"when"'},
          inputs: {SPRITE: spriteInput(costume)},
        },
        null
      );
      continue;
    }

    if (command === 'at_time') {
      if (indentation !== 0) {
        throw new Error(
          `'at_time' must be unindented — it starts a new event (line ${
            i + 1
          }).`
        );
      }
      const n = parseInt(args[0], 10);
      const unit = (args[1] || 'seconds').toLowerCase();
      if (isNaN(n) || !['seconds', 'frames'].includes(unit)) {
        throw new Error(
          `'at_time' needs a number and seconds/frames (line ${
            i + 1
          }): "${line}"`
        );
      }
      startHat(
        {
          type: 'gamelab_atTime',
          id: nextId(),
          fields: {UNIT: `"${unit}"`},
          inputs: {N: numberInput(n)},
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
        const grid = parseGridRows(rows);
        if (!grid) {
          throw new Error(
            `'make_grid' needs a costume and rows of 0/1 (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_makeSpritesGrid',
          id: nextId(),
          fields: {ANIMATION_NAME: costume, GRID: gridFieldValue(grid)},
        });
        break;
      }
      case 'platform_player': {
        const [costume, rows] = takeCostume(args);
        const grid = parseGridRows(rows);
        if (!grid) {
          throw new Error(
            `'platform_player' needs a costume and rows of 0/1 (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'spritelab2_makePlatformPlayer',
          id: nextId(),
          fields: {ANIMATION_NAME: costume, GRID: gridFieldValue(grid)},
        });
        break;
      }
      case 'platform_blocks': {
        const [blockImage, rows] = takeBlockImage(args);
        const grid = parseGridRows(rows);
        if (!grid) {
          throw new Error(
            `'platform_blocks' needs a block image and rows of 0/1 (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'spritelab2_makePlatformBlocks',
          id: nextId(),
          fields: {ANIMATION_NAME: blockImage, GRID: gridFieldValue(grid)},
        });
        break;
      }
      case 'say_for': {
        const [costume, restArgs] = takeCostume(args);
        const seconds = parseInt(restArgs[0], 10);
        const words = restArgs.slice(1);
        if (isNaN(seconds) || words.length === 0) {
          throw new Error(
            `'say_for' needs a costume, seconds, and some text (line ${
              i + 1
            }): "${line}"`
          );
        }
        attach(frame, {
          type: 'gamelab_spriteSayTime',
          id: nextId(),
          inputs: {
            SPRITE: spriteInput(costume),
            TEXT1: {
              block: {
                type: 'text',
                id: nextId(),
                fields: {TEXT: words.join(' ')},
              },
            },
            NUM: numberInput(seconds),
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
        if (profile === 'story' && !STORY_BEHAVIORS.has(normalized)) {
          console.warn(
            `generateBlocklyJson: skipping behavior "${normalized}" — not in the story profile (line ${
              i + 1
            })`
          );
          break;
        }
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
