// NOTE: this code is AI generated.

/*
Your job will be to generate a TypeScript function which generates Blockly JSON, as a string, from psuedocode which describes how to play a dance.  Never use the "any" type, and double-check your work to make sure that there are no errors.

Here is some example input psuedocode:

when_run
  create "sloth" at "center"
  "sloths" do "dab"

at "2" measures
  "sloths" do "floss"

at "3" measures
  "sloths" do "dab"

This psuedocode has three moments of interest.  When first run, it creates a "sloth" character in the "center" of the screen, and then it makes all "sloths" do a dance called the "dab".  Then, when the background song reaches measure "2", the sloths start doing the "floss" dance move.  Then, when the song reaches measure "3", the sloths start doing the "dab" again.

Indenting is important.

And here is example blockly JSON that represents the psuedocode above:

{"blocks":{"languageVersion":0,"blocks":[{"type":"Dancelab_whenSetup","id":";fui020!Iaz!kp-n0K[8","x":47,"y":41,"movable":false,"inputs":{"DO":{"block":{"type":"Dancelab_makeAnonymousDanceSprite","id":"{U-DOxMPz$)-j8dIS#O|","fields":{"COSTUME":"<field name=\"COSTUME\">\"CAT\"</field>","LOCATION":"<field name=\"LOCATION\">{x: 100, y: 200}</field>"},"next":{"block":{"type":"Dancelab_makeAnonymousDanceSprite","id":"~y[?utp)~L.$C@ZiL51V","fields":{"COSTUME":"<field name=\"COSTUME\">\"DOG\"</field>","LOCATION":"<field name=\"LOCATION\">{x: 300, y: 200}</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"!zxTn$JN@Iwv}-Dk^Q(8","fields":{"GROUP":"<field name=\"GROUP\">\"CAT\"</field>","MOVE":"<field name=\"MOVE\">MOVES.Dab</field>","DIR":"<field name=\"DIR\">-1</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"=D*J5IY5upi+bOqMX8nR","fields":{"GROUP":"<field name=\"GROUP\">\"DOG\"</field>","MOVE":"<field name=\"MOVE\">MOVES.Dab</field>","DIR":"<field name=\"DIR\">-1</field>"}}}}}}}}}}},{"type":"Dancelab_atTimestampNotAfter","id":"S4!uAzkx{%vw@UFZX8hY","x":50,"y":237,"deletable":false,"editable":false,"fields":{"TIMESTAMP":2,"UNIT":"<field name=\"UNIT\">\"measures\"</field>"},"next":{"block":{"type":"Dancelab_makeAnonymousDanceSprite","id":"d9=O0|m4kmUCbn`vV+!g","fields":{"COSTUME":"<field name=\"COSTUME\">\"SLOTH\"</field>","LOCATION":"<field name=\"LOCATION\">{x: 200, y: 200}</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"vb82H}!NOVGmpir7;~5Q","fields":{"GROUP":"<field name=\"GROUP\">\"CAT\"</field>","MOVE":"<field name=\"MOVE\">MOVES.Floss</field>","DIR":"<field name=\"DIR\">-1</field>"},"next":{"block":{"type":"Dancelab_changeMoveEachLR","id":"j..*n3lnL=w~GAWxr7dl","fields":{"GROUP":"<field name=\"GROUP\">\"DOG\"</field>","MOVE":"<field name=\"MOVE\">MOVES.Floss</field>","DIR":"<field name=\"DIR\">-1</field>"},"next":{"block":{"type":"Dancelab_doMoveEachLR","id":"*hCDocpHXqlku@f[[rK=","fields":{"GROUP":"<field name=\"GROUP\">\"SLOTH\"</field>","MOVE":"<field name=\"MOVE\">MOVES.Floss</field>","DIR":"<field name=\"DIR\">-1</field>"}}}}}}}}}}]}}

*/

/*
To generate the Blockly JSON from the given pseudocode, we'll create a TypeScript function that parses the pseudocode line by line, identifies the dance actions and timing, and then constructs the corresponding Blockly JSON structure.

The core logic involves:
1.  **Parsing**: Identifying top-level blocks like `when_run` and `at "X" measures`, and nested action blocks like `create` and `"character" do "move"`. Indentation is crucial for determining nesting.
2.  **Mapping**: Translating pseudocode elements (character names, move names, locations, timings) into their Blockly equivalents (block types, field values, and input structures).
3.  **Structuring JSON**: Assembling the parsed and mapped components into the hierarchical JSON format expected by Blockly, including unique IDs, positions, and connections (`next` and `inputs`).

Here's the TypeScript function:

*/

/**
 * Helper to generate a unique ID for Blockly blocks.
 * These IDs are often alphanumeric with some special characters in Blockly's actual output.
 * @returns A unique string ID.
 */
