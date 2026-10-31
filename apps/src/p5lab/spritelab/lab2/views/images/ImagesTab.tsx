// The Images tab: the project's images down the left, the one being worked
// on large in the middle, and the way to make or remake it in a pane at the
// right. A picture is the image the moment it lands; there is no dialog and
// no Keep.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import PixelEditor from '@cdo/apps/pixelEditor/PixelEditor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {bytesToDataURI} from '../../ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {imageKindLabel, ImageSubject, ImageType} from '../../ai/images/types';
import {onTrimsUpdated, trimAnimationListImages} from '../../imageTrim';
import {BACKGROUND_GROUND_COLOR} from '../../paintBlank';
import EditorStrip, {EditHistory} from '../components/EditorStrip';
import {
  FREEPLAY_BRUSH_SIZES,
  FREEPLAY_TOOLBAR,
  FREEPLAY_TOOLS,
  PAINT_BRUSH_SIZES,
  PAINT_COLORS,
  PAINT_TOOLBAR,
  PAINT_TOOLS,
} from '../sentence/paintTools';
import SentenceScene from '../sentence/SentenceScene';
import {sentPromptsFor} from '../sentence/sentPrompts';
import {readWordLayout} from '../sentence/wordLayout';

import DrawPane from './DrawPane';
import ImageFrame from './ImageFrame';
import ImageList, {DraftEntry, NewImageKind} from './ImageList';
import LearningDialog, {LearningPicture} from './LearningDialog';
import MakePane from './MakePane';
import OwnWorkPane from './OwnWorkPane';
import PaintPlaceholder from './PaintPlaceholder';
import {listProjectImages, ProjectImage} from './projectImages';
import RatingBar from './RatingBar';
import BehindTheScenes from './teaching/BehindTheScenes';
import useDrawing from './useDrawing';
import useImageWriter, {ImageTarget} from './useImageWriter';

import styles from './images-tab.module.scss';

interface ImagesTabProps {
  uploadImage?: UploadImageFunction;
  /** Drop every reference to a deleted image (called after the removal). */
  onDeleteImage: (name: string) => void;
  /** The level is about one image of this kind: the tab opens on it, or on
      the place it will go. */
  lockedImageType?: ImageType;
  lockedImageSubject?: ImageSubject;
  /** Recorded on every image made here. */
  imageRole?: string;
  /** Generations the student has left on this level; unlimited when
      unset. */
  generationsLeft?: number;
  /** A generation request is leaving. */
  onGenerate?: () => void;
  /** Students may add images and draw on them (free play). */
  editingOffered?: boolean;
  /** The level requires a rating on every generated picture. */
  verdictRequired?: boolean;
  /** The right pane's width, px: the preview column's. */
  paneWidth: number;
  /** A picture became an image: the project should save now. */
  onImageLanded?: () => void;
  /** The tab is the one showing; a drawing saves itself when it is not. */
  active?: boolean;
  /** The drawing's undo and redo, for the host's own buttons; null once
      nothing is being drawn. */
  onDrawingHistory?: (history: EditHistory | null) => void;
}

const DRAFT_ID = 'draft';
// The pane's width before the preview column has reported its own.
export const DEFAULT_PANE_WIDTH = 280;

/** How an image the student drew on is shown. By default it opens in the
    paint tools, as the work it is, with Replace image the way to the
    words. `?images-edited=pane` shows a pane with Replace image and Edit
    this image instead; `?images-edited=generate` keeps the words under
    it, as before either. */
type EditedMode = 'paint' | 'pane' | 'generate';
function editedMode(): EditedMode {
  const value = queryParams('images-edited');
  return value === 'pane' || value === 'generate' ? value : 'paint';
}

// The reveal plays out before the story of how the picture was made.
const LEARNING_DELAY_MS = 1800;
// The kinds the story is told for, once each per project.
const LEARNING_KINDS: ImageType[] = ['sprite', 'background'];

