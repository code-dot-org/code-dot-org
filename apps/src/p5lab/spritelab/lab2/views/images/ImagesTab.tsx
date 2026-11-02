// The Images tab: the project's images down the left, the one being worked
// on large in the middle, and the way to make or remake it in a pane at the
// right. A picture is the image the moment it lands; there is no dialog and
// no Keep.

import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import PixelEditor, {
  PixelEditorSaveMeta,
} from '@cdo/apps/pixelEditor/PixelEditor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {imageKindLabel, ImageSubject, ImageType} from '../../ai/images/types';
import {onTrimsUpdated, trimAnimationListImages} from '../../imageTrim';
import {DEFAULT_IMAGE_STYLE} from '../../levelMode';
import {BACKGROUND_GROUND_COLOR, blankPaintImage} from '../../paintBlank';
import EditorStrip from '../components/EditorStrip';
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
import MakePane from './MakePane';
import OwnWorkPane from './OwnWorkPane';
import {listProjectImages, ProjectImage} from './projectImages';
import BehindTheScenes from './teaching/BehindTheScenes';
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
// A drawing left alone this long saves itself.
const IDLE_SAVE_MS = 20_000;
// A pause this long after a stroke saves what is drawn, so the image is the
// project's as it is drawn: the list's tile, the World palette and the next
// run all follow it.
const STROKE_SAVE_MS = 800;
// A pause's save writes the pixels into the project; the file behind them
// goes up at most this often, and when the drawing is done. The project's
// own saving has a throttle of its own.
const UPLOAD_GAP_MS = 5000;

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

/** A drawing in progress: what it writes to, and what the editor opened. */
interface Drawing {
  target: ImageTarget;
  imageUrl: string;
  pixelGridSize?: number;
  recentColors?: PixelEditorSaveMeta['recentColors'];
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

  // A chosen image that is gone (deleted) gives way to the first image
  // left, or to nothing.
  useEffect(() => {
    if (
      chosenId === null ||
      (chosenId === DRAFT_ID && draft) ||
      images.some(image => image.key === chosenId)
    ) {
      return;
    }
    startSession(images[0]?.key ?? null);
  }, [chosenId, draft, images, startSession]);

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
  const handleKeep = useCallback(
    async (result: GeneratedImageResult) => {
      const target: ImageTarget = {
        key: chosenKeyRef.current,
        imageType: result.generation.imageType,
        subject: result.generation.subject,
      };
      await land(target, () => writer.acceptGenerated(target, result));
    },
    [writer, land]
  );

