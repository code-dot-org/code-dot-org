// The Images tab: the project's images down the left, the one being worked
// on large in the middle, and the AI panel at the right with the words to
// make or remake it. A generated or drawn picture is written to the project
// as soon as it is ready; the student does not confirm it.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {ImageSource} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {
  ImageKind,
  imageKindPhrase,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {
  CHARACTER_STRIP_FRAME_COUNT,
  CHARACTER_STRIP_POSES,
  standingFrameIndex,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {
  onTrimsUpdated,
  trimAnimationListImages,
} from '@cdo/apps/p5lab/spritelab/lab2/imageTrim';
import {BACKGROUND_GROUND_COLOR} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';
import EditorStrip, {
  EditHistory,
} from '@cdo/apps/p5lab/spritelab/lab2/views/components/EditorStrip';
import {
  FREEPLAY_BRUSH_SIZES,
  FREEPLAY_TOOLBAR,
  FREEPLAY_TOOLS,
  PAINT_BRUSH_SIZES,
  PAINT_COLORS,
  PAINT_TOOLBAR,
  PAINT_TOOLS,
} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/paintTools';
import SentenceScene from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene';
import {readWordLayout} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/wordLayout';
import PixelEditor from '@cdo/apps/pixelEditor/PixelEditor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import AdvancedPopover, {
  AdvancedSettings,
  DEFAULT_ADVANCED,
} from './AdvancedPopover';
import DrawPane from './DrawPane';
import FrameRow from './FrameRow';
import {FRAME_LABELS, frameGroups} from './frames';
import ImageFrame from './ImageFrame';
import ImageList, {DraftEntry} from './ImageList';
import {currentPixels} from './imagePixels';
import MakePane from './MakePane';
import OwnWorkPane from './OwnWorkPane';
import PaintPlaceholder from './PaintPlaceholder';
import {listProjectImages, ProjectImage} from './projectImages';
import LearningDialog from './teaching/LearningDialog';
import RatingBar from './teaching/RatingBar';
import ReopenedBehindTheScenes from './teaching/ReopenedBehindTheScenes';
import useLearningStory from './teaching/useLearningStory';
import useDrawing from './useDrawing';
import useImageWriter, {ImageTarget} from './useImageWriter';

import styles from './images-tab.module.scss';

interface ImagesTabProps {
  uploadImage?: UploadImageFunction;
  /** Drop every reference to a deleted image (called after the removal). */
  onDeleteImage: (name: string) => void;
  /** Set on a level whose task is one image of this type. The tab opens on
      that image, or on an empty slot for it until it is made. */
  lockedImageType?: ImageType;
  lockedImageSubject?: ImageSubject;
  /** Recorded on every image made here. */
  imageRole?: string;
  /** An image of the level's type was made on this visit. Until then the
      plus is offered, so a student back on a level they did can make
      another. */
  ownImageMade?: boolean;
  /** The level tells how AI made the image (level mode `learning`). */
  learning?: boolean;
  /** The level being visited; a new level is a new visit. */
  levelId?: number;
  /** Generations the student has left on this level; unlimited when
      unset. */
  generationsLeft?: number;
  /** Called when a generation request is sent to the model. */
  onGenerate?: () => void;
  /** Students may add images and draw on them (free play). */
  editingOffered?: boolean;
  /** Width of the right pane in px; it equals the preview column's width
      so the pane sits under that column's header. */
  paneWidth: number;
  /** A generated or drawn picture has just been stored as a project image;
      the host should save the project now. */
  onImageLanded?: () => void;
  /** The tab is the one showing; a drawing saves itself when it is not. */
  active?: boolean;
  /** The drawing's undo and redo, for the host's own buttons; null once
      nothing is being drawn. */
  onDrawingHistory?: (history: EditHistory | null) => void;
  /** The advanced settings, for authors. */
  advancedOffered?: boolean;
  /** The level checks that the picture was rated: the rating strip stays
      until a thumb is given. */
  ratingRequired?: boolean;
  /** Where a sentence's picture comes from (imageCache.ts); the tree first
      when unset. */
  imageSource?: ImageSource;
  /** Another tree to read cached pictures from (QA). */
  imageCacheUrl?: string;
}

