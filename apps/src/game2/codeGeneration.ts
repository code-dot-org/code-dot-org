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

The pseudocode format is one instruction per line. The first line is always:
  whenStarts

Then zero or more of these instructions follow, each indented with two spaces:

  createItem "<imageName>"
    — Places the named image as a sprite at the center of the world.

  setItemBehavior "<imageName>" "<behavior>"
    — Sets the movement behavior for the sprite.
    — Valid behaviors: ${behaviors.map(b => `"${b}"`).join(', ')}

  setBackground "<imageName>"
    — Sets the named image as the scrolling parallax background.

Available image names: ${imageNames}

Rules:
- Only use image names from the available list above.
- Always start with "whenStarts" (no indent).
- Indent subsequent lines with exactly two spaces.
- Do not output anything other than the pseudocode.

Example output:
whenStarts
  createItem "cat"
  setItemBehavior "cat" "platform"
  setBackground "sky"
`;
}

const BEHAVIOR_VALUES = ['none', 'move', 'platform'];

/**
 * Parse the AI-generated pseudocode into Blockly workspace JSON.
 */
export function pseudocodeToBlocklyJson(
  pseudocode: string
): Record<string, unknown> {
  const lines = pseudocode
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const blocks: Record<string, unknown>[] = [];

  for (const line of lines) {
    if (line === 'whenStarts') {
      // The hat block — we'll attach children via next.
      continue;
    }

    const createMatch = line.match(/^createItem\s+"(.+)"$/);
    if (createMatch) {
      blocks.push({
        type: 'Game2_createItem',
        fields: {IMAGE: createMatch[1]},
      });
      continue;
    }

    const behaviorMatch = line.match(/^setItemBehavior\s+"(.+)"\s+"(.+)"$/);
    if (behaviorMatch) {
      blocks.push({
        type: 'Game2_setItemBehavior',
        fields: {IMAGE: behaviorMatch[1], BEHAVIOR: behaviorMatch[2]},
      });
      continue;
    }

    const bgMatch = line.match(/^setBackground\s+"(.+)"$/);
    if (bgMatch) {
      blocks.push({
        type: 'Game2_setBackground',
        fields: {IMAGE: bgMatch[1]},
      });
      continue;
    }
  }

  // Build the chained block structure: whenStart → block1 → block2 → ...
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tail: Record<string, any> | null = null;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const entry: Record<string, unknown> = {...blocks[i]};
    if (tail) {
      entry.next = {block: tail};
    }
    tail = entry;
  }

  const whenStartBlock: Record<string, unknown> = {
    type: 'Game2_whenStart',
    x: 20,
    y: 20,
  };
  if (tail) {
    whenStartBlock.next = {block: tail};
  }

  return {
    blocks: {
      languageVersion: 0,
      blocks: [whenStartBlock],
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
