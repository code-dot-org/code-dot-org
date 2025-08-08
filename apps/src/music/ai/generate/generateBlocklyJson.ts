// NOTE: This is AI-generated code.  Search for HAND_CHANGE for any changes made by hand after that.

/*
  Generate prompt:

  Your job will be to generate a TypeScript function that generates Blockly JSON, as a string, from psuedocode which describes how to play a song.  Never use the "any" type, and double-check your work to make sure that there are no errors.

The psuedocode looks something like this:

when_run
  play "hiphop/drum_beat_808"
  play "electro/drum_beat_hyper"
  play_together
    play "hiphop/drum_beat_808"
    play "electro/drum_beat_hyper"
  repeat 3
    play "hiphop/drum_beat_808"
    play "electro/drum_beat_hyper"

Indenting is important.  In this example, when the code is run, it plays "hiphop/drum_beat_808" and then "electro/drum_beat_hyper".  Then it plays "electro_beat_808" and "electro/drum_beat_hyper" at the same time.  Then it plays the same thing three times: "hiphop/drum_beat_808" followed by "electro/drum_beat_hyper".

And Here is some example Blockly code for our system.  In this case, we are generating a song.  It repeats the output 3 times, the output being a drum beat cowbell and a guitar code which play together:

  {"blocks":{"languageVersion":0,"blocks":[{"type":"when_run_simple2","id":"when-run-block","x":30,"y":30,"deletable":false,"movable":false,"next":{"block":{"type":"repeat_simple2","id":"repeat_simple2","extraState":{"disableNextConnection":false},"fields":{"times":3},"inputs":{"code":{"block":{"type":"play_sounds_together","id":"play_sounds_together","extraState":{"disableNextConnection":false},"inputs":{"code":{"block":{"type":"play_sound_at_current_location_simple2","id":"play_sound_at_current_location_simple2","extraState":{"disableNextConnection":false},"fields":{"sound":"electro/drum_beat_cowbell"},"next":{"block":{"type":"play_sound_at_current_location_simple2","id":"!;-!82$m2/}%!h8$ua","extraState":{"disableNextConnection":false},"fields":{"sound":"electro/drum_beat_cowbell"}}}}}}}}}}}}]}}
 */

/*
  AI response:

  To achieve this, we'll create a TypeScript function that parses the pseudocode line by line, keeping
   track of indentation levels to correctly determine the nesting of Blockly blocks. We'll define the
   necessary TypeScript interfaces to ensure type safety throughout the generation of the Blockly JSON
   structure.
 */

// Define interfaces for Blockly JSON structure to ensure type safety
interface BlocklyField {
  [key: string]: string | number;
}

interface BlocklyInputBlock {
  block: BlocklyBlock;
}

interface BlocklyInputs {
  code?: BlocklyInputBlock; // Used by 'repeat' and 'play_sounds_together'
  // Add other input types here if they are encountered in future Blockly structures
}

interface BlocklyExtraState {
  disableNextConnection: boolean;
  // Add other properties like 'collapsed' if needed
}

interface BlocklyBlock {
  type: string;
  id: string;
  x?: number; // Only for top-level blocks like 'when_run_simple2'
  y?: number; // Only for top-level blocks like 'when_run_simple2'
  deletable?: boolean; // Only for top-level blocks
  movable?: boolean; // Only for top-level blocks
  extraState?: BlocklyExtraState; // Common for most executable blocks
  fields?: BlocklyField; // For blocks with configurable values like 'sound' or 'times'
  inputs?: BlocklyInputs; // For blocks that contain other blocks (e.g., 'code' input)
  next?: BlocklyInputBlock; // For sequential blocks
}

interface BlocklyBlocksContainer {
  languageVersion: number;
  blocks: BlocklyBlock[];
}

interface BlocklyWorkspace {
  blocks: BlocklyBlocksContainer;
}

/**
 * Generates Blockly JSON as a string from a pseudocode description of a song.
 *
 * This function parses pseudocode commands like 'when_run', 'play', 'play_together',
 * and 'repeat', respecting indentation for nesting.
 *
 * @param pseudocode The pseudocode string describing the song.
 * @returns A JSON string representing the Blockly workspace.
 * @throws Error if the pseudocode contains unknown commands, invalid arguments,
 *         or incorrect indentation that violates the defined structure.
 */
