// The "How AI made your image" story: told once a visit on a level about a
// character or a background, after the first picture made there, and only
// in a quiet moment.

import {useCallback, useEffect, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {GeneratedImageResult} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

import {LearningPicture} from './LearningDialog';

// Wait for the pixel reveal animation to finish before opening the dialog.
const LEARNING_DELAY_MS = 1800;
// Image types that open the dialog after their first picture.
const LEARNING_KINDS: ImageType[] = ['sprite', 'background'];

/** `?learning=always` opens the dialog after every picture, for reviewing
    it. */
function learningForced(): boolean {
  return queryParams('learning') === 'always';
}

export interface LearningStory {
  picture: LearningPicture;
  prompt: string;
}

interface UseLearningStoryOptions {
  /** The tab is the one showing. */
  active: boolean;
  /** Set on a level whose task is one image of this type. */
  lockedImageType?: ImageType;
}

export interface LearningStoryTools {
  /** The story to show, once its moment has come. */
  story: LearningStory | null;
  /** A picture was kept for the first time; the story follows if it is
      due. */
  offerStory: (result: GeneratedImageResult) => void;
  /** The rating's reasons dialog opened or closed; the story waits while
      it is open. */
  handleAsking: (open: boolean) => void;
  endStory: () => void;
}

export default function useLearningStory({
  active,
  lockedImageType,
}: UseLearningStoryOptions): LearningStoryTools {
  const [story, setStory] = useState<LearningStory | null>(null);
  const toldRef = useRef(false);
  const timerRef = useRef<number>();
  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  // The story waits for a quiet moment: this tab in view, and no rating
  // question open. Until then it is held here.
  const activeRef = useRef(active);
  const askingRef = useRef(false);
  const heldStoryRef = useRef<(() => void) | null>(null);
  const tellHeldStory = useCallback(() => {
    const tell = heldStoryRef.current;
    if (tell && activeRef.current && !askingRef.current) {
      heldStoryRef.current = null;
      tell();
    }
  }, []);
  useEffect(() => {
    activeRef.current = active;
    tellHeldStory();
  }, [active, tellHeldStory]);
  const handleAsking = useCallback(
    (open: boolean) => {
      askingRef.current = open;
      tellHeldStory();
    },
    [tellHeldStory]
  );
  const offerStory = useCallback(
    (result: GeneratedImageResult) => {
      const {imageType, subject} = result.generation;
      const due =
        !toldRef.current &&
        !!lockedImageType &&
        LEARNING_KINDS.includes(imageType) &&
        subject !== 'object';
      if (!due && !learningForced()) {
        return;
      }
      toldRef.current = true;
      const src = bytesToDataURI(result.uint8Array, result.mediaType);
      const crop = result.frames
        ? {width: result.frames.frameSize.x, height: result.frames.frameSize.y}
        : undefined;
      timerRef.current = window.setTimeout(() => {
        heldStoryRef.current = () =>
          setStory({picture: {src, crop}, prompt: result.generation.prompt});
        tellHeldStory();
      }, LEARNING_DELAY_MS);
    },
    [lockedImageType, tellHeldStory]
  );
  const endStory = useCallback(() => setStory(null), []);
  return {story, offerStory, handleAsking, endStory};
}
