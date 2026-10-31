// The Images tab: the project's images down the left, the one being worked
// on large in the middle, and the way to make or remake it in a pane at the
// right. A picture is the image the moment it lands; there is no dialog and
// no Keep.

import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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

import DrawPane from './DrawPane';
import ImageFrame from './ImageFrame';
import ImageList, {DraftEntry} from './ImageList';
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
}

const DRAFT_ID = 'draft';
// The pane's width before the preview column has reported its own.
const DEFAULT_PANE_WIDTH = 280;
// A drawing left alone this long saves itself.
const IDLE_SAVE_MS = 20_000;
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
    }, IDLE_SAVE_MS);
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
        const key = await land(current.target, () =>
          writer.saveEdited(current.target, dataURI, meta)
        );
        // A blank that was saved is an image now: later saves replace it.
        setDrawing(d => d && {...d, target: {...d.target, key}});
      } finally {
        setSaving(false);
      }
      if (leaveAfterSaveRef.current) {
        stopDrawing();
      }
    },
    [land, writer, stopDrawing]
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
  // Character sets are sheets of frames; the editor paints one image.
  const drawOffered = !!kind && !chosenImage?.sheet && !drawing;

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
          keepOnResult
          wordLayout={wordLayout}
          singleStep
          compactBehindTheScenes
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