  // Drawing: the pixel editor in the frame, on the image or a blank. The
  // drawing saves itself a pause after each stroke, on Done, and when the
  // tab is left; a blank with no stroke yet is nothing to save.
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  // Strokes since the last save, and the save the editor hands out.
  const dirtyRef = useRef(false);
  const saveRef = useRef<(() => void) | null>(null);
  const idleTimerRef = useRef<number>();
  // One save in flight at a time. A save asked for meanwhile waits as the
  // pending one; each carries the whole picture, so only the latest matters.
  const inFlightRef = useRef(false);
  const pendingRef = useRef<{
    dataURI: string;
    meta: PixelEditorSaveMeta;
  } | null>(null);
  // When the drawing's file last went up, and whether pixels saved since
  // are still owed to it.
  const lastUploadRef = useRef(0);
  const uploadOwedRef = useRef(false);
  const leaveAfterSaveRef = useRef(false);
  const clearIdleTimer = () => {
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = undefined;
  };
  const stopDrawing = useCallback(() => {
    clearIdleTimer();
    dirtyRef.current = false;
    pendingRef.current = null;
    lastUploadRef.current = 0;
    uploadOwedRef.current = false;
    saveRef.current = null;
    leaveAfterSaveRef.current = false;
    setDrawing(null);
  }, []);
  useEffect(() => clearIdleTimer, []);
  // Leaving the level mid-drawing (the panel's Continue, or navigation)
  // unmounts the tab with no Done: whatever the picture is owed goes up
  // now, from the editor's canvas while it still exists.
  useEffect(
    () => () => {
      if (drawingRef.current && (dirtyRef.current || uploadOwedRef.current)) {
        leaveAfterSaveRef.current = true;
        saveRef.current?.();
      }
    },
    []
  );
  // The host's undo and redo go once the drawing ends, or the tab goes; a
  // change of picture within one drawing keeps them.
  const drawingOpen = !!drawing;
  useEffect(() => {
    if (!drawingOpen) {
      return;
    }
    return () => onDrawingHistory?.(null);
  }, [drawingOpen, onDrawingHistory]);
  const startDrawing = useCallback(
    (target: ImageTarget) => {
      const existing = target.key
        ? images.find(image => image.key === target.key)
        : undefined;
      if (existing?.src) {
        setDrawing({
          target,
          imageUrl: existing.src,
          pixelGridSize: existing.props.pixelGridSize,
          recentColors: existing.props.recentColors,
        });
        return;
      }
      const blank = blankPaintImage(target.imageType, DEFAULT_IMAGE_STYLE);
      setDrawing({
        target,
        imageUrl: blank.dataURI,
        pixelGridSize: blank.pixelGridSize,
      });
    },
    [images]
  );
  const noteStroke = useCallback(() => {
    dirtyRef.current = true;
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      if (dirtyRef.current) {
        saveRef.current?.();
      }
    }, STROKE_SAVE_MS);
  }, []);
  // `current` is the drawing as the save knows it: the state, or for a
  // pending save what the save before it made, since React may not have
  // rendered that yet.
  const runSave = useCallback(
    async (dataURI: string, meta: PixelEditorSaveMeta, current: Drawing) => {
      inFlightRef.current = true;
      let saved = current;
      try {
        const settled =
          leaveAfterSaveRef.current && !pendingRef.current && !dirtyRef.current;
        // A new image needs its file; after that the file follows every few
        // seconds, and when the drawing is done.
        const upload =
          !current.target.key ||
          settled ||
          Date.now() - lastUploadRef.current >= UPLOAD_GAP_MS;
        const key = await land(
          current.target,
          () => writer.saveEdited(current.target, dataURI, meta, {upload}),
          false
        );
        if (upload) {
          lastUploadRef.current = Date.now();
        }
        uploadOwedRef.current = !upload;
        // A blank that was saved is an image now: later saves replace it.
        saved = {...current, target: {...current.target, key}};
        setDrawing(d => d && {...d, target: {...d.target, key}});
      } catch {
        // The picture is still on the canvas. It is marked unsaved, so the
        // next pause, Done or leaving the tab tries again from the canvas
        // as it is then; a pending save would only carry older pixels.
        dirtyRef.current = true;
        uploadOwedRef.current = true;
        pendingRef.current = null;
        leaveAfterSaveRef.current = false;
        inFlightRef.current = false;
        return;
      } finally {
        inFlightRef.current = false;
      }
      const pending = pendingRef.current;
      if (pending) {
        pendingRef.current = null;
        await runSave(pending.dataURI, pending.meta, saved);
      } else if (leaveAfterSaveRef.current) {
        stopDrawing();
      }
    },
    [land, writer, stopDrawing]
  );
  const handleDrawingSave = useCallback(
    (dataURI: string, meta: PixelEditorSaveMeta) => {
      const current = drawingRef.current;
      if (!current) {
        return;
      }
      clearIdleTimer();
      dirtyRef.current = false;
      if (inFlightRef.current) {
        pendingRef.current = {dataURI, meta};
        return;
      }
      runSave(dataURI, meta, current);
    },
    [runSave]
  );
  // Done: what is drawn goes up, including pixels a pause's save kept local.
  const finishDrawing = useCallback(() => {
    if (dirtyRef.current || uploadOwedRef.current) {
      leaveAfterSaveRef.current = true;
      saveRef.current?.();
    } else {
      stopDrawing();
    }
  }, [stopDrawing]);
  // Leaving the tab is Done: what was drawn is saved and the tools close.
  useEffect(() => {
    if (!active && drawingRef.current) {
      finishDrawing();
    }
  }, [active, finishDrawing]);
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
  const paintsOwnWork = ownWork && !wordsAsked && editedMode() === 'paint';
  const drawOffered = !!kind && !chosenImage?.sheet && !drawing;
  // Own work opens in the paint tools by itself, and again on return to
  // the tab; Replace image is the one way out.
  const chosenKey = chosenImage?.key;
  const chosenHasSrc = !!chosenImage?.src && !chosenImage.sheet;
  const kindType = kind?.imageType;
  const kindSubject = kind?.subject;
  useEffect(() => {
    if (
      paintsOwnWork &&
      active &&
      !drawingRef.current &&
      chosenKey &&
      chosenHasSrc &&
      kindType
    ) {
      startDrawing({key: chosenKey, imageType: kindType, subject: kindSubject});
    }
  }, [
    paintsOwnWork,
    active,
    chosenKey,
    chosenHasSrc,
    kindType,
    kindSubject,
    startDrawing,
  ]);

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
          if (drawing) {
            finishDrawing();
          }
          // A draft left for an image holds nothing worth keeping.
          if (id !== DRAFT_ID) {
            setDraft(null);
          }
          startSession(id);
        }}
        onNew={
          newOffered
            ? kind => {
                if (drawing) {
                  finishDrawing();
                }
                startDraft(kind.imageType, kind.subject);
              }
            : undefined
        }
        chooseOffered={chooseOffered}
        newKind={lockedKind}
        onDelete={deleteOffered ? writer.deleteImage : undefined}
      />
      {drawing && kind ? (
        <PixelEditor
          imageUrl={drawing.imageUrl}
          knownPixelGrid={drawing.pixelGridSize}
          initialRecentColors={drawing.recentColors}
          opaqueGround={
            drawing.target.imageType === 'background'
              ? BACKGROUND_GROUND_COLOR
              : undefined
          }
          tools={limitedTools ? PAINT_TOOLS : FREEPLAY_TOOLS}
          palette={limitedTools ? PAINT_COLORS : undefined}
          brushSizes={limitedTools ? PAINT_BRUSH_SIZES : FREEPLAY_BRUSH_SIZES}
          toolbarGroups={limitedTools ? PAINT_TOOLBAR : FREEPLAY_TOOLBAR}
          fit="container"
          toolbarLayout="row"
          hostUndoRedo
          onHistoryChange={onDrawingHistory}
          canvasClassName={styles.paintCanvas}
          onEdit={noteStroke}
          onSave={handleDrawingSave}
        >
          {parts => {
            saveRef.current = parts.save;
            return (
              <>
                <ImageFrame
                  image={null}
                  workspaceClassName={styles.paintFrame}
                  above={parts.toolbar}
                  live={
                    <div className={styles.paintStack}>
                      {parts.canvas}
                      {/* The frame's own picture covers the canvas until
                          the editor has decoded it, so a switch never
                          shows a blank. */}
                      {!parts.ready && (
                        <img
                          src={drawing.imageUrl}
                          alt=""
                          className={classNames(
                            styles.paintPlaceholder,
                            drawing.pixelGridSize && styles.pixelArt
                          )}
                        />
                      )}
                    </div>
                  }
                />
                <DrawPane
                  width={paneWidthPx}
                  kind={kind}
                  editing={!!drawing.target.key}
                  edited={parts.edited}
                  paints={editedMode() === 'paint'}
                  headline={
                    chosenImage?.props.edited ? 'Your edited image' : undefined
                  }
                  onDone={finishDrawing}
                  onReplace={() => {
                    finishDrawing();
                    setWordsAsked(true);
                  }}
                />
              </>
            );
          }}
        </PixelEditor>
      ) : kind ? (
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
          method="tab"
          layout={parts => (
            <>
              <ImageFrame
                image={chosenImage}
                live={
                  parts.mode === 'generating' || parts.frameFilled
                    ? parts.frame
                    : undefined
                }
                generating={parts.mode === 'generating'}
                beside={parts.alternatives}
                under={
                  parts.mode === 'generating' ? (
                    <div className={styles.underSteps}>{parts.progress}</div>
                  ) : (
                    parts.underFrame || reopenedBehindTheScenes
                  )
                }
              />
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
              )}
            </>
          )}
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
    </div>
  );
};

export default ImagesTab;
