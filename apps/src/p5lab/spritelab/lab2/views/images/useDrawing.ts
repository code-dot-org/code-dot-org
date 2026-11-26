// The paint tools' bookkeeping for the Images tab: which drawing is open,
// how its strokes are saved, and how one drawing gives way to the next.
// The tab decides when a drawing starts; this hook keeps it saved.

import {useCallback, useEffect, useRef, useState} from 'react';

import {toImage} from '@cdo/apps/imageUtils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {standingFrameIndex} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {DEFAULT_IMAGE_STYLE} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';
import {blankPaintImage} from '@cdo/apps/p5lab/spritelab/lab2/paintBlank';
import {EditHistory} from '@cdo/apps/p5lab/spritelab/lab2/views/components/EditorStrip';
import {
  PixelEditorParts,
  PixelEditorSaveMeta,
} from '@cdo/apps/pixelEditor/PixelEditor';

import {cutFrame, frameCount, replaceFrame} from './frames';
import {ImageProps, ProjectImage} from './projectImages';
import {ImageTarget, ImageWriter} from './useImageWriter';

// A pause this long after a stroke puts the picture in the image list, so
// the image list's tile, the World tab's palette and the next Run show the
// picture as it is drawn.
const STROKE_SAVE_MS = 800;

/** What the tools opened on. `other` is an image that is neither blank nor
    AI-made: a drawing, an upload, or a hand-edited AI picture. */
type DrawingOrigin = 'blank' | 'generated' | 'other';

/** A drawing in progress: what it writes to, and what the editor opened. */
export interface Drawing {
  /** A new number each time the tools open, so two openings of one image
      are different drawings. */
  id: number;
  target: ImageTarget;
  imageUrl: string;
  /** The picture decoded ahead, shown over the canvas until the tools
      have their own copy. */
  picture?: HTMLImageElement;
  pixelGridSize?: number;
  recentColors?: PixelEditorSaveMeta['recentColors'];
  /** A character set: the frame on the canvas is one cell of this strip. */
  sheet?: NonNullable<ProjectImage['sheet']> & {index: number; count: number};
}

/** The parts of the pixel editor this hook uses. */
export type DrawingEditor = Pick<PixelEditorParts, 'save' | 'snapshot'>;

interface UseDrawingOptions {
  images: ProjectImage[];
  saveEdited: ImageWriter['saveEdited'];
  /** Writes a picture to its target image, a new image when the target
      has no key yet, and resolves to the image's key. */
  storePicture: (
    target: ImageTarget,
    write: () => Promise<string>,
    saveNow?: boolean,
    stillOpen?: () => boolean
  ) => Promise<string>;
  /** The tab is the one showing. */
  active: boolean;
  saveProjectNow?: () => void;
  onDrawingHistory?: (history: EditHistory | null) => void;
}