const DRAFT_ID = 'draft';

/** How an image the student drew on is shown. Default: it opens in the
    paint tools with the word menus beside them. `?images-edited=pane`
    shows a pane with Replace image and Edit this image buttons instead;
    `?images-edited=generate` shows the word menus under the image. */
type EditedMode = 'paint' | 'pane' | 'generate';
function readEditedMode(): EditedMode {
  const value = queryParams('images-edited');
  return value === 'pane' || value === 'generate' ? value : 'paint';
}

const ImagesTab: React.FunctionComponent<ImagesTabProps> = ({
  uploadImage,
  onDeleteImage,
  lockedImageType,
  lockedImageSubject,
  imageRole,
  ownImageMade,
  learning,
  levelId,
  generationsLeft,
  onGenerate,
  editingOffered,
  paneWidth,
  onImageLanded,
  active = true,
  onDrawingHistory,
  advancedOffered,
  ratingRequired,
  imageSource,
  imageCacheUrl,
}) => {
  const animationList = useAppSelector(state => state.animationList);
  // The engine trims each image after it loads and stores a thumbnail; the
  // list is rebuilt when one arrives.
  const [trimVersion, setTrimVersion] = useState(0);
  useEffect(() => onTrimsUpdated(() => setTrimVersion(v => v + 1)), []);
  useEffect(() => {
    trimAnimationListImages(animationList);
  }, [animationList]);
  const images = useMemo(
    () => listProjectImages(animationList),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationList, trimVersion]
  );
  const writer = useImageWriter({uploadImage, imageRole, onDeleteImage});
  const editedMode = useMemo(() => readEditedMode(), []);
  const wordLayout = useMemo(() => readWordLayout(), []);
  // Free play paints every image in place, with the word menus beside the
  // tools, so the student can draw on it or make a picture over it.
  const paintsInPlace = editedMode === 'paint' && !!editingOffered;

  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);
  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [chosenId, setChosenId] = useState<string | null>(null);
  // A session is one image's run of generations. The sentence scene is
  // remounted, and its state reset, when this number changes.
  const [session, setSession] = useState(0);
  const startSession = useCallback(
    (id: string | null) => {
      writer.endSession();
      setChosenId(id);
      setSession(s => s + 1);
    },
    [writer]
  );
  const startDraft = useCallback(
    (imageType: ImageType, subject?: ImageSubject) => {
      setDraft({id: DRAFT_ID, imageType, subject});
      startSession(DRAFT_ID);
    },
    [startSession]
  );

  // On a level whose task is one image: the newest such image, when one
  // exists (the list is newest first), as the dropdowns' role defaults
  // pick it.
  const ownImage = lockedImageType
    ? images.find(image =>
        imageRole
          ? image.props.role === imageRole
          : image.imageType === lockedImageType
      )
    : undefined;
  // The opening choice is read once at mount; a later change to the list
  // must not move the choice.
  const openOnRef = useRef(lockedImageType ? ownImage : images[0]);
  useEffect(() => {
    setChosenId(openOnRef.current?.key ?? null);
  }, []);

  const chosenImage: ProjectImage | null =
    images.find(image => image.key === chosenId) ?? null;
  const chosenDraft = chosenId === DRAFT_ID ? draft : null;
  // A sprite with no recorded subject (drawn by hand, or edited since it
  // was made) takes the level's subject when it is of the level's image
  // type.
  const sceneKind: ImageKind | null = chosenImage
    ? {
        imageType: chosenImage.imageType,
        subject:
          chosenImage.subject ??
          (chosenImage.imageType === lockedImageType
            ? lockedImageSubject
            : undefined),
      }
    : chosenDraft
    ? {imageType: chosenDraft.imageType, subject: chosenDraft.subject}
    : null;

  // The image a finished picture is written to. A ref, because storePicture
  // is memoized and would otherwise hold the choice from the render that
  // made it.
  const chosenKeyRef = useRef(chosenId);
  chosenKeyRef.current = chosenImage?.key ?? null;
  const landedRef = useRef(onImageLanded);
  landedRef.current = onImageLanded;
  // `saveNow`: a generated picture triggers an immediate project save; a
  // drawing's saves wait for the project's throttled save.
  const storePicture = useCallback(
    async (
      target: ImageTarget,
      write: () => Promise<string>,
      saveNow = true
    ) => {
      const key = await write();
      if (!target.key) {
        // The student may have moved to another image while the upload was
        // in progress; only a draft still chosen becomes the new image's
        // tile. The choice moves before the draft goes, so no render sees
        // a chosen draft that no longer exists.
        setChosenId(id => (id === DRAFT_ID ? key : id));
        setDraft(null);
      }
      if (saveNow) {
        landedRef.current?.();
      }
      return key;
    },
    []
  );
  // While a picture is being made the list holds still: choosing another
  // image would unmount the scene and throw the picture away, after it has
  // been counted against the level's limit.
  const [busy, setBusy] = useState(false);
  // Animated is on until the student turns it off, and stays as they left
  // it from image to image; no image or level turns it off for them.
  const [animated, setAnimated] = useState(true);
  const {story, offerStory, handleAsking, endStory} = useLearningStory({
    active,
    learning,
    levelId,
  });
  // Rating a picture keeps it a second time; the story is offered only on
  // the first keep of each picture.
  const keptRef = useRef<string | null>(null);
  const handleKeep = useCallback(
    async (result: GeneratedImageResult) => {
      const target: ImageTarget = {
        key: chosenKeyRef.current,
        imageType: result.generation.imageType,
        subject: result.generation.subject,
      };
      const firstKeep = keptRef.current !== result.filename;
      keptRef.current = result.filename;
      await storePicture(target, () => writer.acceptGenerated(target, result));
      if (firstKeep) {
        offerStory(result);
      }
    },
    [writer, storePicture, offerStory]
  );

  const tools = useDrawing({
    images,
    saveEdited: writer.saveEdited,
    storePicture,
    active,
    onDrawingHistory,
  });
  const {drawing, startDrawing, leaveDrawing, stopDrawing} = tools;
  // When the chosen image has been deleted, choose the first image left, or
  // none; tools open on it close without saving, since a save would create
  // a new image from the deleted pixels.
  useEffect(() => {
    if (
      chosenId === null ||
      (chosenId === DRAFT_ID && draft) ||
      images.some(image => image.key === chosenId)
    ) {
      return;
    }
    if (drawing?.target.key === chosenId) {
      stopDrawing();
    }
    startSession(images[0]?.key ?? null);
  }, [chosenId, draft, images, startSession, stopDrawing, drawing]);
  // A level before free play keeps the few tools that draw.
  const limitedTools = !editingOffered;
  // An image that is the student's own work (no prompt made its pixels)
  // hides the word menus until Replace image is pressed; the choice is per
  // image, and choosing another image or leaving the tab hides them again.
  const ownWork = !!chosenImage && !chosenImage.props.generation;
  const [wordMenusRequested, setWordMenusRequested] = useState(false);
  useEffect(() => {
    setWordMenusRequested(false);
  }, [chosenId, active]);
  const ownWorkPane = ownWork && !wordMenusRequested && editedMode === 'pane';
  const paintsChosen = !!chosenImage && paintsInPlace;
  // The frame of a character set picked in the row under the frame; the
  // tools open on it, and a pick while they are open is kept for after.
  const [restPick, setRestPick] = useState<{
    key: string;
    index: number;
  } | null>(null);
  const restFrame =
    restPick && restPick.key === chosenImage?.key ? restPick.index : null;
  const restFrameRef = useRef(restFrame);
  restFrameRef.current = restFrame;
  // Where the tools open by themselves, no button offers them.
  const drawOffered = !!sceneKind && !drawing && !paintsChosen;
  // The chosen image opens in the paint tools by itself, again on return
  // to the tab, and again once a picture has landed over it.
  const chosenKey = chosenImage?.key;
  const chosenHasSrc = !!chosenImage?.src;
  const kindType = sceneKind?.imageType;
  const kindSubject = sceneKind?.subject;
  const drawingOpen = !!drawing;
  useEffect(() => {
    if (
      paintsChosen &&
      active &&
      !drawingOpen &&
      chosenKey &&
      chosenHasSrc &&
      kindType
    ) {
      startDrawing(
        {key: chosenKey, imageType: kindType, subject: kindSubject},
        restFrameRef.current ?? undefined
      );
    }
  }, [
    paintsChosen,
    active,
    drawingOpen,
    chosenKey,
    chosenHasSrc,
    kindType,
    kindSubject,
    startDrawing,
  ]);
  // A generated picture replacing the image (or blank) being drawn on
  // becomes the image's pixels; the tools close without saving the drawn
  // pixels over it.
  const landedOverPainting =
    !!drawing &&
    paintsInPlace &&
    !!chosenImage?.props.generation &&
    chosenImage.props.generation !== tools.openedOnGeneration &&
    (drawing.target.key === chosenImage.key || drawing.target.key === null);
  const {abandonDrawing} = tools;
  useEffect(() => {
    if (landedOverPainting) {
      abandonDrawing();
    }
  }, [landedOverPainting, abandonDrawing]);

  // While the tools are open on the chosen set, its frames come from their
  // copy of the frames image, which holds the unsaved frames. The tools can
  // still be open on the image chosen before, for the moment the switch
  // takes.
  const drawingSheet =
    drawing && chosenImage && drawing.target.key === chosenImage.key
      ? drawing.sheet
      : undefined;
  const sheet = drawingSheet ?? chosenImage?.sheet;
  const sheetCount = drawingSheet?.count ?? CHARACTER_STRIP_FRAME_COUNT;
  const shownFrame =
    drawingSheet?.index ??
    restFrame ??
    standingFrameIndex(sheet?.poses ?? CHARACTER_STRIP_POSES);
  const shownPose =
    sheet &&
    frameGroups(sheet.poses, sheetCount).find(group =>
      group.frames.includes(shownFrame)
    )?.key;

  const deleteOffered = !!editingOffered;
  // On a level whose task is one image, the plus is shown until that image
  // is made on this visit, and its menu enables only that kind. In free
  // play every kind is enabled.
  const lockedKind: ImageKind | undefined = lockedImageType
    ? {
        imageType: lockedImageType,
        subject: lockedImageType === 'sprite' ? lockedImageSubject : undefined,
      }
    : undefined;
  const newOffered = !!editingOffered || (!!lockedKind && !ownImageMade);
  // A level about one image keeps the choice on that image, or on the slot
  // it will take; the project's other tiles are listed but disabled.
  const chooseOffered = !lockedKind;

  return (
    <div className={styles.tab}>
      <div className={styles.panelHeader} style={{width: paneWidth}}>
        <EditorStrip title="AI" />
      </div>
      <ImageList
        disabled={busy}
        images={images}
        playing={
          sheet && chosenImage && shownPose
            ? {key: chosenImage.key, sheet, only: shownPose}
            : undefined
        }
        draft={draft}
        chosenId={chosenId}
        onChoose={id => {
          if (id === chosenId) {
            return;
          }
          // Where the tools open by themselves, open them with the image,
          // so no frame shows it without them.
          const next = images.find(image => image.key === id);
          const drawsNext = !!next?.src && paintsInPlace;
          if (drawing) {
            leaveDrawing(drawsNext);
          }
          // Choosing an existing image discards the draft; a draft has no
          // picture yet.
          if (id !== DRAFT_ID) {
            setDraft(null);
          }
          startSession(id);
          if (next && drawsNext) {
            startDrawing({
              key: id,
              imageType: next.imageType,
              subject:
                next.subject ??
                (next.imageType === lockedImageType
                  ? lockedImageSubject
                  : undefined),
            });
          }
        }}
        onNew={
          newOffered
            ? kind => {
                if (drawing) {
                  leaveDrawing();
                }
                startDraft(kind.imageType, kind.subject);
              }
            : undefined
        }
        chooseOffered={chooseOffered}
        newKind={lockedKind}
        onDelete={deleteOffered ? writer.deleteImage : undefined}
      />
      {sceneKind ? (
        <SentenceScene
          key={session}
          imageType={sceneKind.imageType}
          imageSubject={sceneKind.subject}
          initialChoices={
            chosenImage?.props.generation?.choices && {
              sentenceId: chosenImage.props.generation.sentenceId,
              choices: chosenImage.props.generation.choices,
            }
          }
          initialAnimated={animated}
          onAnimatedChange={setAnimated}
          ratingRequired={ratingRequired}
          generationsLeft={generationsLeft}
          onGenerateStart={onGenerate}
          onBusyChange={setBusy}
          onKeep={handleKeep}
          wordLayout={wordLayout}
          compactBehindTheScenes
          imageSource={imageSource}
          imageCacheUrl={imageCacheUrl}
          advanced={
            advancedOffered
              ? {
                  prompt: advanced.prompt,
                  pixelScale: advanced.pixelScale,
                  startFrom:
                    advanced.startFrom && chosenImage
                      ? () => currentPixels(chosenImage.props)
                      : undefined,
                }
              : undefined
          }
          method="tab"
          stillFrame={shownFrame}
          layout={parts => {
            const generating = parts.mode === 'generating';
            const frameRow = sheet && (
              <FrameRow
                sheetSrc={sheet.src}
                frameSize={sheet.frameSize}
                poses={sheet.poses}
                count={sheetCount}
                selected={shownFrame}
                onSelect={index => {
                  if (chosenImage) {
                    setRestPick({key: chosenImage.key, index});
                  }
                  if (drawingSheet) {
                    tools.selectFrame(index);
                  }
                }}
                disabled={!drawingSheet && parts.busy}
              />
            );
            const frame = (
              live?: React.ReactNode,
              above?: React.ReactNode,
              under: React.ReactNode = frameRow
            ) => (
              <ImageFrame
                image={chosenImage}
                frame={shownFrame}
                workspaceClassName={live ? styles.paintFrame : undefined}
                above={above}
                live={
                  generating
                    ? parts.frame
                    : live ?? (parts.frameFilled ? parts.frame : undefined)
                }
                generating={generating}
                tip={generating ? parts.tip : undefined}
                under={generating ? undefined : under}
                overlay={
                  <>
                    {parts.cachedTag}
                    {parts.rating.offered && (
                      <RatingBar
                        verdict={parts.rating.verdict}
                        onJudge={parts.rating.judge}
                        onReasons={parts.rating.explain}
                        onAsking={handleAsking}
                        onDismiss={
                          parts.rating.required
                            ? undefined
                            : parts.rating.dismiss
                        }
                        disabled={parts.busy}
                      />
                    )}
                  </>
                }
              />
            );
            const makePane = (
              <MakePane
                parts={parts}
                width={paneWidth}
                replaces={!!chosenImage}
                regenerate={!!chosenImage?.props.generation}
                onDraw={
                  drawOffered
                    ? () => {
                        setWordMenusRequested(false);
                        startDrawing(
                          {
                            key: chosenImage?.key ?? null,
                            imageType: parts.draft.imageType,
                            subject: parts.draft.subject,
                          },
                          restFrame ?? undefined
                        );
                      }
                    : undefined
                }
                drawLabel={chosenImage ? 'Edit this image' : 'Draw my own'}
                extra={
                  <>
                    {/* The Behind the scenes button sits in this header:
                        the scene's for a picture made this session, one
                        rebuilt from the stored generation record for a
                        reopened image. */}
                    {!parts.behindTheScenes && chosenImage && (
                      <ReopenedBehindTheScenes
                        image={chosenImage}
                        disabled={busy}
                      />
                    )}
                    {advancedOffered && (
                      <AdvancedPopover
                        imageType={parts.draft.imageType}
                        settings={advanced}
                        onChange={setAdvanced}
                        hasImage={!!chosenImage}
                        disabled={parts.busy}
                      />
                    )}
                  </>
                }
              />
            );
            if (drawing) {
              return (
                <PixelEditor
                  imageUrl={drawing.imageUrl}
                  onReady={tools.releasePlaceholder}
                  knownPixelGrid={drawing.pixelGridSize}
                  initialRecentColors={drawing.recentColors}
                  opaqueGround={
                    drawing.target.imageType === 'background'
                      ? BACKGROUND_GROUND_COLOR
                      : undefined
                  }
                  tools={limitedTools ? PAINT_TOOLS : FREEPLAY_TOOLS}
                  palette={limitedTools ? PAINT_COLORS : undefined}
                  brushSizes={
                    limitedTools ? PAINT_BRUSH_SIZES : FREEPLAY_BRUSH_SIZES
                  }
                  toolbarGroups={
                    limitedTools ? PAINT_TOOLBAR : FREEPLAY_TOOLBAR
                  }
                  fit="container"
                  toolbarLayout="row"
                  hostUndoRedo
                  onHistoryChange={onDrawingHistory}
                  canvasClassName={styles.paintCanvas}
                  onEdit={tools.scheduleStrokeSave}
                  onSave={tools.handleSave}
                >
                  {editor => {
                    tools.attachEditor(editor);
                    return (
                      <>
                        {frame(
                          <div className={styles.paintStack}>
                            {editor.canvas}
                            {!editor.ready && (
                              <PaintPlaceholder
                                picture={tools.placeholderPicture}
                                src={drawing.imageUrl}
                                pixelated={!!drawing.pixelGridSize}
                              />
                            )}
                          </div>,
                          // The tools stay mounted with their drawing while
                          // a picture is made over it, out of sight.
                          generating ? undefined : (
                            <>
                              {editor.toolbar}
                              {tools.saveFailed && (
                                <p role="alert" className={styles.saveNotice}>
                                  Your drawing could not be saved. It will be
                                  tried again.
                                </p>
                              )}
                            </>
                          ),
                          frameRow
                        )}
                        {paintsInPlace ? (
                          makePane
                        ) : (
                          <DrawPane
                            width={paneWidth}
                            kind={sceneKind}
                            frameLabel={
                              drawing.sheet
                                ? FRAME_LABELS[drawing.sheet.index]
                                : undefined
                            }
                            editing={!!drawing.target.key}
                            edited={editor.edited}
                            onDone={tools.finishDrawing}
                          />
                        )}
                      </>
                    );
                  }}
                </PixelEditor>
              );
            }
            return (
              <>
                {frame()}
                {ownWorkPane && chosenImage ? (
                  <OwnWorkPane
                    width={paneWidth}
                    edited={!!chosenImage.props.edited}
                    disabled={parts.busy}
                    onGenerate={() => setWordMenusRequested(true)}
                    onDraw={
                      drawOffered
                        ? () =>
                            startDrawing(
                              {
                                key: chosenImage.key,
                                imageType: parts.draft.imageType,
                                subject: parts.draft.subject,
                              },
                              restFrame ?? undefined
                            )
                        : undefined
                    }
                  />
                ) : (
                  makePane
                )}
              </>
            );
          }}
        />
      ) : (
        <>
          <ImageFrame image={null} />
          <section
            className={styles.pane}
            style={{width: paneWidth}}
            aria-label="Make your picture"
          >
            <p className={styles.headline}>
              {newOffered
                ? `Press + to make ${
                    lockedKind
                      ? imageKindPhrase(
                          lockedKind.imageType,
                          lockedKind.subject
                        )
                      : 'an image'
                  }.`
                : 'This level has no images to make.'}
            </p>
          </section>
        </>
      )}
      {story && (
        <LearningDialog
          // A new story opens on its first panel.
          key={story.picture.src}
          picture={story.picture}
          prompt={story.prompt}
          imageType={story.imageType}
          onDone={endStory}
        />
      )}
    </div>
  );
};

export default ImagesTab;
