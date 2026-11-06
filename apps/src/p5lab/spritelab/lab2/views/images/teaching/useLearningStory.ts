// The "How AI made your image" story: told once a visit on a level that
// asks for it, after the first picture made there, and only in a quiet
// moment.

import {useCallback, useEffect, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {GeneratedImageResult} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

import {LearningPicture} from './LearningDialog';

// Wait for the pixel reveal animation to finish before opening the dialog.
const LEARNING_DELAY_MS = 1800;

/** `?learning=always` opens the dialog after every picture, for reviewing
    it. */
function learningForced(): boolean {
  return queryParams('learning') === 'always';
}

export interface LearningStory {
  picture: LearningPicture;
  prompt: string;
  imageType: ImageType;
}

interface UseLearningStoryOptions {
  /** The tab is the one showing. */
  active: boolean;
  /** The level tells the story (its level mode's `learning`). */
  learning?: boolean;
  /** The level being visited; each arrival on a level is a visit. */
  levelId?: number;
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
  learning,
  levelId,
}: UseLearningStoryOptions): LearningStoryTools {
  const [story, setStory] = useState<LearningStory | null>(null);
  // Whether the story was told this visit; the tab outlives a level
  // change, so a level change ends the visit rather than an unmount.
  const toldRef = useRef(false);
  const timerRef = useRef<number>();
  // The story waits for a quiet moment: this tab in view, and no rating
  // question open. Until then it is held here.
  const activeRef = useRef(active);
  const askingRef = useRef(false);
  const heldStoryRef = useRef<(() => void) | null>(null);
  // A story still pending when the level changes belongs to the level
  // being left; a return to it is a new visit.
  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      heldStoryRef.current = null;
      toldRef.current = false;
      setStory(null);
    },
    [levelId]
  );
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
      const due = !!learning && !toldRef.current;
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
          setStory({
            picture: {src, crop},
            prompt: result.generation.prompt,
            imageType: result.generation.imageType,
          });
        tellHeldStory();
      }, LEARNING_DELAY_MS);
    },
    [learning, tellHeldStory]
  );
  const endStory = useCallback(() => setStory(null), []);
  return {story, offerStory, handleAsking, endStory};
}
