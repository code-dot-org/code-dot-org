// The image dialog's generate view: the sentence scene's parts laid out in
// the dialog's chrome.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {ImageSource} from '../ai/images/imageCache';
import {GeneratedImageResult} from '../ai/images/imageGeneration';
import {
  imageKindLabel,
  ImageStyle,
  ImageSubject,
  ImageType,
} from '../ai/images/types';

import ImagePaneButton from './ImagePaneButton';
import SentenceScene, {SentenceSceneParts} from './sentence/SentenceScene';

import moduleStyles from './image-details-dialog.module.scss';

/** What a new image has settled on, enough to start painting it. */
export interface NewImageDraft {
  name: string;
  imageType: ImageType;
  subject?: ImageSubject;
  style: ImageStyle;
}

interface SentenceDialogBodyProps {
  /** Where the Type choice starts, or the type the image is locked to. */
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** The dialog is making a new image: the Type is the student's choice. */
  typeChoice: boolean;
  /** Generations the student has left; Generate goes off at none. */
  generationsLeft?: number;
  onKeep: (result: GeneratedImageResult) => Promise<void> | void;
  onCancel: () => void;
  /** New image only: open the paint editor on a blank canvas of this kind
      and style; the host names it. */
  onPaintManually?: (draft: Omit<NewImageDraft, 'name'>) => void;
  onGenerateStart?: () => void;
  /** The level requires a rating on every generated picture; passed through
      to SentenceScene. */
  verdictRequired?: boolean;
  onAwaitingVerdict?: (awaiting: boolean) => void;
  /** Passed through to SentenceScene. */
  imageSource?: ImageSource;
  imageCacheUrl?: string;
}

const SentenceDialogBody: React.FunctionComponent<SentenceDialogBodyProps> = ({
  imageType,
  imageSubject,
  typeChoice,
  generationsLeft,
  onKeep,
  onCancel,
  onPaintManually,
  onGenerateStart,
  verdictRequired,
  onAwaitingVerdict,
  imageSource,
  imageCacheUrl,
}) => {
  const layout = (parts: SentenceSceneParts) => {
    const result = parts.mode === 'result';
    const generating = parts.mode === 'generating';
    // The kind in the sentence at the top, as a dropdown when it is the
    // student's choice.
    const kindLabel = imageKindLabel(
      parts.draft.imageType,
      parts.draft.subject
    ).toLowerCase();
    const article = /^[aeiou]/.test(kindLabel) ? 'an' : 'a';
    return (
      <>
        <div className={moduleStyles.body}>
          {parts.alternatives && (
            <div className={moduleStyles.alternativesColumn}>
              {parts.alternatives}
            </div>
          )}
          <div className={moduleStyles.sentenceColumn}>
            {!parts.frame && onPaintManually ? (
              // The blank pane is itself the way into the paint editor.
              <ImagePaneButton
                iconName="paintbrush"
                label="Paint manually"
                disabled={parts.busy}
                onClick={() => onPaintManually(parts.draft)}
              />
            ) : (
              <div
                className={classNames(
                  moduleStyles.imagePane,
                  parts.frameFilled && moduleStyles.imagePaneChecker
                )}
              >
                {parts.frame}
              </div>
            )}
            {parts.underFrame}
          </div>
          <section
            ref={parts.panelRef}
            tabIndex={-1}
            className={moduleStyles.sentencePanel}
            aria-label="Make your picture"
          >
            {parts.status}
            {!generating && (
              <p className={moduleStyles.sentenceHeadline}>
                {result ? (
                  'AI generated an image based on your prompt.'
                ) : (
                  <>
                    Prompt AI to create {article}{' '}
                    {parts.typeChoice ? (
                      <span className={moduleStyles.sentenceType}>
                        {parts.typeChoice}
                      </span>
                    ) : (
                      kindLabel
                    )}
                  </>
                )}
              </p>
            )}
            {parts.sentence}
            {parts.error}
            {parts.progress}
            {parts.fact}
            {parts.verdict && (
              <div className={moduleStyles.sentenceVerdict}>
                {parts.verdict}
              </div>
            )}
          </section>
        </div>
        <div className={moduleStyles.footer}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            disabled={parts.busy || parts.awaitingVerdict}
            onClick={onCancel}
          >
            Cancel
          </MuiButton>
          {result ? (
            <>
              <MuiButton
                variant="outlined"
                color="secondary"
                size="small"
                disabled={parts.busy}
                onClick={parts.changeWords}
              >
                Modify prompt
              </MuiButton>
              <MuiButton
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<FontAwesomeV6Icon iconName="sparkles" />}
                disabled={parts.busy || parts.exhausted}
                onClick={parts.generate}
              >
                Regenerate
              </MuiButton>
              <MuiButton
                variant="contained"
                color="primary"
                size="small"
                startIcon={<FontAwesomeV6Icon iconName="check" />}
                disabled={parts.busy || parts.awaitingVerdict}
                onClick={parts.keep}
              >
                Keep
              </MuiButton>
            </>
          ) : (
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FontAwesomeV6Icon iconName="sparkles" />}
              disabled={!parts.complete || parts.busy || parts.exhausted}
              onClick={parts.generate}
            >
              {generating ? 'Generating…' : 'Generate'}
            </MuiButton>
          )}
        </div>
      </>
    );
  };

  return (
    <SentenceScene
      imageType={imageType}
      imageSubject={imageSubject}
      typeChoice={typeChoice}
      generationsLeft={generationsLeft}
      verdictRequired={verdictRequired}
      onAwaitingVerdict={onAwaitingVerdict}
      onKeep={onKeep}
      onGenerateStart={onGenerateStart}
      method="dialog"
      layout={layout}
      imageSource={imageSource}
      imageCacheUrl={imageCacheUrl}
    />
  );
};

export default SentenceDialogBody;
