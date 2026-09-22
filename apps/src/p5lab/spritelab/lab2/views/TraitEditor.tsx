import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {setAnimationTraits} from '@cdo/apps/p5lab/redux/animationList';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ImageAdlibSet, imageAdlibFor} from '../ai/images/imageAdlibs';
import {
  GeneratedImageResult,
  generateImage,
} from '../ai/images/imageGeneration';
import {ImageSafetyError} from '../ai/images/imageSafety';
import {ImageGenerationMetadata, ImageType} from '../ai/images/types';
import {
  adlibIsFilled,
  choicesFromTraits,
  fillAdlib,
} from '../ai/traits/traitAdlib';
import {TraitValues} from '../ai/traits/traitStore';

import TraitFields from './TraitFields';

import moduleStyles from './trait-editor.module.scss';

interface TraitEditorProps {
  animKey: string;
  /** The level's word combos; a feature-bound set draws the redraw prompt. */
  adlibSet?: ImageAdlibSet;
  imageType?: ImageType;
  onAcceptGenerated?: (result: GeneratedImageResult) => Promise<void>;
}

// A redraw keeps the look of the picture it replaces, so a set stays
// visually of a piece as its data changes.
function optionsFrom(generation: ImageGenerationMetadata | undefined) {
  return {
    imageType: generation?.imageType || ('sprite' as const),
    style: generation?.style || ('smooth' as const),
    pixelGrid: generation?.pixelGrid,
  };
}

/** An existing costume's feature values, and a redraw from them. */
const TraitEditor: React.FunctionComponent<TraitEditorProps> = ({
  animKey,
  adlibSet,
  imageType,
  onAcceptGenerated,
}) => {
  const dispatch = useAppDispatch();
  const modelCard = useAppSelector(state => state.spriteLab2?.modelCard);
  const props = useAppSelector(
    state => state.animationList.propsByKey[animKey]
  );
  const traits = props?.traits as TraitValues | undefined;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!modelCard) {
    return (
      <div className={moduleStyles.empty}>
        Choose an AI model in the Images tab to give this image feature values.
      </div>
    );
  }

  const adlib = adlibSet
    ? imageAdlibFor(imageType || 'sprite', adlibSet)
    : undefined;
  const {choices, missing} = choicesFromTraits(adlib, modelCard, {
    costumeTraits: traits,
  });
  const prompt = fillAdlib(adlib, choices);
  const canGenerate = !!onAcceptGenerated && adlibIsFilled(adlib, prompt);

  const generate = async () => {
    if (!onAcceptGenerated) {
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const result = await generateImage(
        prompt,
        optionsFrom(props?.generation)
      );
      await onAcceptGenerated(result);
    } catch (e) {
      if (e instanceof ImageSafetyError) {
        setError(
          e.phase === 'prompt'
            ? "This prompt isn't appropriate for class. Try different words."
            : "The image didn't pass our safety check. Try different words."
        );
      } else {
        console.error('Trait image generation failed:', e);
        setError("Couldn't generate the image. Try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={moduleStyles.editor}>
      <TraitFields
        card={modelCard}
        values={traits}
        disabled={generating}
        onChange={next => {
          setError(null);
          dispatch(setAnimationTraits(animKey, next));
        }}
      />
      <div className={moduleStyles.note}>
        The model predicts {modelCard.labelName}. It is not stored here, so the
        answer stays out of the student&apos;s reach.
      </div>
      {adlib && onAcceptGenerated && (
        <div className={moduleStyles.generateRow}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            disabled={!canGenerate || generating}
            onClick={generate}
          >
            {generating ? 'Drawing…' : 'Draw from features'}
          </MuiButton>
          {canGenerate && <span className={moduleStyles.note}>{prompt}</span>}
          {!!missing.length && (
            <span className={moduleStyles.problem}>
              Set {missing.join(', ')} first.
            </span>
          )}
        </div>
      )}
      {error && <div className={moduleStyles.problem}>{error}</div>}
    </div>
  );
};

export default TraitEditor;
