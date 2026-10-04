// The words the model got, as "Behind the scenes" shows them.

import {
  basePrompt,
  posedFrames,
  posePrompt,
} from '../../ai/images/characterSet';
import {
  fullPromptFor,
  GenerateImageOptions,
  pixelBlockFor,
} from '../../ai/images/imageGeneration';
import {chooseKeyColor} from '../../ai/images/keyColor';
import {BodyPlan, ImageStyle} from '../../ai/images/types';

/** Stands in for the pose in the words every posed frame shares. */
export const POSE_MARK = '[pose]';

export interface SentPrompts {
  /** The words for the one picture, or for a set's first picture. */
  picture: string;
  /** For a set: the words every posed frame got, with POSE_MARK where its
      pose goes, and each frame's pose. */
  poses?: {common: string; frames: {label: string; pose: string}[]};
}

/**
 * A set's first frame is asked for in its own words, and every posed frame
 * then gets the same words around its pose; one picture gets the plain
 * prompt.
 */
export function sentPromptsFor(
  prompt: string,
  options: GenerateImageOptions,
  style: ImageStyle,
  asSet: boolean,
  bodyPlan?: BodyPlan
): SentPrompts {
  if (!asSet) {
    return {picture: fullPromptFor(prompt, options)};
  }
  const key = chooseKeyColor(prompt);
  const block = pixelBlockFor('sprite', options.pixelGrid);
  return {
    picture: basePrompt(prompt, style, key, block, bodyPlan),
    poses: {
      common: posePrompt(
        prompt,
        {label: 'pose', pose: POSE_MARK},
        style,
        key,
        block
      ),
      frames: posedFrames(bodyPlan).map(({label, pose}) => ({label, pose})),
    },
  };
}
