// The Behind the scenes button for an AI-made image chosen again, built
// from the generation record stored on the image.

import React from 'react';

import {sentPromptsFor} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentPrompts';

import {ProjectImage} from '../projectImages';

import BehindTheScenes from './BehindTheScenes';

interface ReopenedBehindTheScenesProps {
  image: ProjectImage;
  disabled?: boolean;
}

const ReopenedBehindTheScenes: React.FunctionComponent<
  ReopenedBehindTheScenesProps
> = ({image, disabled}) => {
  const generation = image.props.generation;
  if (!generation) {
    return null;
  }
  return (
    <BehindTheScenes
      compact
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