/** The kinds this project has had the story for, kept in the browser. */
function learnedKinds(channelId: string | undefined): Set<string> {
  try {
    const raw = localStorage.getItem(`spritelab2-learned:${channelId ?? ''}`);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function rememberLearned(channelId: string | undefined, kind: string): void {
  try {
    const kinds = learnedKinds(channelId);
    kinds.add(kind);
    localStorage.setItem(
      `spritelab2-learned:${channelId ?? ''}`,
      JSON.stringify([...kinds])
    );
  } catch {
    // Nothing to keep it in: the story is told again next time.
  }
}

const ImagesTab: React.FunctionComponent<ImagesTabProps> = ({
  uploadImage,
  onDeleteImage,
  lockedImageType,
  lockedImageSubject,
  imageRole,
  generationsLeft,
  onGenerate,
  editingOffered,
  verdictRequired,
  paneWidth,
  onImageLanded,
  active = true,
  onDrawingHistory,
}) => {
  const animationList = useAppSelector(state => state.animationList);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  // Thumbnails land as the engine trims; re-list when they do.
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

  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [chosenId, setChosenId] = useState<string | null>(null);
  // Counts sessions: one image's run of generations, which the scene's
  // state lives for. A new image made from the draft keeps its session.
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

  // The level's own image, on a level about one image.
  const ownImage = lockedImageType
    ? imageRole
      ? images.find(image => image.props.role === imageRole)
      : images.find(image => image.imageType === lockedImageType)
    : undefined;
  // Where the tab opens: a level about one image opens on that image when
  // it exists, and otherwise waits for the plus, as free play does; free
  // play opens on the first image, if any.
  const openOnRef = useRef(lockedImageType ? ownImage : images[0]);
  useEffect(() => {
    setChosenId(openOnRef.current?.key ?? null);
  }, []);

  const chosenImage: ProjectImage | null =
    images.find(image => image.key === chosenId) ?? null;
  const chosenDraft = chosenId === DRAFT_ID ? draft : null;
  // The kind the scene makes: the image's own, or the draft's.
  const kind = chosenImage
    ? {imageType: chosenImage.imageType, subject: chosenImage.subject}
    : chosenDraft
    ? {imageType: chosenDraft.imageType, subject: chosenDraft.subject}
    : null;

  // What a landing picture writes to: the chosen image, or a new one of the
  // picture's kind. A ref, so a slow upload lands where it was aimed.
  const chosenKeyRef = useRef(chosenId);
  chosenKeyRef.current = chosenImage?.key ?? null;
  const landedRef = useRef(onImageLanded);
  landedRef.current = onImageLanded;
  // `saveNow`: a made picture is worth a project save of its own; a
  // drawing's saves leave that to the project's own clock.
  const land = useCallback(
    async (
      target: ImageTarget,
      write: () => Promise<string>,
      saveNow = true
    ) => {
      const key = await write();
      if (!target.key) {
        // The student may have moved to another image while the write was
        // out; only a draft still chosen becomes the new image's tile. The
        // choice moves before the draft goes, so no render sees a chosen
        // draft that no longer exists.
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
  const wordLayout = useMemo(() => readWordLayout(), []);
  // While a picture is being made the list holds still: choosing another
  // image would unmount the scene and throw the picture away, after it has
  // been counted against the level's limit.
  const [busy, setBusy] = useState(false);
  // Animated is on until the student turns it off, and stays as they left
  // it from image to image; no image or level turns it off for them.
  const [animated, setAnimated] = useState(true);
  // The story of how the picture was made: told after the first character
  // and the first background a level about one image makes.
  const [learning, setLearning] = useState<{
    picture: LearningPicture;
    prompt: string;
  } | null>(null);
  const learningTimerRef = useRef<number>();
  useEffect(() => () => window.clearTimeout(learningTimerRef.current), []);
  const offerLearning = useCallback(
    (result: GeneratedImageResult) => {
      const {imageType, subject} = result.generation;
      if (
        !lockedImageType ||
        !LEARNING_KINDS.includes(imageType) ||
        subject === 'object' ||
        learnedKinds(channelId).has(imageType)
      ) {
        return;
      }
      rememberLearned(channelId, imageType);
      const src = bytesToDataURI(result.uint8Array, result.mediaType);
      const crop = result.frames
        ? {width: result.frames.frameSize.x, height: result.frames.frameSize.y}
        : undefined;
      learningTimerRef.current = window.setTimeout(
        () =>
          setLearning({
            picture: {src, crop},
            prompt: result.generation.prompt,
          }),
        LEARNING_DELAY_MS
      );
    },
    [lockedImageType, channelId]
  );
  // Once per picture: a verdict's second keep must not tell it again.
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
      await land(target, () => writer.acceptGenerated(target, result));
      if (firstKeep) {
        offerLearning(result);
      }
    },
    [writer, land, offerLearning]
  );

  const tools = useDrawing({
    images,
    saveEdited: writer.saveEdited,
    storePicture: land,
    active,
    onDrawingHistory,
  });
  const {drawing, startDrawing, leaveDrawing, finishDrawing, stopDrawing} =
    tools;
  // A chosen image that is gone (deleted) gives way to the first image
  // left, or to nothing; tools open on it close without saving, since a
  // save would make a new image of the deleted pixels.
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
  const drawingOpen = !!drawing;
  // Free play has every tool; a level before it keeps the few that draw.
  const limitedTools = !editingOffered;
  // Character sets are sheets of frames; the editor paints one image.
  // An image that is the student's own work (no prompt made its pixels)
  // keeps the words that would replace it out of the way until Replace
  // image asks for them; the choice is per image.
  const ownWork = !!chosenImage && !chosenImage.props.generation;
  // Another image, or another tab, puts the guard back.
  const [wordsAsked, setWordsAsked] = useState(false);
  useEffect(() => {
    setWordsAsked(false);
  }, [chosenId, active]);
  const ownWorkPane = ownWork && !wordsAsked && editedMode() === 'pane';
  // Free play paints every image in place, with the words beside the
  // tools, so the student can draw on it or make a picture over it; a
  // level about one image keeps Edit this image and Done.
  const paintsChosen =
    !!chosenImage && editedMode() === 'paint' && !!editingOffered;
  // Where the tools open by themselves, no button offers them.
  const drawOffered =
    !!kind && !chosenImage?.sheet && !drawing && !paintsChosen;
  // The chosen image opens in the paint tools by itself, again on return
  // to the tab, and again once a picture has landed over it.
  const chosenKey = chosenImage?.key;
  const chosenHasSrc = !!chosenImage?.src && !chosenImage.sheet;
  const kindType = kind?.imageType;
  const kindSubject = kind?.subject;
  useEffect(() => {
    if (
      paintsChosen &&
      active &&
      !drawingOpen &&
      chosenKey &&
      chosenHasSrc &&
      kindType
    ) {
      startDrawing({key: chosenKey, imageType: kindType, subject: kindSubject});
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
  // A picture landing over what is being painted (the image, or a blank)
  // makes the picture the pixels; the tools close without saving the old
  // ones over it.
  const landedOverPainting =
    !!drawing &&
    editedMode() === 'paint' &&
    !!editingOffered &&
    !!chosenImage?.props.generation &&
    chosenImage.props.generation !== tools.openedOnGeneration &&
    (drawing.target.key === chosenImage.key || drawing.target.key === null);
  const {abandonDrawing} = tools;
  useEffect(() => {
    if (landedOverPainting) {
      abandonDrawing();
    }
  }, [landedOverPainting, abandonDrawing]);

  const deleteOffered = !!editingOffered;
  // A level about one image offers the plus until that image exists, with
  // only its own kind on; free play offers every kind, always.
  const lockedKind: NewImageKind | undefined = lockedImageType
    ? {
        imageType: lockedImageType,
        subject: lockedImageType === 'sprite' ? lockedImageSubject : undefined,
      }
    : undefined;
  const newOffered = !!editingOffered || (!!lockedKind && !ownImage);
  // A level about one image keeps the choice on that image, or on the
  // slot it will take: the project's other images are shown but off.
  const chooseOffered = !lockedKind;
  const lockedKindLabel = lockedKind
    ? imageKindLabel(lockedKind.imageType, lockedKind.subject).toLowerCase()
    : '';
  const kindArticle = /^[aeiou]/.test(lockedKindLabel) ? 'an' : 'a';
  const paneWidthPx = paneWidth || DEFAULT_PANE_WIDTH;
  // An AI-made image opened again offers the way behind the scenes too,
  // rebuilt from what the image remembers of its making.
  const generation = chosenImage?.props.generation;
  const reopenedBehindTheScenes = generation && (
    <BehindTheScenes
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
        !!chosenImage?.sheet,
        generation.bodyPlan
      )}
      disabled={busy}
    />
  );

  return (
    <div className={styles.tab}>
      <div className={styles.panelHeader} style={{width: paneWidthPx}}>
        <EditorStrip title="AI" />
      </div>
      <ImageList
        disabled={busy}
        images={images}
        draft={draft}
        chosenId={chosenId}
        onChoose={id => {
          if (id === chosenId) {
            return;
          }
          // Where the tools open by themselves, open them with the image,
          // so no frame shows it without them.
          const next = images.find(image => image.key === id);
          const drawsNext =
            !!next?.src &&
            !next.sheet &&
            editedMode() === 'paint' &&
            !!editingOffered;
          if (drawing) {
            leaveDrawing(drawsNext);
          }
          // A draft left for an image holds nothing worth keeping.
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
      {kind ? (
        <SentenceScene
          key={session}
          imageType={kind.imageType}
          imageSubject={kind.subject}
          typeChoice={false}
          initialChoices={
            chosenImage?.props.generation?.choices && {
              sentenceId: chosenImage.props.generation.sentenceId,
              choices: chosenImage.props.generation.choices,
            }
          }
          initialAnimated={animated}
          onAnimatedChange={setAnimated}
          generationsLeft={generationsLeft}
          verdictRequired={verdictRequired}
          onGenerateStart={onGenerate}
          onBusyChange={setBusy}
          onKeep={handleKeep}
          keepOnResult
          wordLayout={wordLayout}
          singleStep
          compactBehindTheScenes
          method="tab"
          layout={parts => {
            const generating = parts.mode === 'generating';
            const frame = (live?: React.ReactNode, above?: React.ReactNode) => (
              <ImageFrame
                image={chosenImage}
                workspaceClassName={live ? styles.paintFrame : undefined}
                above={above}
                live={
                  generating
                    ? parts.frame
                    : live ?? (parts.frameFilled ? parts.frame : undefined)
                }
                generating={generating}
                beside={parts.alternatives}
                under={
                  generating ? (
                    <div className={styles.underSteps}>{parts.progress}</div>
                  ) : (
                    parts.underFrame || reopenedBehindTheScenes
                  parts.mode === 'generating' && (
                    <div className={styles.underSteps}>{parts.progress}</div>
                  )
                }
                overlay={
                  parts.rating.offered && (
                    <RatingBar
                      verdict={parts.rating.verdict}
                      onJudge={parts.rating.judge}
                      onReasons={parts.rating.explain}
                      disabled={parts.busy}
                    />
                  )
                }
              />
            );
            const words = (
              <MakePane
                parts={parts}
                width={paneWidthPx}
                replaces={!!chosenImage}
                regenerate={!!chosenImage?.props.generation}
                onDraw={
                  drawOffered
                    ? () => {
                        setWordsAsked(false);
                        startDrawing({
                          key: chosenImage?.key ?? null,
                          imageType: parts.draft.imageType,
                          subject: parts.draft.subject,
                        });
                      }
                    : undefined
                }
                drawLabel={chosenImage ? 'Edit this image' : 'Draw my own'}
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
                            {/* The canvas being left, or the frame's own
                                picture, covers the canvas until the editor
                                has decoded it, so a switch never shows a
                                blank. */}
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
                          generating ? undefined : editor.toolbar
                        )}
                        {editingOffered && editedMode() === 'paint' ? (
                          words
                        ) : (
                          <DrawPane
                            width={paneWidthPx}
                            kind={kind}
                            editing={!!drawing.target.key}
                            edited={editor.edited}
                            onDone={finishDrawing}
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
                    width={paneWidthPx}
                    edited={!!chosenImage.props.edited}
                    disabled={parts.busy}
                    onGenerate={() => setWordsAsked(true)}
                    onDraw={
                      drawOffered
                        ? () =>
                            startDrawing({
                              key: chosenImage.key,
                              imageType: parts.draft.imageType,
                              subject: parts.draft.subject,
                            })
                        : undefined
                    }
                  />
                ) : (
                  words
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
            style={{width: paneWidthPx}}
            aria-label="Make your picture"
          >
            <p className={styles.headline}>
              {newOffered
                ? `Press + to make ${lockedKind ? kindArticle : 'an'} ${
                    lockedKind ? lockedKindLabel : 'image'
                  }.`
                : 'This level has no images to make.'}
            </p>
          </section>
        </>
      )}
      {learning && (
        <LearningDialog
          picture={learning.picture}
          prompt={learning.prompt}
          onDone={() => setLearning(null)}
        />
      )}
    </div>
  );
};

export default ImagesTab;
