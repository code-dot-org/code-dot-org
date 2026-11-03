// The Images tab: the project's images down the left, the one being worked
// on large in the middle, and the way to make or remake it in a pane at the
// right. A picture is the image the moment it lands; there is no dialog and
// no Keep.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {toImage} from '@cdo/apps/imageUtils';
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
import PaintPlaceholder from './PaintPlaceholder';
import {ImageProps, listProjectImages, ProjectImage} from './projectImages';
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

/** Loads and decodes a picture, for the frame to paint at once; a failure
    is left for the editor, which loads the same picture, to report. */
async function warmImage(src: string): Promise<HTMLImageElement | undefined> {
  try {
    const image = await toImage(src);
    await image.decode?.();
    return image;
  } catch {
    return undefined;
  }
}

const DRAFT_ID = 'draft';
// The pane's width before the preview column has reported its own.
export const DEFAULT_PANE_WIDTH = 280;
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
  /** Tells a save in flight which drawing it belongs to; a later drawing
      is left alone. */
  id: number;
  target: ImageTarget;
  imageUrl: string;
  /** The picture decoded ahead, shown over the canvas until the tools
      have their own copy. */
  picture?: HTMLImageElement;
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
    current: Drawing;
    final: boolean;
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
  // The making the image had when the tools opened: a different one
  // arriving means a picture landed over the painting.
  const drawingGenerationRef = useRef<ImageProps['generation']>();
  const drawingIdRef = useRef(0);
  // The canvas as it was when its image was left for another, checker and
  // all, shown until the next image's tools have painted; a fresh editor's
  // canvas is empty, and the frame's own bright checker would show through
  // the picture's transparent pixels. Remembers which drawing it left.
  const paintStackRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<{canvas: HTMLCanvasElement; id: number} | null>(
    null
  );
  const startDrawing = useCallback(
    async (target: ImageTarget) => {
      const existing = target.key
        ? images.find(image => image.key === target.key)
        : undefined;
      drawingGenerationRef.current = existing?.props.generation;
      leaveAfterSaveRef.current = false;
      const id = ++drawingIdRef.current;
      if (existing?.src) {
        // The tools paint nothing until their own copy of the picture is
        // decoded; decoded here first, the frame shows it from its first
        // paint, so a switch shows the picture, not white.
        const picture = await warmImage(existing.src);
        setDrawing({
          id,
          target,
          imageUrl: existing.src,
          picture,
          pixelGridSize: existing.props.pixelGridSize,
          recentColors: existing.props.recentColors,
        });
        return;
      }
      const blank = blankPaintImage(target.imageType, DEFAULT_IMAGE_STYLE);
      setDrawing({
        id,
        target,
        imageUrl: blank.dataURI,
        pixelGridSize: blank.pixelGridSize,
      });
    },
    [images]
  );
  // Once the tools have their own copy, the decoded picture is let go, and
  // so is the canvas left behind, once the tools painted a later drawing.
  const dropPicture = useCallback(() => {
    setDrawing(d => {
      if (d && leftCanvasRef.current && leftCanvasRef.current.id !== d.id) {
        leftCanvasRef.current = null;
      }
      return d?.picture ? {...d, picture: undefined} : d;
    });
  }, []);
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
  // `final`: the drawing's last save (Done, the tab or another image), so
  // the file goes up and, if the drawing is still the open one, the tools
  // close after it.
  const runSave = useCallback(
    async (
      dataURI: string,
      meta: PixelEditorSaveMeta,
      current: Drawing,
      final: boolean
    ) => {
      inFlightRef.current = true;
      let saved = current;
      try {
        // A new image needs its file; after that the file follows every few
        // seconds, and when the drawing is done.
        const upload =
          !current.target.key ||
          final ||
          Date.now() - lastUploadRef.current >= UPLOAD_GAP_MS;
        const key = await land(
          current.target,
          () => writer.saveEdited(current.target, dataURI, meta, {upload}),
          false
        );
        if (upload) {
          lastUploadRef.current = Date.now();
        }
        if (drawingRef.current?.id === current.id) {
          uploadOwedRef.current = !upload;
        }
        // A blank that was saved is an image now: later saves replace it.
        saved = {...current, target: {...current.target, key}};
        setDrawing(d =>
          d && d.id === current.id ? {...d, target: {...d.target, key}} : d
        );
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
        // The pending save's drawing, as this save left it if it is the
        // same one.
        await runSave(
          pending.dataURI,
          pending.meta,
          pending.current.id === saved.id ? saved : pending.current,
          pending.final
        );
      } else if (final && drawingRef.current?.id === saved.id) {
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
      const final = leaveAfterSaveRef.current;
      if (inFlightRef.current) {
        pendingRef.current = {dataURI, meta, current, final};
        return;
      }
      runSave(dataURI, meta, current, final);
    },
    [runSave]
  );
  // Another image, or a new slot, while a drawing is open: its last pixels
  // go up in the background and the tools close at once, so what comes
  // next shows without waiting on that save.
  // `keep`: the next image's tools are about to take the canvas over, so
  // the old one stays up until they do, instead of the frame showing the
  // resting preview for the frames it takes to cut a set's standing frame.
  // Nothing drawn in that moment is saved: the save hook is gone.
  const leaveDrawing = useCallback((keep = false) => {
    if (dirtyRef.current || uploadOwedRef.current) {
      leaveAfterSaveRef.current = true;
      saveRef.current?.();
    }
    clearIdleTimer();
    dirtyRef.current = false;
    uploadOwedRef.current = false;
    leaveAfterSaveRef.current = false;
    saveRef.current = null;
    if (!keep) {
      setDrawing(null);
      return;
    }
    const shown = paintStackRef.current?.querySelector('canvas');
    const copy = shown && document.createElement('canvas');
    const context = copy?.getContext('2d');
    if (shown && copy && context) {
      copy.width = shown.width;
      copy.height = shown.height;
      context.drawImage(shown, 0, 0);
      leftCanvasRef.current = {canvas: copy, id: drawingIdRef.current};
    }
  }, []);
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
    chosenImage.props.generation !== drawingGenerationRef.current &&
    (drawing.target.key === chosenImage.key || drawing.target.key === null);
  useEffect(() => {
    if (landedOverPainting) {
      stopDrawing();
    }
  }, [landedOverPainting, stopDrawing]);

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
                  onReady={dropPicture}
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
                  onEdit={noteStroke}
                  onSave={handleDrawingSave}
                >
                  {editor => {
                    saveRef.current = editor.save;
                    return (
                      <>
                        {frame(
                          <div
                            ref={paintStackRef}
                            className={styles.paintStack}
                          >
                            {editor.canvas}
                            {/* The canvas being left, or the frame's own
                                picture, covers the canvas until the editor
                                has decoded it, so a switch never shows a
                                blank. */}
                            {!editor.ready && (
                              <PaintPlaceholder
                                picture={
                                  leftCanvasRef.current?.canvas ??
                                  drawing.picture
                                }
                                src={drawing.imageUrl}
                                pixelated={!!drawing.pixelGridSize}
                              />
                            )}
                          </div>,
                          editor.toolbar
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
    </div>
  );
};

export default ImagesTab;
