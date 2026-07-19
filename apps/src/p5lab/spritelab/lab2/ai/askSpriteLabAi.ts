import {generateText} from '@cdo/apps/aiGateway';
import {getStore} from '@cdo/apps/redux';

import {buildPrompt} from '../blockly/generateContent';
import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';

import {getTextModel} from './items/modelHelpers';

// The project's costume, background, and block-tile names from the
// animationList slice, so the model only references images that actually
// exist. Exported so the generate flow can validate the model's output
// against the same lists.
export function getAvailableImageNames(): {
  costumes: string[];
  backgrounds: string[];
  blocks: string[];
} {
  const costumes: string[] = [];
  const backgrounds: string[] = [];
  const blocks: string[] = [];
  const animationList = getStore().getState().animationList;
  (animationList?.orderedKeys || []).forEach((key: string) => {
    const props = animationList.propsByKey[key];
    if (!props?.name) {
      return;
    }
    const categories = props.categories || [];
    if (categories.includes(BACKGROUNDS_CATEGORY)) {
      backgrounds.push(props.name);
    } else if (categories.includes(BLOCKS_CATEGORY)) {
      blocks.push(props.name);
    } else {
      costumes.push(props.name);
    }
  });
  return {costumes, backgrounds, blocks};
}

// The project's scene names (for go_to_scene). Empty outside the scenes UI
// variant, which keeps the command out of the prompt.
function getSceneNames(): string[] {
  const scenes = getStore().getState().spriteLab2?.scenes || [];
  return scenes
    .map((scene: {name?: string}) => scene.name)
    .filter(Boolean) as string[];
}

/**
 * Ask the AI to turn a natural-language request into Sprite Lab pseudocode
 * (Gemini 2.5 Flash), straight through the AI Gateway like the levelbuilder
 * generator tools. Returns the generated pseudocode text. Prompt safety is
 * whatever the gateway enforces; the aichat moderation pipeline is not on
 * this path.
 */
export default async function askSpriteLabAi(
  userPrompt: string
): Promise<string> {
  const {costumes, backgrounds, blocks} = getAvailableImageNames();
  const prompt = buildPrompt(
    userPrompt,
    costumes,
    backgrounds,
    getSceneNames(),
    blocks
  );

  let text = '';
  try {
    ({text} = await generateText({
      model: getTextModel(),
      messages: [{role: 'user', content: prompt}],
    }));
  } catch (e) {
    // Gateway errors aren't student-readable; log and rethrow friendly.
    console.error('SpriteLab2 AI codegen request failed:', e);
    throw new Error('The AI request failed. Try again.');
  }
  if (!text) {
    throw new Error("The AI didn't answer. Try again.");
  }
  return text;
}
