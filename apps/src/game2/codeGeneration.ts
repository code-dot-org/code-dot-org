import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {PendingChatMessage, AichatContext} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatModelIds,
  AiInteractionStatus as Status,
  AiChatClientTypes,
} from '@cdo/generated-scripts/sharedConstants';

import {Game2ImageEntry} from './types';

/**
 * Build the system prompt that teaches the AI about our pseudocode format.
 */
function buildSystemPrompt(
  images: Game2ImageEntry[],
  behaviors: string[]
): string {
  const imageNames =
    images.length > 0
      ? images.map(i => `"${i.name}"`).join(', ')
      : '(none yet)';

  return `You are a code generator for a simple block-based game engine.
You output ONLY pseudocode — no markdown, no explanation, no commentary.

The program starts with a "whenStarts" block, followed by indented instructions.
There can also be top-level event blocks like "whenCollide".

Available instructions (indent with two spaces under their parent block):

  createItem "<imageName>"
    — Places the named image as a sprite at the center of the world.

  setItemBehavior "<imageName>" "<behavior>"
    — Sets the movement behavior for the sprite.
    — Valid behaviors: ${behaviors.map(b => `"${b}"`).join(', ')}

  setBackground "<imageName>"
    — Sets the named image as the scrolling parallax background.

  startScoring
    — Initializes the score to 0 and shows it on screen.

  increaseScore <number>
    — Adds the given integer to the score.

  decreaseScore <number>
    — Subtracts the given integer from the score.

  removeItem "<imageName>"
    — Removes all instances of the named item from the play area with a puff effect.

Top-level event blocks (NOT indented under whenStarts):

  whenCollide "<imageName>"
    — Fires when the controlled sprite touches items of this type.
    — Indent the handler body with two spaces under this line.

Available image names: ${imageNames}

Rules:
- Only use image names from the available list above.
- Always start with "whenStarts" (no indent).
- Event blocks like "whenCollide" are separate top-level blocks (no indent).
- Indent body lines with exactly two spaces under their parent.
- Do not output anything other than the pseudocode.

Example output:
whenStarts
  createItem "cat"
  setItemBehavior "cat" "platform"
  setBackground "sky"
  createItem "coin"
  startScoring
whenCollide "coin"
  increaseScore 10
  removeItem "coin"
`;
}

const BEHAVIOR_VALUES = ['none', 'move', 'platform'];

/**
 * A parsed top-level block with its child statements.
 */
interface ParsedBlock {
  type: 'whenStarts' | 'whenCollide';
  image?: string; // for whenCollide
  children: Record<string, unknown>[];
}

/**
 * Parse a single instruction line into a Blockly block descriptor,
 * or null if unrecognized.
 */
function parseInstruction(line: string): Record<string, unknown> | null {
  const createMatch = line.match(/^createItem\s+"(.+)"$/);
  if (createMatch) {
    return {type: 'Game2_createItem', fields: {IMAGE: createMatch[1]}};
  }

  const behaviorMatch = line.match(/^setItemBehavior\s+"(.+)"\s+"(.+)"$/);
  if (behaviorMatch) {
    return {
      type: 'Game2_setItemBehavior',
      fields: {IMAGE: behaviorMatch[1], BEHAVIOR: behaviorMatch[2]},
    };
  }

  const bgMatch = line.match(/^setBackground\s+"(.+)"$/);
  if (bgMatch) {
    return {type: 'Game2_setBackground', fields: {IMAGE: bgMatch[1]}};
  }

  if (line === 'startScoring') {
    return {type: 'Game2_startScoring'};
  }

  const incMatch = line.match(/^increaseScore\s+(\d+)$/);
  if (incMatch) {
    return {
      type: 'Game2_increaseScore',
      fields: {AMOUNT: parseInt(incMatch[1], 10)},
    };
  }

  const decMatch = line.match(/^decreaseScore\s+(\d+)$/);
  if (decMatch) {
    return {
      type: 'Game2_decreaseScore',
      fields: {AMOUNT: parseInt(decMatch[1], 10)},
    };
  }

  const removeMatch = line.match(/^removeItem\s+"(.+)"$/);
  if (removeMatch) {
    return {type: 'Game2_removeItem', fields: {IMAGE: removeMatch[1]}};
  }

  return null;
}

