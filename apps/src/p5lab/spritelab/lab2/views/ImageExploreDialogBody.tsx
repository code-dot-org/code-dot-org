// The image dialog's generate view: the explore scene's parts laid out in
// the dialog's chrome. The picture and Behind the scenes on the left, the
// Type choice and the sentence on the right; the verdict and the buttons
// in the footer.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {GeneratedImageResult} from '../ai/images/imageGeneration';
import {ImageStyle, ImageSubject, ImageType} from '../ai/images/types';

import ImageExploreScene, {ExploreParts} from './explore/ImageExploreScene';
import {NewImageDraft} from './GenerateImageView';
import ImagePaneButton from './ImagePaneButton';

import moduleStyles from './image-details-dialog.module.scss';

interface ImageExploreDialogBodyProps {
  /** Where the Type choice starts, or the type the image is locked to. */
  imageType: ImageType;
  imageSubject?: ImageSubject;
  /** The dialog is making a new image: the Type is the student's choice. */
  typeChoice: boolean;
  defaultStyle: ImageStyle;
  onKeep: (result: GeneratedImageResult) => Promise<void> | void;
  onCancel: () => void;
  /** New image only: open the paint editor on a blank canvas of this kind
      and style; the host names it. */
  onPaintManually?: (draft: Omit<NewImageDraft, 'name'>) => void;
  onGenerateStart?: () => void;
  /** An image level, brand-new image: there is nowhere to cancel to. */
  hideCancel?: boolean;
}

const ImageExploreDialogBody: React.FunctionComponent<
  ImageExploreDialogBodyProps
> = ({
  imageType,
  imageSubject,
  typeChoice,
  defaultStyle,
  onKeep,
  onCancel,
  onPaintManually,
  onGenerateStart,
  hideCancel,
}) => {
  const layout = (parts: ExploreParts) => {
    const result = parts.mode === 'result';
    const generating = parts.mode === 'generating';
    return (
      <>
        <div className={moduleStyles.body}>
          <div className={moduleStyles.exploreColumn}>
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
            className={moduleStyles.explorePanel}
            aria-label="Make your picture"
          >
            {parts.status}
            {parts.typeChoice && (
              <div className={moduleStyles.exploreType}>{parts.typeChoice}</div>
            )}
            {parts.sentence}
            {!result && !generating && (
              <div className={moduleStyles.exploreRow}>
                {parts.styleChoice}
                {parts.animateChoice}
              </div>
            )}
            {parts.error}
            {parts.fact}
          </section>
        </div>
        <div className={moduleStyles.footer}>
          {parts.verdict && (
            <div className={moduleStyles.footerLeft}>{parts.verdict}</div>
          )}
          {!hideCancel && (
            <button
              type="button"
              className={moduleStyles.button}
              disabled={generating}
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          {result ? (
            <>
              <button
                type="button"
                className={moduleStyles.button}
                disabled={parts.busy}
                onClick={parts.changeWords}
              >
                Change words
              </button>
              <button
                type="button"
                className={moduleStyles.button}
                disabled={parts.busy}
                onClick={parts.generate}
              >
                <FontAwesomeV6Icon iconName="sparkles" />
                Generate again
              </button>
              <button
                type="button"
                className={moduleStyles.primaryButton}
                disabled={parts.busy}
                onClick={parts.keep}
              >
                <FontAwesomeV6Icon iconName="check" />
                Keep
              </button>
            </>
          ) : (
            <button
              type="button"
              className={moduleStyles.primaryButton}
              disabled={!parts.complete || parts.busy}
              onClick={parts.generate}
            >
              <FontAwesomeV6Icon iconName="sparkles" />
              {generating ? 'Generating…' : 'Generate'}
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <ImageExploreScene
      imageType={imageType}
      imageSubject={imageSubject}
      defaultStyle={defaultStyle}
      typeChoice={typeChoice}
      animateChoice
      onKeep={onKeep}
      onGenerateStart={onGenerateStart}
      method="explore-dialog"
      layout={layout}
    />
  );
};

export default ImageExploreDialogBody;