function generateBlockId(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?`~';
  let result = '';
  // A length of 20 characters provides sufficient uniqueness for typical Blockly workspaces.
  const length = 20;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Maps a pseudocode character name (e.g., "sloth", "sloths") to its Blockly character/group name (e.g., "SLOTH").
 * Blockly typically uses the singular, uppercase form for costume and group fields.
 * @param name The character name from the pseudocode.
 * @returns The Blockly-formatted character name.
 */
function getBlocklyCharacterName(name: string): string {
  // Remove trailing 's' if present for plural, then uppercase.
  // Handles cases like "sloths" -> "SLOTH", "sloth" -> "SLOTH".
  const singularName = name.toLowerCase().endsWith('s')
    ? name.slice(0, -1)
    : name;
  return singularName.toUpperCase();
}

/**
 * Maps a pseudocode move name (e.g., "dab", "floss") to its Blockly MOVES enum string (e.g., "Dab", "Floss").
 * @param move The move name from the pseudocode.
 * @returns The Blockly-formatted move name.
 */
function getBlocklyMoveName(move: string): string {
  return move.charAt(0).toUpperCase() + move.slice(1).toLowerCase();
}

/**
 * Maps a pseudocode location (e.g., "center") to its Blockly coordinate string (e.g., "{x: 200, y: 200}").
 * @param location The location name from the pseudocode.
 * @returns The coordinate string.
 * @throws {Error} If an unsupported location is provided.
 */
function getBlocklyLocationCoordinates(location: string): string {
  switch (location.toLowerCase()) {
    case 'center':
      return '{x: 200, y: 200}';
    // Add more locations here if the pseudocode supports them in the future:
    case 'left':
      return '{x: 100, y: 200}';
    case 'right':
      return '{x: 300, y: 200}';
    case 'top':
      return '{x: 200, y: 100}';
    case 'bottom':
      return '{x: 200, y: 300}';
    default:
      throw new Error(
        `Unsupported location: "${location}". Only 'center' is currently implemented.`
      );
  }
}

// Define TypeScript interfaces for the Blockly JSON structure to ensure type safety.
interface BlocklyField {
  [key: string]: string | number;
}

interface BlocklyInput {
  block: BlocklyBlock;
}

interface BlocklyBlock {
  type: string;
  id: string;
  x?: number; // X coordinate for top-level blocks
  y?: number; // Y coordinate for top-level blocks
  movable?: boolean; // Specific to Dancelab_whenSetup
  deletable?: boolean; // Specific to Dancelab_atTimestampNotAfter
  editable?: boolean; // Specific to Dancelab_atTimestampNotAfter
  fields?: BlocklyField; // Block-specific parameters
  inputs?: {[key: string]: BlocklyInput}; // For blocks that contain nested blocks (e.g., 'DO' input)
  next?: BlocklyInput; // For blocks that are chained sequentially
}

interface BlocklyBlocksContainer {
  languageVersion: number;
  blocks: BlocklyBlock[];
}

interface BlocklyRoot {
  blocks: BlocklyBlocksContainer;
}

/**
 * Generates Blockly JSON as a string from a pseudocode description of a dance.
 *
 * This function parses the pseudocode, which describes dance actions and their timing,
 * and converts it into a structured JSON string compatible with Blockly for Dancelab.
 * It handles 'when_run' blocks and 'at "X" measures' blocks, along with 'create'
 * and 'do' actions nested within them.
 *
 * @param pseudocode The pseudocode string to convert.
 * @returns A JSON string representing the Blockly workspace.
 * @throws {Error} If the pseudocode contains invalid syntax, unsupported commands,
 *                 or incorrect indentation.
 */
export default function generateBlocklyJsonFromPseudocode(
  pseudocode: string
): string {
  // Split pseudocode into lines, trim trailing whitespace, and filter out empty lines.
  const lines = pseudocode
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.length > 0);

  const rootBlocks: BlocklyBlock[] = []; // Array to hold top-level Blockly blocks
  let currentBlockY = 41; // Initial Y coordinate for the first top-level block (based on example)

  // Variables to manage the context of the current parsing section (e.g., 'when_run' or 'at measures')
  let currentSectionBlock: BlocklyBlock | null = null;
  // Tracks the last action block added to the current chain (for 'next' connections)
  let lastActionBlockInCurrentChain: BlocklyBlock | null = null;

  for (const line of lines) {
    // Determine indentation level (number of leading spaces).
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    const trimmedLine = line.trimStart();

    if (indent === 0) {
      // This is a top-level block command (e.g., "when_run", "at measures")
      lastActionBlockInCurrentChain = null; // Reset action chain for a new top-level section

      if (trimmedLine === 'when_run') {
        currentSectionBlock = {
          type: 'Dancelab_whenSetup',
          id: generateBlockId(),
          x: 47, // X coordinate from example
          y: currentBlockY,
          movable: false,
          inputs: {
            DO: {
              block: {} as BlocklyBlock, // Placeholder for the first action block in its 'DO' input
            },
          },
        };
        rootBlocks.push(currentSectionBlock);
      } else if (trimmedLine.startsWith('at ')) {
        const match = trimmedLine.match(/^at "(\d+)" measures$/);
        if (!match) {
          throw new Error(
            `Invalid 'at' syntax: "${trimmedLine}". Expected format: 'at "NUMBER" measures'.`
          );
        }
        const timestamp = parseInt(match[1], 10);
        currentSectionBlock = {
          type: 'Dancelab_atTimestampNotAfter',
          id: generateBlockId(),
          x: 50, // X coordinate from example (slightly offset from whenSetup)
          y: currentBlockY,
          deletable: false,
          editable: false,
          fields: {
            TIMESTAMP: timestamp,
            UNIT: '<field name="UNIT">"measures"</field>',
          },
          next: {} as BlocklyInput, // Placeholder for the first action block in its 'next' chain
        };
        rootBlocks.push(currentSectionBlock);
      } else {
        throw new Error(
          `Unknown top-level command: "${trimmedLine}". Expected 'when_run' or 'at "N" measures'.`
        );
      }
      // Increment Y for the next top-level block to ensure vertical separation in the workspace.
      // The value 196 is derived from the example JSON's Y spacing (237 - 41 = 196).
      currentBlockY += 196;
    } else if (indent === 2) {
      // This is an action block nested within a top-level section (assuming 2-space indent)
      if (!currentSectionBlock) {
        throw new Error(
          `Action "${trimmedLine}" found without a preceding section (e.g., 'when_run' or 'at measures').`
        );
      }

      let newActionBlock: BlocklyBlock;

      if (trimmedLine.startsWith('create ')) {
        const match = trimmedLine.match(/^create "([^"]+)" at "([^"]+)"$/);
        if (!match) {
          throw new Error(
            `Invalid 'create' syntax: "${trimmedLine}". Expected format: 'create "CHARACTER" at "LOCATION"'.`
          );
        }
        const characterName = getBlocklyCharacterName(match[1]);
        const locationCoordinates = getBlocklyLocationCoordinates(match[2]);
        newActionBlock = {
          type: 'Dancelab_makeAnonymousDanceSprite',
          id: generateBlockId(),
          fields: {
            COSTUME: `<field name=\"COSTUME\">\"${characterName}\"</field>`,
            LOCATION: `<field name=\"LOCATION\">${locationCoordinates}</field>`,
          },
        };
      } else if (trimmedLine.match(/^"([^"]+)" do "([^"]+)"$/)) {
        const match = trimmedLine.match(/^"([^"]+)" do "([^"]+)"$/);
        if (!match) {
          throw new Error(
            `Invalid 'do' syntax: "${trimmedLine}". Expected format: '"GROUP" do "MOVE"'.`
          );
        }
        const groupName = getBlocklyCharacterName(match[1]);
        const moveName = getBlocklyMoveName(match[2]);
        newActionBlock = {
          type: 'Dancelab_doMoveEachLR', // This block type best fits "do move" action.
          id: generateBlockId(),
          fields: {
            GROUP: `<field name=\"GROUP\">\"${groupName}\"</field>`,
            MOVE: `<field name=\"MOVE\">MOVES.${moveName}</field>`,
            DIR: '-1', // Default direction from the provided example JSON
          },
        };
      } else {
        throw new Error(`Unknown action command: "${trimmedLine}".`);
      }

      // Link the newly created action block into the current chain of actions.
      if (lastActionBlockInCurrentChain) {
        // If there's a previous action block, link the new one after it.
        lastActionBlockInCurrentChain.next = {block: newActionBlock};
      } else {
        // If this is the first action block in the section, link it directly
        // to the section block (either via 'DO' input or 'next' property).
        if (
          currentSectionBlock.type === 'Dancelab_whenSetup' &&
          currentSectionBlock.inputs
        ) {
          currentSectionBlock.inputs.DO = {block: newActionBlock};
        } else if (
          currentSectionBlock.type === 'Dancelab_atTimestampNotAfter'
        ) {
          currentSectionBlock.next = {block: newActionBlock};
        } else {
          // This case should ideally not be reached if all section types are handled.
          throw new Error(
            `Internal error: Cannot attach first action block to an unrecognized section type.`
          );
        }
      }
      // Update the last action block in the chain to the newly added one.
      lastActionBlockInCurrentChain = newActionBlock;
    } else {
      throw new Error(
        `Unsupported indentation level: ${indent} for line: "${line}". Expected 0 for top-level commands or 2 for actions.`
      );
    }
  }

  // Assemble the final Blockly JSON structure.
  const blocklyJson: BlocklyRoot = {
    blocks: {
      languageVersion: 0,
      blocks: rootBlocks,
    },
  };

  // Return the JSON string, formatted for readability (2-space indentation).
  return JSON.stringify(blocklyJson, null, 2);
}
