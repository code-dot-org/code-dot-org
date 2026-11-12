// The "How AI made your image" story. On a level that asks for it, it is
// told once a visit, as soon as the first picture made there is ready and
// before that picture is shown. If the Images tab is not in view, or a
// rating question is open, it is held until neither is the case. It is
// also told at once whenever a student asks for it.

import {useCallback, useEffect, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {GeneratedImageResult} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {FrameSize} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {studentFacingTextFor} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentences';

import {LearningPicture} from './LearningDialog';

/** `?learning=always` opens the dialog after every picture, for reviewing
    it. */
function learningForced(): boolean {
  return queryParams('learning') === 'always';
}

export interface LearningStory {
  picture: LearningPicture;
  prompt: string;
  imageType: ImageType;
  /** The student asked for it, so it may be closed unread. */
  asked?: boolean;
}

/** The story of a picture; a character set's first frame alone. */
export function storyFor(
  src: string,
  prompt: string,
  imageType: ImageType,
  frameSize?: FrameSize | null
): LearningStory {
  return {
    picture: {
      src,
      crop: frameSize ? {width: frameSize.x, height: frameSize.y} : undefined,
    },
    prompt,
    imageType,
  };
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
  /** A picture is ready to be shown. The promise resolves once the
      picture's story has been told and closed, or at once when no story is
      due. The caller shows the picture after that. */
  offerStory: (result: GeneratedImageResult) => Promise<void>;
  /** The rating's reasons dialog opened or closed; the story waits while
      it is open. */
  handleAsking: (open: boolean) => void;
  /** The student asked for the story of a picture; it opens at once. */
  tellStory: (story: LearningStory) => void;
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
  // The story waits for a quiet moment: this tab in view, and no rating
  // question open. Until then it is held here.
  const activeRef = useRef(active);
  const askingRef = useRef(false);
  const heldStoryRef = useRef<(() => void) | null>(null);
  // Resolves the promise of the offered story, so the picture waiting
  // behind it can be shown.
  const releasePictureRef = useRef<(() => void) | null>(null);
  const releasePicture = useCallback(() => {
    releasePictureRef.current?.();
    releasePictureRef.current = null;
  }, []);
  // A story still pending when the level changes belongs to the level
  // being left; a return to it is a new visit.
  useEffect(
    () => () => {
      heldStoryRef.current = null;
      toldRef.current = false;
      setStory(null);
      releasePicture();
    },
    [levelId, releasePicture]
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
        return Promise.resolve();
      }
      toldRef.current = true;
      const story = storyFor(
        bytesToDataURI(result.uint8Array, result.mediaType),
        studentFacingTextFor(result.generation),
        result.generation.imageType,
        result.frames?.frameSize
      );
      return new Promise<void>(resolve => {
        releasePictureRef.current = resolve;
        heldStoryRef.current = () => setStory(story);
        tellHeldStory();
      });
    },
    [learning, tellHeldStory]
  );
  // An asked-for telling is the visit's telling: a story still due for the
  // level is dropped, so it neither replaces this one mid-read nor repeats
  // it after.
  const tellStory = useCallback(
    (asked: LearningStory) => {
      heldStoryRef.current = null;
      toldRef.current = true;
      setStory({...asked, asked: true});
      releasePicture();
    },
    [releasePicture]
  );
  const endStory = useCallback(() => {
    setStory(null);
    releasePicture();
  }, [releasePicture]);
  return {story, offerStory, handleAsking, tellStory, endStory};
}
