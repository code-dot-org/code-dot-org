// The Behind the scenes button for an AI-made image chosen again, built
// from the generation record stored on the image.

import React from 'react';

import {sentPromptsFor} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentPrompts';

import {ProjectImage} from '../projectImages';

import BehindTheScenes from './BehindTheScenes';
import {LearningStory} from './useLearningStory';

interface ReopenedBehindTheScenesProps {
  image: ProjectImage;
  disabled?: boolean;
  /** Tells the image's "How AI made your image" story. */
  onTellStory?: (story: LearningStory) => void;
}

const ReopenedBehindTheScenes: React.FunctionComponent<
  ReopenedBehindTheScenesProps
> = ({image, disabled, onTellStory}) => {
  const generation = image.props.generation;
  if (!generation) {
    return null;
  }
  const {src, sheet} = image;
  const tellStory =
    onTellStory && src
      ? () =>
          onTellStory({
            picture: {
              src,
              crop: sheet && {
                width: sheet.frameSize.x,
                height: sheet.frameSize.y,
              },
            },
            prompt: generation.prompt,
            imageType: generation.imageType,
          })
      : undefined;
  return (
    <BehindTheScenes
      compact
      onTellStory={tellStory}
      sent={sentPromptsFor(
        generation.prompt,
        {
          imageType: generation.imageType,
          subject: generation.subject,
          style: generation.style,
          seed: generation.seed,
          temperature: generation.temperature,
          pixelGrid: generation.pixelGrid,
        },
        generation.style,
        !!image.sheet,
        generation.bodyPlan
      )}
      disabled={disabled}
    />
  );
};

export default ReopenedBehindTheScenes;