/**
 * Chain a list of block descriptors into a linked next-chain.
 */
function chainBlocks(
  blocks: Record<string, unknown>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tail: Record<string, any> | null = null;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const entry: Record<string, unknown> = {...blocks[i]};
    if (tail) {
      entry.next = {block: tail};
    }
    tail = entry;
  }
  return tail;
}

/**
 * Parse the AI-generated pseudocode into Blockly workspace JSON.
 */
export function pseudocodeToBlocklyJson(
  pseudocode: string
): Record<string, unknown> {
  const rawLines = pseudocode.split('\n').filter(l => l.trim().length > 0);

  // Group lines into top-level blocks.
  const topBlocks: ParsedBlock[] = [];
  let current: ParsedBlock | null = null;

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    const isIndented = rawLine.startsWith('  ');

    if (trimmed === 'whenStarts') {
      current = {type: 'whenStarts', children: []};
      topBlocks.push(current);
      continue;
    }

    const collideMatch = trimmed.match(/^whenCollide\s+"(.+)"$/);
    if (collideMatch) {
      current = {type: 'whenCollide', image: collideMatch[1], children: []};
      topBlocks.push(current);
      continue;
    }

    // Indented line belongs to current block.
    if (isIndented && current) {
      const instruction = parseInstruction(trimmed);
      if (instruction) {
        current.children.push(instruction);
      }
    }
  }

  // Convert parsed blocks to Blockly JSON.
  const workspaceBlocks: Record<string, unknown>[] = [];
  let yPos = 20;

  for (const block of topBlocks) {
    if (block.type === 'whenStarts') {
      const whenStartBlock: Record<string, unknown> = {
        type: 'Game2_whenStart',
        x: 20,
        y: yPos,
      };
      const chain = chainBlocks(block.children);
      if (chain) {
        whenStartBlock.next = {block: chain};
      }
      workspaceBlocks.push(whenStartBlock);
    } else if (block.type === 'whenCollide') {
      const whenCollideBlock: Record<string, unknown> = {
        type: 'Game2_whenCollide',
        fields: {IMAGE: block.image},
        x: 20,
        y: yPos,
      };
      const chain = chainBlocks(block.children);
      if (chain) {
        whenCollideBlock.next = {block: chain};
      }
      workspaceBlocks.push(whenCollideBlock);
    }
    yPos += 200;
  }

  return {
    blocks: {
      languageVersion: 0,
      blocks: workspaceBlocks,
    },
  };
}

/**
 * Call the AI to generate pseudocode, then convert to Blockly JSON.
 */
export async function generateCodeFromPrompt(
  userPrompt: string,
  images: Game2ImageEntry[]
): Promise<Record<string, unknown>> {
  const systemPrompt = buildSystemPrompt(images, BEHAVIOR_VALUES);

  const newUserMessage: PendingChatMessage = {
    role: Role.USER,
    status: Status.UNKNOWN,
    chatMessageText: userPrompt,
    assets: undefined,
    timestamp: Date.now(),
  };

  const aichatContext: AichatContext = {
    clientType: AiChatClientTypes.FLOW_LAB,
    currentLevelId: null,
    scriptId: null,
    channelId: undefined,
  };

  const aiCustomizations = {
    ...EMPTY_AI_CUSTOMIZATIONS,
    selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH,
    systemPrompt,
  };

  const messages = await postAichatCompletionMessage(
    newUserMessage,
    [],
    aiCustomizations,
    aichatContext
  );

  const assistantMessage = messages.find(m => m.role === Role.ASSISTANT);
  if (!assistantMessage?.chatMessageText) {
    throw new Error('No response from AI');
  }

  return pseudocodeToBlocklyJson(assistantMessage.chatMessageText);
}
