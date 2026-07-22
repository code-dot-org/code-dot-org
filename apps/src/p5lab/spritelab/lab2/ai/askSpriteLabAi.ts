import {generateText} from '@cdo/apps/aiGateway';

import {buildPrompt} from '../blockly/generateContent';
import {AvailableImageNames} from '../redux/selectors';

import {getTextModel} from './items/modelHelpers';

/**
 * Ask the AI to turn a natural-language request into Sprite Lab pseudocode
 * (Gemini 2.5 Flash), straight through the AI Gateway like the levelbuilder
 * generator tools. Returns the generated pseudocode text. Prompt safety is
 * whatever the gateway enforces; the aichat moderation pipeline is not on
 * this path. The caller supplies the project's image and scene names (see
 * redux/selectors).
 */
export default async function askSpriteLabAi(
  userPrompt: string,
  imageNames: AvailableImageNames,
  sceneNames: string[]
): Promise<string> {
  const {costumes, backgrounds, blocks} = imageNames;
  const prompt = buildPrompt(
    userPrompt,
    costumes,
    backgrounds,
    sceneNames,
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
