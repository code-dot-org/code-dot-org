// The Images tab: the project's images down the left, the one being worked
// on large in the middle, and the way to make or remake it in a pane at the
// right. A picture is the image the moment it lands; there is no dialog and
// no Keep.

import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {toImage} from '@cdo/apps/imageUtils';
import {detectImageGridSize} from '@cdo/apps/pixelEditor/pixelArt';
import PixelEditor, {
  PixelEditorSaveMeta,
} from '@cdo/apps/pixelEditor/PixelEditor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import characterOutline from '@cdo/static/spritelab_lab2/character-outline.svg';

import {bytesToDataURI} from '../../ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {ImageSubject, ImageType} from '../../ai/images/types';
import {onTrimsUpdated, trimAnimationListImages} from '../../imageTrim';
import {DEFAULT_IMAGE_STYLE} from '../../levelMode';
import {BACKGROUND_GROUND_COLOR, blankPaintImage} from '../../paintBlank';
import {
  PAINT_BRUSH_SIZES,
  PAINT_COLORS,
  PAINT_TOOLS,
} from '../sentence/paintTools';
import SentenceScene from '../sentence/SentenceScene';
import {readWordLayout} from '../sentence/wordLayout';

import AdvancedPopover, {
  AdvancedSettings,
  DEFAULT_ADVANCED,
} from './AdvancedPopover';
import DrawPane from './DrawPane';
import FrameRow from './FrameRow';
import {
  BASE_FRAME,
  cutFrame,
  FRAME_LABELS,
  frameCount,
  FrameSize,
  replaceFrame,
} from './frames';
import ImageFrame from './ImageFrame';
import ImageList, {DraftEntry} from './ImageList';
import {currentPixels} from './imagePixels';
import LearningDialog, {LearningPicture} from './LearningDialog';
import MakePane from './MakePane';
import {listProjectImages, ProjectImage} from './projectImages';
import RatingBar from './RatingBar';
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
  /** The advanced settings, for authors. */
  advancedOffered?: boolean;
}

const DRAFT_ID = 'draft';
// The pane's width before the preview column has reported its own.
const DEFAULT_PANE_WIDTH = 280;
// A drawing left alone this long saves itself.
const IDLE_SAVE_MS = 20_000;
// The reveal plays out before the story of how the picture was made.
const LEARNING_DELAY_MS = 1800;
// The kinds the story is told for.
const LEARNING_KINDS: ImageType[] = ['sprite', 'background'];

/** `?learning=always` tells the story after every picture, for looking at
    it. */
function learningForced(): boolean {
  return queryParams('learning') === 'always';
}