export function generateBlocklyJson(pseudocode: string): string {
  let blockIdCounter = 0;
  // Helper function to generate unique IDs for Blockly blocks
  const generateBlockId = (): string => `block-${blockIdCounter++}`;

  // Split pseudocode into lines, trim trailing whitespace, and filter out empty lines
  const lines = pseudocode.split('\n').map(line => line.trimEnd());
  const meaningfulLines = lines.filter(line => line.trim() !== '');

  // Initialize the root 'when_run_simple2' block
  const rootBlock: BlocklyBlock = {
    type: 'when_run_simple2',
    id: generateBlockId(),
    x: 30, // Standard starting X position
    y: 30, // Standard starting Y position
    deletable: false, // Prevents deletion of the root block
    movable: false, // Prevents moving the root block
    // 'when_run_simple2' typically doesn't have extraState based on the example
  };

  // `activeBlockChainEnd` points to the last block in the *current active 'next' sequence*.
  // If `scopeStack` is empty, it's the last block directly connected to `when_run` (or `when_run` itself).
  // If `scopeStack` is not empty, it's the last block connected within the `inputs.code` of the current scope parent.
  let activeBlockChainEnd: BlocklyBlock = rootBlock;

  // `scopeStack` stores blocks that are currently "open" for having child blocks added to their `inputs.code`.
  // Each entry includes the parent block and its indentation level.
  const scopeStack: {block: BlocklyBlock; indentation: number}[] = [];

  // HAND_CHANGE: Commented out manually.
  // let previousIndentation: number = 0; // Tracks the indentation of the previous processed line

  for (let i = 0; i < meaningfulLines.length; i++) {
    const line = meaningfulLines[i];
    const currentIndentation = (line.match(/^\s*/)?.[0] || '').length;
    const trimmedLine = line.trim();
    const commandParts = trimmedLine.split(' ');
    const command = commandParts[0];
    // Joins remaining parts as argument and removes quotes
    const arg = commandParts.slice(1).join(' ').replace(/"/g, '');

    let newBlock: BlocklyBlock | undefined;
    let isNewScopeParent: boolean = false; // True if the new block can contain other blocks (e.g., repeat, play_together)

    // Determine the type of the new Blockly block based on the pseudocode command
    switch (command) {
      case 'when_run':
        // 'when_run' is the root block, already initialized.
        // If found at any other position or indentation, it's an error.
        if (i !== 0 || currentIndentation !== 0) {
          throw new Error(
            `'when_run' command found at unexpected position or indentation (line ${
              i + 1
            }). It should be the first, unindented line.`
          );
        }
        continue; // Skip further processing for the 'when_run' line

      case 'play':
        if (!arg) {
          throw new Error(
            `Missing sound argument for 'play' command at line ${
              i + 1
            }: "${line}"`
          );
        }
        newBlock = {
          type: 'play_sound_at_current_location_simple2',
          id: generateBlockId(),
          extraState: {disableNextConnection: false},
          fields: {sound: arg},
        };
        break;

      case 'play_together':
        newBlock = {
          type: 'play_sounds_together',
          id: generateBlockId(),
          extraState: {disableNextConnection: false},
          inputs: {code: undefined}, // 'code' input will be populated by child blocks
        };
        isNewScopeParent = true;
        break;

      case 'repeat': {
        const times = parseInt(arg, 10);
        if (isNaN(times) || times < 0) {
          throw new Error(
            `Invalid 'times' argument for 'repeat' command (must be a non-negative number) at line ${
              i + 1
            }: "${line}"`
          );
        }
        newBlock = {
          type: 'repeat_simple2',
          id: generateBlockId(),
          extraState: {disableNextConnection: false},
          fields: {times: times},
          inputs: {code: undefined}, // 'code' input will be populated by child blocks
        };
        isNewScopeParent = true;
        break;
      }

      default:
        throw new Error(
          `Unknown command "${command}" at line ${i + 1}: "${line}"`
        );
    }

    // Defensive check, though `newBlock` should always be defined by now.
    if (!newBlock) {
      throw new Error(`Failed to create block for line ${i + 1}: "${line}"`);
    }

    // --- Core Logic for Handling Indentation and Block Attachment ---

    // Step 1: Adjust `scopeStack` based on indentation.
    // If the current line's indentation is less than or equal to the indentation
    // of the block at the top of the stack, it means we are exiting that scope
    // (and potentially more outer scopes). Pop them from the stack.
    while (
      scopeStack.length > 0 &&
      currentIndentation <= scopeStack[scopeStack.length - 1].indentation
    ) {
      const poppedScope = scopeStack.pop()!;
      // When a scope closes, the `activeBlockChainEnd` for the *outer* scope
      // becomes the block of the popped scope itself. This is because the next
      // command at the outer level should attach to this block's `next` connection.
      activeBlockChainEnd = poppedScope.block;
    }

    // Step 2: Attach the `newBlock` to the correct parent in the Blockly structure.
    if (scopeStack.length > 0) {
      // We are currently inside a `play_together` or `repeat` block's scope.
      // Attach `newBlock` to the `inputs.code` of the top-most block in the `scopeStack`.
      const currentScopeBlock = scopeStack[scopeStack.length - 1].block;
      let internalAttachmentPoint = currentScopeBlock.inputs?.code?.block;

      if (!internalAttachmentPoint) {
        // This is the very first child block to be added within this scope's 'code' input.
        currentScopeBlock.inputs = currentScopeBlock.inputs || {}; // Ensure 'inputs' object exists
        currentScopeBlock.inputs.code = {block: newBlock};
      } else {
        // Find the last block in the existing chain within this scope's 'code' input.
        // The new block will be attached as 'next' to this last block.
        while (internalAttachmentPoint.next) {
          internalAttachmentPoint = internalAttachmentPoint.next.block;
        }
        internalAttachmentPoint.next = {block: newBlock};
      }
    } else {
      // We are at the top level of the program (after `when_run` or after returning from all nested scopes).
      // Attach `newBlock` to the `next` connection of the `activeBlockChainEnd`.
      activeBlockChainEnd.next = {block: newBlock};
    }

    // Step 3: Update `activeBlockChainEnd` for the *next* iteration.
    // The newly created block is now the last block in the currently active sequential chain.
    activeBlockChainEnd = newBlock;

    // Step 4: If `newBlock` itself is a scope parent (`play_together` or `repeat`),
    // push it onto the `scopeStack`. This indicates that subsequent indented blocks
    // should be added into *its* `code` input.
    if (isNewScopeParent) {
      scopeStack.push({block: newBlock, indentation: currentIndentation});
    }

    // HAND_CHANGE: Commented out manually.
    // previousIndentation = currentIndentation;
  }

  // Construct the final Blockly workspace object
  const blocklyWorkspace: BlocklyWorkspace = {
    blocks: {
      languageVersion: 0,
      blocks: [rootBlock], // The entire structure hangs off the root block
    },
  };

  // Convert the JavaScript object to a JSON string, pretty-printed for readability
  return JSON.stringify(blocklyWorkspace, null, 2);
}
