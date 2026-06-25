import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

/**
 * Convert an indentation-based pseudocode description into a Sprite Lab Blockly
 * workspace serialization. Modeled on Music Lab's generateBlocklyJson, but
 * targets Sprite Lab block types and the `next`-chain / statement-input shape.
 *
 * Supported vocabulary (intentionally minimal to start; extend COMMANDS as more
 * Sprite Lab block types are mapped). The AI prompt in generateContent.ts is
 * constrained to this vocabulary.
 *
 *   when_run            -> the program-start hat (must be the first, unindented line)
 *   repeat <n>          -> controls_repeat_ext, looping its indented body <n> times
 *
 * Indentation defines nesting; sibling statements chain via `next`.
 */

// Standard Blockly statement input name for controls_repeat_ext.
const REPEAT_BODY_INPUT = 'DO';

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
    const arg = rest.join(' ').replace(/"/g, '');

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
        const times = parseInt(arg, 10);
        if (isNaN(times)) {
          throw new Error(
            `'repeat' needs a number of times (line ${i + 1}): "${line}"`
          );
        }
        const block: JsonBlockConfig = {
          type: 'controls_repeat_ext',
          id: nextId(),
          inputs: {
            TIMES: {
              block: {
                type: 'math_number',
                id: nextId(),
                fields: {NUM: times},
              },
            },
          },
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
      default:
        // Unknown command: skip leniently rather than break the whole program.
        // Extend COMMANDS / this switch as more Sprite Lab blocks are mapped.

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