export interface DrawingTools {
  drawing: Drawing | null;
  /** The image's generation record when the tools opened on it. */
  openedOnGeneration: ImageProps['generation'];
  /** The image's generation record changed without its pixels, as a
      rating changes it. Tools open on that image take the record as their
      own and stay open; without this, a changed record reads as a new
      picture landing over the drawing. */
  adoptGeneration: (key: string, generation: ImageProps['generation']) => void;
  /** What the frame shows over the editor's canvas until the editor has
      painted: a copy of the previous drawing's canvas, or the picture
      decoded ahead. */
  placeholderPicture: HTMLImageElement | HTMLCanvasElement | undefined;
  /** The paint tools' canvas as it was when Done closed them, with the key
      of its image. The frame shows it until the image's saved picture has
      been drawn. */
  closedPicture: {key: string; canvas: HTMLCanvasElement} | null;
  releaseClosedPicture: () => void;
  /** A save of the open drawing failed; it is tried again at the next
      pause, Done or tab change. */
  saveFailed: boolean;
  /** Opens `target` in the tools, a set on `frame` or its standing frame. */
  startDrawing: (target: ImageTarget, frame?: number) => Promise<void>;
  /** Leaves the drawing for another image or a new draft: unsaved pixels
      are saved, the project is saved, and the tools close at once. With
      `keepCanvasUp` a copy of the canvas stays on screen until the next
      image's editor has painted. */
  leaveDrawing: (keepCanvasUp?: boolean) => void;
  /** Done: what is drawn is saved, the project is saved, and the tools
      close. */
  finishDrawing: () => void;
  /** Closes the tools without saving. */
  stopDrawing: () => void;
  /** A generated picture replaced the drawing's image: the tools close,
      and a save of the drawing still in flight goes nowhere. */
  abandonDrawing: () => void;
  /** Another frame of a character set; what is drawn on this one is saved
      first. */
  selectFrame: (index: number) => void;
  /** The editor reports a change to the picture. */
  scheduleStrokeSave: () => void;
  /** The editor hands back the picture to save. */
  handleSave: (dataURI: string, meta: PixelEditorSaveMeta) => void;
  /** The editor has painted its own copy of the picture. */
  releasePlaceholder: () => void;
  /** Takes the editor's save and snapshot, for the saves and the copy of
      the canvas this hook makes. */
  attachEditor: (editor: DrawingEditor) => void;
}

/** Loads and decodes a picture, for the frame to paint at once; a failure
    is left for the editor, which loads the same picture, to report. */
async function decodeImage(src: string): Promise<HTMLImageElement | undefined> {
  try {
    const image = await toImage(src);
    await image.decode?.();
    return image;
  } catch {
    return undefined;
  }
}

