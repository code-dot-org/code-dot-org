import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {setAnimationTraits} from '@cdo/apps/p5lab/redux/animationList';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  GeneratedImageResult,
  generateImage,
} from '../ai/images/imageGeneration';
import {ImageSafetyError} from '../ai/images/imageSafety';
import {ImageGenerationMetadata} from '../ai/images/types';
import {fillTraitPrompt, promptIsUsable} from '../ai/traits/traitPrompt';
import {TraitValues} from '../ai/traits/traitStore';

import TraitFields from './TraitFields';

import moduleStyles from './trait-editor.module.scss';

interface TraitEditorProps {
  animKey: string;
  /** Image prompt with {Feature name} placeholders. */
  promptTemplate?: string;
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
  promptTemplate,
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

  const fill = fillTraitPrompt(promptTemplate || '', modelCard, {
    costumeTraits: traits,
  });
  const canGenerate =
    !!promptTemplate && !!onAcceptGenerated && promptIsUsable(fill);

  const generate = async () => {
    if (!onAcceptGenerated) {
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const result = await generateImage(
        fill.prompt,
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
      {promptTemplate && onAcceptGenerated && (
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
          {canGenerate && (
            <span className={moduleStyles.note}>{fill.prompt}</span>
          )}
          {!!fill.missing.length && (
            <span className={moduleStyles.problem}>
              Set {fill.missing.join(', ')} first.
            </span>
          )}
          {!!fill.unknown.length && (
            <span className={moduleStyles.problem}>
              The prompt asks for {fill.unknown.join(', ')}, which{' '}
              {modelCard.name} does not have.
            </span>
          )}
        </div>
      )}
      {error && <div className={moduleStyles.problem}>{error}</div>}
    </div>
  );
};

export default TraitEditor;
