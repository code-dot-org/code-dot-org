// The paint tools' bookkeeping for the Images tab: which drawing is open,
// how its strokes are saved, and how one drawing gives way to the next.
// The tab decides when a drawing starts; this hook keeps it saved.

import {useCallback, useEffect, useRef, useState} from 'react';

import {toImage} from '@cdo/apps/imageUtils';
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

// A pause this long after a stroke saves the drawing into the project, so
// the image list's tile, the World tab's palette and the next Run show the
// picture as it is drawn.
const STROKE_SAVE_MS = 800;
// A pause's save stores the pixels in the project; the PNG upload behind the
// image happens at most once per this gap, and once more when the drawing
// is finished. The project's own save keeps its own throttle.
const UPLOAD_GAP_MS = 5000;

/** A drawing in progress: what it writes to, and what the editor opened. */
export interface Drawing {
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
    saveNow?: boolean
  ) => Promise<string>;
  /** The tab is the one showing. */
  active: boolean;
  onDrawingHistory?: (history: EditHistory | null) => void;
}

export interface DrawingTools {
  drawing: Drawing | null;
  /** The image's generation record when the tools opened on it. */
  openedOnGeneration: ImageProps['generation'];
  /** What the frame shows over the editor's canvas until the editor has
      painted: a copy of the previous drawing's canvas, or the picture
      decoded ahead. */
  placeholderPicture: HTMLImageElement | HTMLCanvasElement | undefined;
  /** The last pause-save failed; it is tried again at the next pause,
      Done or tab change. */
  saveFailed: boolean;
  /** Opens `target` in the tools, a set on `frame` or its standing frame. */
  startDrawing: (target: ImageTarget, frame?: number) => Promise<void>;
  /** Leaves the drawing for another image or a new draft: unsaved pixels
      are saved in the background and the tools close at once. With
      `keepCanvasUp` a copy of the canvas stays on screen until the next
      image's editor has painted. */
  leaveDrawing: (keepCanvasUp?: boolean) => void;
  /** Done: what is drawn is saved, including pixels a pause's save stored
      without uploading, and the tools close. */
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
}: UseDrawingOptions): DrawingTools {
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  const [saveFailed, setSaveFailed] = useState(false);
  // The drawing that a generated picture replaced while a save of it was
  // still in flight; that save must not set the image's pixels back to the
  // drawing.
  const abandonedDrawingIdRef = useRef<number | null>(null);
  // Whether strokes were made since the last save, and the editor's save
  // and snapshot functions.
  const dirtyRef = useRef(false);
  const editorRef = useRef<DrawingEditor | null>(null);
  const idleTimerRef = useRef<number>();
  // One save in flight at a time. A save asked for meanwhile waits as the
  // pending one; each carries the whole picture, so only the latest matters.
  const inFlightRef = useRef(false);
  const pendingRef = useRef<{
    dataURI: string;
    meta: PixelEditorSaveMeta;
    drawing: Drawing;
    final: boolean;
  } | null>(null);
  // When the drawing's PNG was last uploaded, and whether pixels saved
  // since then have not been uploaded yet.
  const lastUploadRef = useRef(0);
  const uploadPendingRef = useRef(false);
  const leaveAfterSaveRef = useRef(false);
  // The image's generation record when the tools opened; if it changes, a
  // generated picture replaced the image while it was being drawn on.
  const openedOnGenerationRef = useRef<ImageProps['generation']>();
  const drawingIdRef = useRef(0);
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

  const stopDrawing = useCallback(() => {
    clearIdleTimer();
    dirtyRef.current = false;
    pendingRef.current = null;
    lastUploadRef.current = 0;
    uploadPendingRef.current = false;
    editorRef.current = null;
    leaveAfterSaveRef.current = false;
    setSaveFailed(false);
    setDrawing(null);
  }, []);

  const abandonDrawing = useCallback(() => {
    abandonedDrawingIdRef.current = drawingRef.current?.id ?? null;
    stopDrawing();
  }, [stopDrawing]);

  // Leaving the level mid-drawing (the panel's Continue, or navigation)
  // unmounts the tab without Done: unsaved strokes and any pending upload
  // are saved now, while the editor's canvas still exists.
  useEffect(
    () => () => {
      if (
        drawingRef.current &&
        (dirtyRef.current || uploadPendingRef.current)
      ) {
        leaveAfterSaveRef.current = true;
        editorRef.current?.save();
      }
    },
    []
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
      leaveAfterSaveRef.current = false;
      const id = ++drawingIdRef.current;
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
    dirtyRef.current = true;
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      if (dirtyRef.current) {
        editorRef.current?.save();
      }
    }, STROKE_SAVE_MS);
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

  // `drawingToSave` is the drawing as the save knows it: the state, or for
  // a pending save what the save before it made, since React may not have
  // rendered that yet. `final` marks the drawing's last save (Done, the
  // tab or another image): the file is uploaded and, if the drawing is
  // still the open one, the tools close after it.
  const runSave = useCallback(
    async (
      dataURI: string,
      meta: PixelEditorSaveMeta,
      drawingToSave: Drawing,
      final: boolean
    ) => {
      if (abandonedDrawingIdRef.current === drawingToSave.id) {
        pendingRef.current = null;
        return;
      }
      inFlightRef.current = true;
      let saved = drawingToSave;
      try {
        // A set's frame goes back into its strip, and the strip is saved.
        const pixels = drawingToSave.sheet
          ? await replaceFrame(
              drawingToSave.sheet.src,
              drawingToSave.sheet.frameSize,
              drawingToSave.sheet.index,
              dataURI
            )
          : dataURI;
        const upload =
          !drawingToSave.target.key ||
          final ||
          Date.now() - lastUploadRef.current >= UPLOAD_GAP_MS;
        const key = await storePicture(
          drawingToSave.target,
          () =>
            saveEdited(drawingToSave.target, pixels, meta, {
              upload,
              stillWanted: () =>
                abandonedDrawingIdRef.current !== drawingToSave.id,
            }),
          false
        );
        if (abandonedDrawingIdRef.current === drawingToSave.id) {
          return;
        }
        if (upload) {
          lastUploadRef.current = Date.now();
        }
        if (drawingRef.current?.id === drawingToSave.id) {
          uploadPendingRef.current = !upload;
        }
        setSaveFailed(false);
        // A blank that was saved is an image now: later saves replace it;
        // a saved strip is what the next frame is cut from.
        saved = {
          ...drawingToSave,
          target: {...drawingToSave.target, key},
          ...(drawingToSave.sheet && {
            sheet: {...drawingToSave.sheet, src: pixels},
          }),
        };
        setDrawing(d =>
          d && d.id === drawingToSave.id
            ? {
                ...d,
                target: {...d.target, key},
                ...(d.sheet && {sheet: {...d.sheet, src: pixels}}),
              }
            : d
        );
      } catch {
        // The picture is still on the canvas. It is marked unsaved, so the
        // next pause, Done or leaving the tab tries again from the canvas
        // as it is then; a pending save would only carry older pixels.
        dirtyRef.current = true;
        uploadPendingRef.current = true;
        pendingRef.current = null;
        leaveAfterSaveRef.current = false;
        nextFrameRef.current = null;
        inFlightRef.current = false;
        setSaveFailed(true);
        return;
      } finally {
        inFlightRef.current = false;
      }
      const pending = pendingRef.current;
      if (pending) {
        pendingRef.current = null;
        // A queued save reuses this save's result when both belong to the
        // same drawing, but keeps its own frame index: the student may
        // have switched frames while this save ran.
        await runSave(
          pending.dataURI,
          pending.meta,
          pending.drawing.id === saved.id
            ? {
                ...saved,
                ...(saved.sheet &&
                  pending.drawing.sheet && {
                    sheet: {...saved.sheet, index: pending.drawing.sheet.index},
                  }),
              }
            : pending.drawing,
          pending.final
        );
      } else if (final && drawingRef.current?.id === saved.id) {
        stopDrawing();
      } else if (nextFrameRef.current !== null) {
        const next = nextFrameRef.current;
        nextFrameRef.current = null;
        await openFrame(next);
      }
    },
    [storePicture, saveEdited, stopDrawing, openFrame]
  );

  const selectFrame = useCallback(
    (index: number) => {
      if (index === drawingRef.current?.sheet?.index) {
        return;
      }
      if (dirtyRef.current) {
        nextFrameRef.current = index;
        editorRef.current?.save();
      } else {
        openFrame(index);
      }
    },
    [openFrame]
  );

  const handleSave = useCallback(
    (dataURI: string, meta: PixelEditorSaveMeta) => {
      const current = drawingRef.current;
      if (!current) {
        return;
      }
      clearIdleTimer();
      dirtyRef.current = false;
      const final = leaveAfterSaveRef.current;
      if (inFlightRef.current) {
        pendingRef.current = {dataURI, meta, drawing: current, final};
        return;
      }
      runSave(dataURI, meta, current, final);
    },
    [runSave]
  );

  const leaveDrawing = useCallback((keepCanvasUp = false) => {
    if (dirtyRef.current || uploadPendingRef.current) {
      leaveAfterSaveRef.current = true;
      editorRef.current?.save();
    }
    clearIdleTimer();
    dirtyRef.current = false;
    uploadPendingRef.current = false;
    leaveAfterSaveRef.current = false;
    const copy = keepCanvasUp ? editorRef.current?.snapshot() : null;
    editorRef.current = null;
    setSaveFailed(false);
    if (!keepCanvasUp) {
      setDrawing(null);
      return;
    }
    if (copy) {
      previousCanvasRef.current = {canvas: copy, id: drawingIdRef.current};
    }
  }, []);

  const finishDrawing = useCallback(() => {
    if (dirtyRef.current || uploadPendingRef.current) {
      leaveAfterSaveRef.current = true;
      editorRef.current?.save();
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

  const attachEditor = useCallback((editor: DrawingEditor) => {
    editorRef.current = editor;
  }, []);

  return {
    drawing,
    openedOnGeneration: openedOnGenerationRef.current,
    placeholderPicture: previousCanvasRef.current?.canvas ?? drawing?.picture,
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