export default function useDrawing({
  images,
  saveEdited,
  storePicture,
  active,
  onDrawingHistory,
  saveProjectNow,
}: UseDrawingOptions): DrawingTools {
  const saveProjectNowRef = useRef(saveProjectNow);
  saveProjectNowRef.current = saveProjectNow;
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  const [saveFailed, setSaveFailed] = useState(false);
  const saveFailedRef = useRef(false);
  const [closedPicture, setClosedPicture] =
    useState<DrawingTools['closedPicture']>(null);
  const releaseClosedPicture = useCallback(() => setClosedPicture(null), []);
  // The drawing that a generated picture replaced while a save of it was
  // still running; that save must not set the image's pixels back to the
  // drawing.
  const abandonedDrawingIdRef = useRef<number | null>(null);
  // Whether strokes were made since the most recent save, and the editor's
  // save and snapshot functions.
  const dirtyRef = useRef(false);
  const editorRef = useRef<DrawingEditor | null>(null);
  const idleTimerRef = useRef<number>();
  // Saves, and what waits for them, run in order: a save builds on the one
  // before it (a new image's key, a set's strip).
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const afterSaves = useCallback((step: () => void | Promise<void>) => {
    chainRef.current = chainRef.current.then(step).catch(() => undefined);
  }, []);
  // Each drawing as its most recent save left it: the key a new image got,
  // and a set's strip with the saved frame in it.
  const savedDrawingsRef = useRef(new Map<number, Drawing>());
  // The drawing whose tools are open, from the start of startDrawing until
  // it is left or closed or the tab unmounts. A drawing left with its canvas
  // still showing is no longer open.
  const openIdRef = useRef<number | null>(null);
  // The character set's frame asked for, opened once the saves before it
  // have finished.
  const nextFrameRef = useRef<{id: number; index: number} | null>(null);
  // The image's generation record when the tools opened; if it changes, a
  // generated picture replaced the image while it was being drawn on.
  const openedOnGenerationRef = useRef<ImageProps['generation']>();
  const drawingIdRef = useRef(0);
  // What the open drawing's first edit will report; null once that edit has
  // been reported.
  const firstEditReportRef = useRef<{
    origin: DrawingOrigin;
    target: ImageTarget;
  } | null>(null);
  // A copy of the previous drawing's canvas, shown until the next image's
  // editor has painted, and which drawing the copy came from.
  const previousCanvasRef = useRef<{
    canvas: HTMLCanvasElement;
    id: number;
  } | null>(null);

  const clearIdleTimer = () => {
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = undefined;
  };
  useEffect(() => clearIdleTimer, []);

  const showSaveFailed = (failed: boolean) => {
    saveFailedRef.current = failed;
    setSaveFailed(failed);
  };

  // Saves what is drawn on the open drawing, if anything is.
  const saveStrokes = () => {
    if (dirtyRef.current) {
      editorRef.current?.save();
    }
  };

  // Ends a drawing: its saved state is forgotten once its saves are done.
  const forget = useCallback(
    (id: number) =>
      afterSaves(() => {
        if (openIdRef.current !== id) {
          savedDrawingsRef.current.delete(id);
        }
      }),
    [afterSaves]
  );

  const stopDrawing = useCallback(() => {
    clearIdleTimer();
    dirtyRef.current = false;
    const closedId = openIdRef.current;
    if (closedId !== null) {
      forget(closedId);
    }
    openIdRef.current = null;
    nextFrameRef.current = null;
    editorRef.current = null;
    showSaveFailed(false);
    setDrawing(null);
  }, [forget]);

  const closeAfterDone = useCallback(
    (key = drawingRef.current?.target.key) => {
      const canvas = editorRef.current?.snapshot();
      setClosedPicture(key && canvas ? {key, canvas} : null);
      stopDrawing();
    },
    [stopDrawing]
  );

  const abandonDrawing = useCallback(() => {
    abandonedDrawingIdRef.current = drawingRef.current?.id ?? null;
    stopDrawing();
  }, [stopDrawing]);

  // Leaving the level mid-drawing (the panel's Continue, or navigation)
  // unmounts the tab without Done: what is drawn is saved now, while the
  // editor's canvas still exists, and then the project.
  useEffect(
    () => () => {
      const open = drawingRef.current;
      if (!open || openIdRef.current !== open.id) {
        return;
      }
      saveStrokes();
      afterSaves(() => saveProjectNowRef.current?.());
      openIdRef.current = null;
    },
    [afterSaves]
  );
  // The host's undo and redo are cleared when the drawing ends or the tab
  // unmounts; switching pictures within one drawing keeps them.
  const drawingOpen = !!drawing;
  useEffect(() => {
    if (!drawingOpen) {
      return;
    }
    return () => onDrawingHistory?.(null);
  }, [drawingOpen, onDrawingHistory]);

  const startDrawing = useCallback(
    async (target: ImageTarget, frame?: number) => {
      const existing = target.key
        ? images.find(image => image.key === target.key)
        : undefined;
      openedOnGenerationRef.current = existing?.props.generation;
      firstEditReportRef.current = {
        origin: !existing?.src
          ? 'blank'
          : existing.props.generation
          ? 'generated'
          : 'other',
        target,
      };
      dirtyRef.current = false;
      nextFrameRef.current = null;
      setClosedPicture(null);
      const id = ++drawingIdRef.current;
      openIdRef.current = id;
      if (existing?.sheet) {
        const {src, frameSize, poses} = existing.sheet;
        const startFrame = frame ?? standingFrameIndex(poses);
        const sheetImage = await toImage(src);
        const imageUrl = await cutFrame(src, frameSize, startFrame);
        const picture = await decodeImage(imageUrl);
        // A later start owns the tools now.
        if (id !== drawingIdRef.current) {
          return;
        }
        setDrawing({
          id,
          target,
          imageUrl,
          picture,
          pixelGridSize: existing.props.pixelGridSize,
          recentColors: existing.props.recentColors,
          sheet: {
            src,
            frameSize,
            poses,
            index: startFrame,
            count: frameCount(sheetImage.naturalWidth, frameSize),
          },
        });
        return;
      }
      if (existing?.src) {
        const picture = await decodeImage(existing.src);
        if (id !== drawingIdRef.current) {
          return;
        }
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

  const releasePlaceholder = useCallback(() => {
    setDrawing(d => {
      if (
        d &&
        previousCanvasRef.current &&
        previousCanvasRef.current.id !== d.id
      ) {
        previousCanvasRef.current = null;
      }
      return d?.picture ? {...d, picture: undefined} : d;
    });
  }, []);

  const scheduleStrokeSave = useCallback(() => {
    if (openIdRef.current !== drawingRef.current?.id) {
      return;
    }
    const unreported = firstEditReportRef.current;
    if (unreported) {
      firstEditReportRef.current = null;
      analyticsReporter.sendEvent(
        EVENTS.HOAI2026_IMAGE_DRAW,
        {
          origin: unreported.origin,
          imageType: unreported.target.imageType,
          imageSubject: unreported.target.subject,
        },
        true
      );
    }
    dirtyRef.current = true;
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(saveStrokes, STROKE_SAVE_MS);
  }, []);

  // A save builds on the drawing as the previous save of it left it, but
  // keeps the frame index it was made on: the student may have switched
  // frames since that save.
  const savePicture = useCallback(
    async (
      dataURI: string,
      meta: PixelEditorSaveMeta,
      madeOn: Drawing
    ): Promise<void> => {
      const previous = savedDrawingsRef.current.get(madeOn.id);
      const base = previous
        ? {
            ...previous,
            ...(previous.sheet &&
              madeOn.sheet && {
                sheet: {...previous.sheet, index: madeOn.sheet.index},
              }),
          }
        : madeOn;
      const isOpen = () => openIdRef.current === base.id;
      if (abandonedDrawingIdRef.current === base.id) {
        return;
      }
      try {
        // A set's frame goes back into its strip, and the strip is saved.
        const pixels = base.sheet
          ? await replaceFrame(
              base.sheet.src,
              base.sheet.frameSize,
              base.sheet.index,
              dataURI
            )
          : dataURI;
        const key = await storePicture(
          base.target,
          () =>
            saveEdited(base.target, pixels, meta, {
              stillWanted: () => abandonedDrawingIdRef.current !== base.id,
            }),
          false,
          isOpen
        );
        if (abandonedDrawingIdRef.current === base.id) {
          return;
        }
        // A blank that was saved is an image now: later saves replace it;
        // a saved strip is what the next frame is cut from.
        savedDrawingsRef.current.set(base.id, {
          ...base,
          target: {...base.target, key},
          ...(base.sheet && {sheet: {...base.sheet, src: pixels}}),
        });
        if (isOpen()) {
          showSaveFailed(false);
        }
        setDrawing(d =>
          d && d.id === base.id
            ? {
                ...d,
                target: {...d.target, key},
                ...(d.sheet && {sheet: {...d.sheet, src: pixels}}),
              }
            : d
        );
      } catch {
        if (isOpen()) {
          // The picture is still on the canvas; the next pause, Done or
          // leaving the tab saves it as it is then.
          dirtyRef.current = true;
          nextFrameRef.current = null;
          showSaveFailed(true);
        }
      }
    },
    [storePicture, saveEdited]
  );

  const handleSave = useCallback(
    (dataURI: string, meta: PixelEditorSaveMeta) => {
      const current = drawingRef.current;
      if (!current || openIdRef.current !== current.id) {
        return;
      }
      clearIdleTimer();
      dirtyRef.current = false;
      afterSaves(() => savePicture(dataURI, meta, current));
    },
    [afterSaves, savePicture]
  );

  // Opens the frame asked for once the saves before it are done, so it is
  // cut from the strip they leave. Strokes made while it was cut are on the
  // frame still showing, so they are saved into it first, and the frame is
  // asked for again.
  const openNextFrame = useCallback(
    (id: number) =>
      afterSaves(async () => {
        const next = nextFrameRef.current;
        const current = drawingRef.current;
        if (!next || next.id !== id || openIdRef.current !== id || !current) {
          return;
        }
        const sheet = savedDrawingsRef.current.get(id)?.sheet ?? current.sheet;
        if (!sheet) {
          return;
        }
        const imageUrl = await cutFrame(sheet.src, sheet.frameSize, next.index);
        if (nextFrameRef.current !== next || openIdRef.current !== id) {
          return;
        }
        if (dirtyRef.current) {
          saveStrokes();
          openNextFrame(id);
          return;
        }
        nextFrameRef.current = null;
        setDrawing(d =>
          d?.sheet
            ? {...d, imageUrl, sheet: {...d.sheet, index: next.index}}
            : d
        );
      }),
    [afterSaves]
  );

  const selectFrame = useCallback(
    (index: number) => {
      const open = drawingRef.current;
      if (!open?.sheet || openIdRef.current !== open.id) {
        return;
      }
      if (index === open.sheet.index) {
        // Choosing the frame on screen cancels a frame switch still waiting.
        nextFrameRef.current = null;
        return;
      }
      nextFrameRef.current = {id: open.id, index};
      saveStrokes();
      openNextFrame(open.id);
    },
    [openNextFrame]
  );

  const leaveDrawing = useCallback(
    (keepCanvasUp = false) => {
      const current = drawingRef.current;
      if (current && openIdRef.current === current.id) {
        saveStrokes();
        afterSaves(() => saveProjectNowRef.current?.());
        forget(current.id);
      }
      openIdRef.current = null;
      nextFrameRef.current = null;
      clearIdleTimer();
      dirtyRef.current = false;
      const copy = keepCanvasUp ? editorRef.current?.snapshot() : null;
      editorRef.current = null;
      showSaveFailed(false);
      if (!keepCanvasUp) {
        setDrawing(null);
        return;
      }
      if (copy) {
        previousCanvasRef.current = {canvas: copy, id: drawingIdRef.current};
      }
    },
    [afterSaves, forget]
  );

  // Done saves what is drawn and then the project, and closes the tools,
  // unless the save failed. Strokes made while the save ran are saved
  // before the tools close.
  const finishDrawingRef = useRef<() => void>(() => undefined);
  const finishDrawing = useCallback(() => {
    const open = drawingRef.current;
    if (!open || openIdRef.current !== open.id) {
      return;
    }
    saveStrokes();
    afterSaves(() => {
      if (openIdRef.current !== open.id || saveFailedRef.current) {
        return;
      }
      if (dirtyRef.current && editorRef.current) {
        finishDrawingRef.current();
        return;
      }
      saveProjectNowRef.current?.();
      closeAfterDone(
        savedDrawingsRef.current.get(open.id)?.target.key ?? open.target.key
      );
    });
  }, [afterSaves, closeAfterDone]);
  finishDrawingRef.current = finishDrawing;

  // Leaving the tab is Done: what was drawn is saved and the tools close.
  useEffect(() => {
    if (!active && drawingRef.current) {
      finishDrawing();
    }
  }, [active, finishDrawing]);

  const attachEditor = useCallback((editor: DrawingEditor) => {
    editorRef.current = editor;
  }, []);

  const adoptGeneration = useCallback(
    (key: string, generation: ImageProps['generation']) => {
      if (drawingRef.current?.target.key === key) {
        openedOnGenerationRef.current = generation;
      }
    },
    []
  );

  return {
    drawing,
    openedOnGeneration: openedOnGenerationRef.current,
    adoptGeneration,
    placeholderPicture: previousCanvasRef.current?.canvas ?? drawing?.picture,
    closedPicture,
    releaseClosedPicture,
    saveFailed,
    startDrawing,
    leaveDrawing,
    finishDrawing,
    stopDrawing,
    abandonDrawing,
    selectFrame,
    scheduleStrokeSave,
    handleSave,
    releasePlaceholder,
    attachEditor,
  };
}
