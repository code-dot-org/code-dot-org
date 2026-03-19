import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {PendingChatMessage, AichatContext} from '@cdo/apps/aichat/types';
import {EMPTY_AI_CUSTOMIZATIONS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiChatModelIds,
  AiInteractionStatus as Status,
  AiChatClientTypes,
} from '@cdo/generated-scripts/sharedConstants';

import {createEmptyGrid, GRID_SIZE, SOLID_CELL} from './gridConstants';
import {Game2ImageEntry} from './types';

function buildSystemPrompt(images: Game2ImageEntry[]): string {
  const itemNames =
    images.length > 0 ? images.map(i => `"${i.name}"`).join(', ') : '(none)';

  return `You are a level designer for a side-scrolling platform game on a ${GRID_SIZE}x${GRID_SIZE} grid.
Row 0 is the top, row ${
    GRID_SIZE - 1
  } is the bottom. Column 0 is the left, column ${GRID_SIZE - 1} is the right.

You output ONLY a JSON object with filled cell coordinates — no markdown, no explanation.

The grid is mostly empty. You specify only the filled cells as a sparse list.

Output format (strict JSON, no trailing commas):
{
  "cells": [
    {"r": <row>, "c": <col>, "t": "<type>"},
    ...
  ]
}

Valid types:
- "solid" — an impassable platform block the player stands on or bumps into.
${
  images.length > 0
    ? `- Item names (${itemNames}) — collectible/interactive sprites placed on the grid.`
    : ''
}

Design guidelines:
- This is a side-scrolling platformer. The player starts roughly in the middle and needs to navigate upward.
- Create interesting platform layouts with varying heights, gaps to jump across, and multiple paths.
- Place a solid ground near row ${
    GRID_SIZE - 5
  } spanning most columns as a starting floor.
- Add platforms at various heights above, getting higher as the player progresses.
- Platforms should be 3-8 blocks wide, with gaps of 3-6 blocks between them.
- Include some vertical wall sections (2-4 blocks tall) for variety.
${
  images.length > 0
    ? `- Scatter item sprites on top of platforms every so often (every 5-10 platforms). Place items 1 row ABOVE a solid block so they sit on the platform surface.`
    : ''
}
- Keep the design interesting but playable — every platform should be reachable by jumping.
- Aim for roughly 200-400 solid cells total for a good density.

Rules:
- Output ONLY valid JSON. No markdown fences, no comments, no explanation.
- Row and column values must be integers in the range 0 to ${GRID_SIZE - 1}.
- Every cell must have a valid type.
`;
}

/**
 * Parse the AI response into a grid.
 */
function parseWorldResponse(
  responseText: string,
  images: Game2ImageEntry[]
): string[][] {
  const grid = createEmptyGrid();
  const validNames = new Set([SOLID_CELL, ...images.map(i => i.name)]);

  // Extract JSON from the response (strip markdown fences if present).
  let jsonText = responseText.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonText);
  const cells = parsed.cells;
  if (!Array.isArray(cells)) {
    throw new Error('Expected "cells" array in response');
  }

  for (const cell of cells) {
    const r = cell.r;
    const c = cell.c;
    const t = cell.t;
    if (
      typeof r === 'number' &&
      typeof c === 'number' &&
      typeof t === 'string' &&
      r >= 0 &&
      r < GRID_SIZE &&
      c >= 0 &&
      c < GRID_SIZE &&
      validNames.has(t)
    ) {
      grid[r][c] = t;
    }
  }

  return grid;
}

/**
 * Call the AI to generate a world layout.
 */
export async function generateWorld(
  userPrompt: string,
  images: Game2ImageEntry[]
): Promise<string[][]> {
  const systemPrompt = buildSystemPrompt(images);

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

  return parseWorldResponse(assistantMessage.chatMessageText, images);
}