/** A drawing in progress: what it writes to, and what the editor opened. */
interface Drawing {
  target: ImageTarget;
  imageUrl: string;
  pixelGridSize?: number;
  recentColors?: PixelEditorSaveMeta['recentColors'];
  /** A character set: the frame on the canvas is one cell of this strip. */
  sheet?: {src: string; frameSize: FrameSize; index: number; count: number};
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
  advancedOffered,
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

  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);
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

  // Where the tab opens: a level about one image opens on that image, or on
  // the place it will go; otherwise on the first image, if any.
  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(() => {
    const current = imagesRef.current;
    if (!lockedImageType) {
      setChosenId(current[0]?.key ?? null);
      return;
    }
    const own = imageRole
      ? current.find(image => image.props.role === imageRole)
      : current.find(image => image.imageType === lockedImageType);
    if (own) {
      setChosenId(own.key);
    } else {
      startDraft(lockedImageType, lockedImageSubject);
    }
    // Once, as the tab mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A chosen image that is gone (deleted) gives way to the first image
  // left, or to a fresh draft on a level about one image.
  useEffect(() => {
    if (
      chosenId === null ||
      (chosenId === DRAFT_ID && draft) ||
      images.some(image => image.key === chosenId)
    ) {
      return;
    }
    if (images[0]) {
      startSession(images[0].key);
    } else if (lockedImageType) {
      startDraft(lockedImageType, lockedImageSubject);
    } else {
      startSession(null);
    }
  }, [
    chosenId,
    draft,
    images,
    lockedImageType,
    lockedImageSubject,
    startSession,
    startDraft,
  ]);

  const chosenImage: ProjectImage | null =
    images.find(image => image.key === chosenId) ?? null;
  const chosenDraft = chosenId === DRAFT_ID ? draft : null;
  // The kind the scene makes: the image's own, or the draft's. A sprite
  // that no longer says what it depicts (hand-drawn, edited) is taken for
  // the level's kind when it is of the level's type.
  const kind = chosenImage
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

  // What a landing picture writes to: the chosen image, or a new one of the
  // picture's kind. A ref, so a slow upload lands where it was aimed.
  const chosenKeyRef = useRef(chosenId);
  chosenKeyRef.current = chosenImage?.key ?? null;
  const landedRef = useRef(onImageLanded);
  landedRef.current = onImageLanded;
  const land = useCallback(
    async (target: ImageTarget, write: () => Promise<string>) => {
      const key = await write();
      if (!target.key) {
        setDraft(null);
        setChosenId(key);
      }
      landedRef.current?.();
      return key;
    },
    []
  );
  const wordLayout = useMemo(() => readWordLayout(), []);
  // The story of how the picture was made: told once a visit, after the
  // first picture a level about a character or a background makes.
  const [learning, setLearning] = useState<{
    picture: LearningPicture;
    prompt: string;
  } | null>(null);
  const toldRef = useRef(false);
  const learningTimerRef = useRef<number>();
  useEffect(() => () => window.clearTimeout(learningTimerRef.current), []);
  const offerLearning = useCallback(
    (result: GeneratedImageResult) => {
      const {imageType, subject} = result.generation;
      const due =
        !toldRef.current &&
        !!lockedImageType &&
        LEARNING_KINDS.includes(imageType) &&
        subject !== 'object';
      if (!due && !learningForced()) {
        return;
      }
      toldRef.current = true;
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
    [lockedImageType]
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

  // Drawing: the pixel editor in the frame, on the image or a blank. The
  // drawing saves itself on Done, when left alone a while, and when the
  // tab is left; a blank with no stroke yet is nothing to save.
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [saving, setSaving] = useState(false);
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  // Strokes since the last save, and the save the editor hands out.
  const dirtyRef = useRef(false);
  const saveRef = useRef<(() => void) | null>(null);
  const idleTimerRef = useRef<number>();
  const leaveAfterSaveRef = useRef(false);
  const clearIdleTimer = () => {
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = undefined;
  };
  const stopDrawing = useCallback(() => {
    clearIdleTimer();
    dirtyRef.current = false;
    saveRef.current = null;
    leaveAfterSaveRef.current = false;
    setDrawing(null);
  }, []);
  useEffect(() => clearIdleTimer, []);
  const startDrawing = useCallback(
    async (target: ImageTarget) => {
      const existing = target.key
        ? images.find(image => image.key === target.key)
        : undefined;
      if (existing?.sheet) {
        const {src, frameSize} = existing.sheet;
        const sheetImage = await toImage(src);
        const imageUrl = await cutFrame(src, frameSize, BASE_FRAME);
        // A set is stored as the model drew it, with no grid recorded, so
        // the grid is read off the frame: the editor then draws in whole
        // art pixels instead of the finest brush.
        const pixelGridSize =
          existing.props.pixelGridSize ??
          (await detectImageGridSize(imageUrl).catch(() => null)) ??
          undefined;
        setDrawing({
          target,
          imageUrl,
          pixelGridSize,
          recentColors: existing.props.recentColors,
          sheet: {
            src,
            frameSize,
            index: BASE_FRAME,
            count: frameCount(sheetImage, frameSize),
          },
        });
        return;
      }
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
    }, IDLE_SAVE_MS);
  }, []);
  // The frame to open once the one on the canvas has saved.
  const nextFrameRef = useRef<number | null>(null);
  const openFrame = useCallback(async (index: number) => {
    const current = drawingRef.current;
    if (!current?.sheet) {
      return;
    }
    const {src, frameSize} = current.sheet;
    const imageUrl = await cutFrame(src, frameSize, index);
    setDrawing(d =>
      d?.sheet ? {...d, imageUrl, sheet: {...d.sheet, index}} : d
    );
  }, []);
  const handleDrawingSave = useCallback(
    async (dataURI: string, meta: PixelEditorSaveMeta) => {
      const current = drawingRef.current;
      if (!current) {
        return;
      }
      clearIdleTimer();
      dirtyRef.current = false;
      setSaving(true);
      try {
        // A set's frame goes back into its strip, and the strip is saved.
        const pixels = current.sheet
          ? await replaceFrame(
              current.sheet.src,
              current.sheet.frameSize,
              current.sheet.index,
              dataURI
            )
          : dataURI;
        const key = await land(current.target, () =>
          writer.saveEdited(current.target, pixels, meta)
        );
        // A blank that was saved is an image now: later saves replace it;
        // a saved strip is what the next frame is cut from.
        setDrawing(
          d =>
            d && {
              ...d,
              target: {...d.target, key},
              ...(d.sheet && {sheet: {...d.sheet, src: pixels}}),
            }
        );
      } finally {
        setSaving(false);
      }
      if (leaveAfterSaveRef.current) {
        stopDrawing();
      } else if (nextFrameRef.current !== null) {
        const next = nextFrameRef.current;
        nextFrameRef.current = null;
        await openFrame(next);
      }
    },
    [land, writer, stopDrawing, openFrame]
  );
  // Another frame of the set: what is drawn on this one is saved first.
  const selectFrame = useCallback(
    (index: number) => {
      if (index === drawingRef.current?.sheet?.index) {
        return;
      }
      if (dirtyRef.current) {
        nextFrameRef.current = index;
        saveRef.current?.();
      } else {
        openFrame(index);
      }
    },
    [openFrame]
  );
  // Leaving the tab saves what was drawn so far.
  useEffect(() => {
    if (!active && drawingRef.current && dirtyRef.current) {
      saveRef.current?.();
    }
  }, [active]);
  const finishDrawing = useCallback(() => {
    if (dirtyRef.current) {
      leaveAfterSaveRef.current = true;
      saveRef.current?.();
    } else {
      stopDrawing();
    }
  }, [stopDrawing]);
  // Free play has every tool; a level before it keeps the few that draw.
  const limitedTools = !editingOffered;
  const drawOffered = !!kind && !drawing;

  const deleteOffered = !!editingOffered;
  const paneWidthPx = paneWidth || DEFAULT_PANE_WIDTH;

  return (
    <div className={styles.tab}>
      <ImageList
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
          editingOffered
            ? () => {
                if (drawing) {
                  finishDrawing();
                }
                if (draft) {
                  startSession(DRAFT_ID);
                } else {
                  startDraft('sprite', 'character');
                }
              }
            : undefined
        }
        onDelete={deleteOffered ? writer.deleteImage : undefined}
      />
      {drawing && kind ? (
        <PixelEditor
          key={drawing.imageUrl}
          imageUrl={drawing.imageUrl}
          knownPixelGrid={drawing.pixelGridSize}
          initialRecentColors={drawing.recentColors}
          opaqueGround={
            drawing.target.imageType === 'background'
              ? BACKGROUND_GROUND_COLOR
              : undefined
          }
          tools={limitedTools ? PAINT_TOOLS : undefined}
          palette={limitedTools ? PAINT_COLORS : undefined}
          brushSizes={limitedTools ? PAINT_BRUSH_SIZES : undefined}
          fit="container"
          toolbarLayout="row"
          canvasClassName={styles.paintCanvas}
          onEdit={noteStroke}
          onSave={handleDrawingSave}
        >
          {parts => {
            saveRef.current = parts.save;
            const outline =
              !drawing.target.key &&
              kind.imageType === 'sprite' &&
              kind.subject !== 'object';
            return (
              <>
                <ImageFrame
                  image={null}
                  workspaceClassName={styles.paintFrame}
                  above={parts.toolbar}
                  under={
                    drawing.sheet && (
                      <FrameRow
                        sheetSrc={drawing.sheet.src}
                        frameSize={drawing.sheet.frameSize}
                        count={drawing.sheet.count}
                        selected={drawing.sheet.index}
                        onSelect={selectFrame}
                        disabled={saving}
                      />
                    )
                  }
                  live={
                    outline ? (
                      <div className={styles.paintStack}>
                        {parts.canvas}
                        <img
                          src={characterOutline}
                          alt=""
                          className={classNames(
                            styles.paintOutline,
                            parts.edited && styles.paintOutlineGone
                          )}
                        />
                      </div>
                    ) : (
                      parts.canvas
                    )
                  }
                />
                <DrawPane
                  width={paneWidthPx}
                  kind={kind}
                  frameLabel={
                    drawing.sheet
                      ? FRAME_LABELS[drawing.sheet.index]
                      : undefined
                  }
                  editing={!!drawing.target.key}
                  edited={parts.edited}
                  saving={saving}
                  onDone={finishDrawing}
                  onCancel={stopDrawing}
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
          typeChoice={!!chosenDraft && !lockedImageType}
          generationsLeft={generationsLeft}
          verdictRequired={verdictRequired}
          onGenerateStart={onGenerate}
          onKeep={handleKeep}
          wordLayout={wordLayout}
          singleStep
          compactBehindTheScenes
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
          layout={parts => (
            <>
              <ImageFrame
                image={chosenImage}
                draftKind={chosenDraft ?? undefined}
                live={
                  parts.mode === 'generating' || parts.frameFilled
                    ? parts.frame
                    : undefined
                }
                generating={parts.mode === 'generating'}
                beside={parts.alternatives}
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
              <MakePane
                parts={parts}
                width={paneWidthPx}
                overwriteWarns={!!chosenImage && !chosenImage.props.generation}
                onDraw={
                  drawOffered
                    ? () =>
                        startDrawing({
                          key: chosenImage?.key ?? null,
                          imageType: parts.draft.imageType,
                          subject: parts.draft.subject,
                        })
                    : undefined
                }
                drawLabel={chosenImage ? 'Edit this image' : 'Draw my own'}
                extra={
                  advancedOffered && (
                    <AdvancedPopover
                      imageType={parts.draft.imageType}
                      settings={advanced}
                      onChange={setAdvanced}
                      hasImage={!!chosenImage}
                      disabled={parts.busy}
                    />
                  )
                }
              />
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
              {editingOffered
                ? 'Press + to make an image.'
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
