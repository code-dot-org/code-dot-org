declare global {
  interface Window {
    requestAnimFrame: (cb: () => void) => void;
  }
}

import {fishData} from '../utils/fishData';

import CanvasCache from './canvasCache';
import constants, {AppMode, Modes, ClassType} from './constants';
import {
  backgroundPathForMode,
  finishMovement,
  currentRunTime,
  randomInt,
  filterFishComponents,
  $time,
} from './helpers';
import {predictFish} from './models/predict';
import soundLibrary from './models/soundLibrary';
import {
  loadAllFishPartImages,
  loadAllSeaCreatureImages,
  loadAllTrashImages,
  initMobilenet,
  FishOceanObject,
  OceanObject,
  SeaCreatureOceanObject,
} from './OceanObject';
import {getState, setState} from './state';
import type {State} from './state';
import colors from './styles/colors';

const aiBotClosed = new URL(
  '../assets/images/ai-bot/ai-bot-closed.png',
  import.meta.url,
).href;
const aiBotYes = new URL(
  '../assets/images/ai-bot/ai-bot-yes.png',
  import.meta.url,
).href;
const aiBotNo = new URL(
  '../assets/images/ai-bot/ai-bot-no.png',
  import.meta.url,
).href;
const redScanner = new URL(
  '../assets/images/ai-bot/red-scanner.png',
  import.meta.url,
).href;
const greenScanner = new URL(
  '../assets/images/ai-bot/green-scanner.png',
  import.meta.url,
).href;
const blueScanner = new URL(
  '../assets/images/ai-bot/blue-scanner.png',
  import.meta.url,
).href;
const bluePredictionFrame = new URL(
  '../assets/images/blue-prediction-frame.png',
  import.meta.url,
).href;
const questionIcon = new URL(
  '../assets/images/question-icon.png',
  import.meta.url,
).href;
const greenPredictionFrame = new URL(
  '../assets/images/green-prediction-frame.png',
  import.meta.url,
).href;
const checkmarkIcon = new URL(
  '../assets/images/checkmark-icon.png',
  import.meta.url,
).href;
const redPredictionFrame = new URL(
  '../assets/images/red-prediction-frame.png',
  import.meta.url,
).href;
const banIcon = new URL('../assets/images/ban-icon.png', import.meta.url).href;
const polaroidFrame = new URL(
  '../assets/images/polaroid-frame.png',
  import.meta.url,
).href;

/** Previous render state, used to detect mode changes. */
let prevState: Partial<State> = {};

/** Timestamp of the most-recent mode transition. */
let currentModeStartTime = $time();

/** LRU canvas cache for fish frames. */
let canvasCache: CanvasCache;

/** Loaded bot and scanner images, keyed by a role string. */
let botImages: Record<string, HTMLImageElement> = {};

/** Vertical movement speed (px/frame) for the AI bot. */
const botVelocity = 10;

/** Current and target Y positions of the AI bot on the canvas. */
let botY: number | null, botYDestination: number | null;

/** ClassId of the fish currently centred in the predict-mode parade. */
let currentPredictedClassId: number | null;

/** Loaded prediction frame/icon images, keyed by a role string. */
let predictionImages: Record<string, HTMLImageElement> = {};

/** Loaded polaroid frame image. */
let polaroidFrameImage: HTMLImageElement | undefined;

/**
 * currentRawXOffset & lastRawXOffset track fish movement.
 * lastRawXOffset is set every time drawMovingFish() is called, and records
 * our current x offset. This allows the user to pause, play, rewind, and
 * fast-forward the fish without them jumping around as our time scale changes.
 */
let currentRawXOffset: number | null, lastRawXOffset: number | null;

/**
 * Initialize the renderer: create canvas cache and load all image assets.
 *
 * @returns Promise that resolves once all assets are loaded.
 */
export const initRenderer = (): Promise<void[]> => {
  canvasCache = new CanvasCache();
  const promises: Promise<void>[] = [];
  promises.push(loadAllFishPartImages());
  if (getState().loadTrashImages) {
    promises.push(loadAllTrashImages());
    promises.push(loadAllSeaCreatureImages());
    promises.push(initMobilenet());
  }
  return Promise.all(promises);
};

/**
 * Render a single frame of the scene.
 * Schedules the next render frame via requestAnimFrame before doing any work so
 * that exceptions in drawing do not prevent future frames from being rendered.
 */
export const render = (): void => {
  window.requestAnimFrame(render);

  let state = getState();

  if (state.currentMode !== prevState.currentMode) {
    canvasCache.clearCache();
    drawBackground(state);
    currentModeStartTime = $time();
    botY = null;
    botYDestination = null;
    currentPredictedClassId = null;
    currentRawXOffset = null;
    lastRawXOffset = null;
    state = setState({lastPauseTime: 0, lastStartTime: null});

    if (state.currentMode === Modes.Training) {
      state = setState({moveTime: constants.defaultMoveTime / 2});
    } else {
      state = setState({moveTime: constants.defaultMoveTime});
    }

    if (state.currentMode === Modes.Predicting) {
      loadAllBotImages();
      loadAllPredictionImages();
    }
  }

  if (
    state.currentMode === Modes.Predicting &&
    state.lastPauseTime &&
    (state.moveTime !== prevState.moveTime ||
      state.rewind !== prevState.rewind ||
      state.isRunning !== prevState.isRunning)
  ) {
    currentRawXOffset = lastRawXOffset;
  }

  if (state.isRunning && !state.lastStartTime) {
    state = setState({lastStartTime: $time()});
  }

  clearCanvas(state.canvas as HTMLCanvasElement);

  const timeBeforeCanSkipPredict = 5000;
  const timeBeforeCanSkipBiasText = 2000;
  const timeBeforeCanSeePondText = 3000;
  const timeBeforeCanSkipPond = 3000;

  switch (state.currentMode) {
    case Modes.Words:
      drawWordFishImages();
      break;
    case Modes.Training:
      drawPolaroidFrame(state.canvas as HTMLCanvasElement);
      drawMovingFish(state);
      break;
    case Modes.Predicting:
      drawPredictBot(state);
      drawMovingFish(state);

      if (state.appMode === AppMode.CreaturesVTrashDemo) {
        if (state.biasTextTime) {
          setState({
            canSkipPredict:
              $time() >= state.biasTextTime + timeBeforeCanSkipBiasText,
          });
        }
      } else if (state.isRunning) {
        setState({
          canSkipPredict:
            $time() >= (state.runStartTime ?? 0) + timeBeforeCanSkipPredict,
        });
      }

      break;
    case Modes.Pond:
      drawPondFishImages();

      setState({
        canSkipPond: $time() >= currentModeStartTime + timeBeforeCanSkipPond,
        canSeePondText:
          $time() >= currentModeStartTime + timeBeforeCanSeePondText,
      });
      break;
  }

  // Don't draw overlays on loading screens.
  if (
    ![Modes.Loading as number, Modes.IntermediateLoading as number].includes(
      state.currentMode!,
    )
  ) {
    drawOverlays();
  }

  prevState = {...state};
};

/**
 * Load and draw the background image for the current mode onto the background canvas.
 *
 * @param state - Current lab state providing backgroundCanvas and currentMode.
 */
export const drawBackground = (state: State): void => {
  const canvas = state.backgroundCanvas;
  if (!canvas) {
    return;
  }

  const imgPath = backgroundPathForMode(state.currentMode ?? 0);
  if (imgPath) {
    loadImage(imgPath).then(img => {
      canvas
        .getContext('2d')!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
    });
  } else {
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
  }
};

/**
 * Load a single image from a URL.
 *
 * @param imgPath - URL of the image to load.
 * @returns Promise resolving to the loaded HTMLImageElement.
 */
const loadImage = (imgPath: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => {
      reject(new Error(`Failed to load image at #{imgPath}`));
    });
    img.src = imgPath;
  });
};

/** Reload all bot and scanner images into the botImages cache. */
const loadAllBotImages = async (): Promise<void> => {
  botImages = {};
  const imagesToLoad: Record<string, string> = {
    defaultBot: aiBotClosed,
    defaultScanner: blueScanner,
    likeBot: aiBotYes,
    likeScanner: greenScanner,
    dislikeBot: aiBotNo,
    dislikeScanner: redScanner,
  };
  const imagePromises: Promise<void>[] = [];

  Object.keys(imagesToLoad).forEach(key => {
    imagePromises.push(
      loadImage(imagesToLoad[key]).then(img => {
        botImages[key] = img;
      }),
    );
  });

  await Promise.all(imagePromises);
};

/** Reload all prediction frame and icon images into the predictionImages cache. */
const loadAllPredictionImages = async (): Promise<void> => {
  predictionImages = {};
  const imagesToLoad: Record<string, string> = {
    defaultFrame: bluePredictionFrame,
    defaultIcon: questionIcon,
    likeFrame: greenPredictionFrame,
    likeIcon: checkmarkIcon,
    dislikeFrame: redPredictionFrame,
    dislikeIcon: banIcon,
  };
  const imagePromises: Promise<void>[] = [];

  Object.keys(imagesToLoad).forEach(key => {
    imagePromises.push(
      loadImage(imagesToLoad[key]).then(img => {
        predictionImages[key] = img;
      }),
    );
  });

  await Promise.all(imagePromises);
};

/**
 * @param state - Current lab state.
 * @param t - Elapsed playback time in ms.
 * @param offset - Optional initial X offset.
 * @returns Raw (unscaled) X offset value.
 */
const getRawOffsetForTime = (state: State, t: number, offset = 0): number => {
  return offset + t / state.moveTime;
};

/**
 * Calculate the screen X offset for a given playback time using an S-curve.
 *
 * @param state - Current lab state.
 * @param t - Elapsed playback time in ms.
 * @param offset - Optional initial raw offset.
 * @returns Pixel X offset to apply to the fish parade.
 */
const getOffsetForTime = (state: State, t: number, offset = 0): number => {
  let amount = getRawOffsetForTime(state, t, offset);

  amount -= Math.sin(amount * 2 * Math.PI) / (2 * Math.PI);

  return (
    constants.fishCanvasWidth * (state.fishData as unknown[]).length -
    constants.canvasWidth / 2 +
    constants.fishCanvasWidth / 2 -
    Math.round(amount * constants.fishCanvasWidth)
  );
};

/**
 * Given a screen X plus the current X offset, determine which fish index is at that position.
 *
 * @param screenX - Screen X coordinate.
 * @param offsetX - Current X offset.
 * @param totalFish - Total number of fish in the parade.
 * @returns Index of the fish at the given screen position.
 */
const getFishIdxForLocation = (
  screenX: number,
  offsetX: number,
  totalFish: number,
): number => {
  const n = Math.floor((screenX + offsetX) / constants.fishCanvasWidth);
  return totalFish - n;
};

/**
 * Calculate the screen X position for a specific fish in the parade.
 *
 * @param numFish - Total number of fish.
 * @param fishIdx - Index of the fish.
 * @param offsetX - Current X offset.
 * @returns Pixel X coordinate for the fish.
 */
const getXForFish = (
  numFish: number,
  fishIdx: number,
  offsetX: number,
): number => {
  return (numFish - fishIdx) * constants.fishCanvasWidth - offsetX;
};

/**
 * Calculate the screen Y position for a specific fish, accounting for the
 * predict-mode drop and sway effects.
 *
 * @param numFish - Total fish count.
 * @param fishIdx - Index of this fish.
 * @param state - Current lab state.
 * @param offsetX - Current X offset.
 * @param predictedClassId - Predicted class of this fish (null if unknown).
 * @returns Pixel Y coordinate for the fish.
 */
const getYForFish = (
  numFish: number,
  fishIdx: number,
  state: State,
  offsetX: number,
  predictedClassId: number | null | false,
): number => {
  let y = constants.canvasHeight / 2 - constants.fishCanvasHeight / 2;

  if (state.currentMode === Modes.Predicting) {
    y += 50;

    const doesLike = predictedClassId === ClassType.Like;
    if (!doesLike) {
      const midScreenX =
        constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;
      const screenX = getXForFish(numFish, fishIdx, offsetX);
      if (screenX > midScreenX) {
        y += 1.2 * (screenX - midScreenX);
      }
    }

    const swayValue =
      (($time() * 360) / (20 * 1000) + (fishIdx + 1) * 10) % 360;
    const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 8;
    y += swayOffsetY;
  }

  return y;
};

/** Draw the animated fish parade for Training and Predicting modes. */
const drawMovingFish = (state: State): void => {
  const runtime = currentRunTime(state, state.currentMode === Modes.Training);
  let t = currentRawXOffset ? 0 : state.lastPauseTime;
  t += state.rewind ? -runtime : runtime;

  const offsetX = getOffsetForTime(state, t, currentRawXOffset ?? 0);
  lastRawXOffset = getRawOffsetForTime(state, t, currentRawXOffset ?? 0);

  const fishDataArr = state.fishData as OceanObject[];

  const maxScreenX =
    state.currentMode === Modes.Training
      ? constants.canvasWidth - 63
      : constants.canvasWidth + constants.fishCanvasWidth;
  const startFishIdx = Math.max(
    getFishIdxForLocation(maxScreenX, offsetX, fishDataArr.length),
    0,
  );
  const lastFishIdx = Math.min(
    getFishIdxForLocation(0, offsetX, fishDataArr.length),
    fishDataArr.length - 1,
  );
  const ctx = (state.canvas as HTMLCanvasElement).getContext('2d')!;
  const midScreenX = constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;

  let centerFish: OceanObject | undefined;
  for (let i = startFishIdx; i <= lastFishIdx; i++) {
    const fish = fishDataArr[i];
    const x = getXForFish(fishDataArr.length - 1, i, offsetX);
    const result = fish.getResult() as {predictedClassId: number} | null;
    let y = getYForFish(
      fishDataArr.length - 1,
      i,
      state,
      offsetX,
      result ? result.predictedClassId : false,
    );

    let drawPrediction = false;
    if (state.currentMode === Modes.Predicting) {
      if (result) {
        drawPrediction = x >= midScreenX;
        const nearCenterX = x - midScreenX <= 50;

        if (drawPrediction && nearCenterX) {
          centerFish = fish;

          if (
            state.isRunning &&
            state.appMode === AppMode.CreaturesVTrashDemo
          ) {
            if (fish instanceof FishOceanObject) {
              result.predictedClassId = 0;
            } else if (fish instanceof SeaCreatureOceanObject) {
              result.predictedClassId = 1;
            } else {
              result.predictedClassId = 1;
            }

            if (i === lastFishIdx && Math.abs(midScreenX - x) <= 1) {
              finishMovement(t);
              setState({biasTextTime: $time()});
            }
          }
        }
      } else {
        predictFish(state, i).then(prediction => {
          fish.setResult(prediction);
        });
      }
    }

    const drawPolaroidFlag = state.currentMode === Modes.Training;
    let size = 1;
    if (drawPolaroidFlag && state.isRunning && x > midScreenX) {
      size = 0.35;
      y -= Math.sin((runtime / state.moveTime) * Math.PI) * 200;
    }

    drawSingleFish(fish, x, y, ctx, size, drawPrediction, drawPolaroidFlag);
  }

  if (state.currentMode === Modes.Predicting) {
    currentPredictedClassId = centerFish
      ? (centerFish.getResult() as {predictedClassId: number}).predictedClassId
      : null;
  }

  if (state.currentMode === Modes.Training && runtime === state.moveTime) {
    finishMovement(t, false);
  }
};

/**
 * Draw the polaroid frame overlay at the centre of the given canvas.
 *
 * @param canvas - Target canvas for the overlay.
 */
const drawPolaroidFrame = (canvas: HTMLCanvasElement): void => {
  if (polaroidFrameImage) {
    const x = canvas.width / 2 - polaroidFrameImage.width / 2;
    const y = canvas.height / 2 - polaroidFrameImage.height / 2 + 20;

    canvas.getContext('2d')!.drawImage(polaroidFrameImage, x, y);
  } else {
    loadImage(polaroidFrame).then(img => {
      polaroidFrameImage = img;
      drawPolaroidFrame(canvas);
    });
  }
};

/**
 * Draw the polaroid background rectangle around a fish frame.
 *
 * @param ctx - Canvas 2D context to draw into.
 * @param x - Left edge of the fish frame.
 * @param y - Top edge of the fish frame.
 * @param size - Scale multiplier.
 */
const drawPolaroid = (
  _ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size = 1,
): void => {
  const rectSize = constants.fishFrameSize * size;
  const xDiff = Math.abs(rectSize - constants.fishCanvasWidth * size) / 2;
  const adjustedX = x + xDiff;
  const yDiff = Math.abs(rectSize - constants.fishCanvasHeight * size) / 2;
  const adjustedY = y - yDiff;

  const padding = 10 * size;
  const paddingBottom = 60 * size;
  DrawRect(
    adjustedX - padding,
    adjustedY - padding,
    rectSize + padding * 2,
    rectSize + paddingBottom,
    colors.white,
  );
  DrawRect(adjustedX, adjustedY, rectSize, rectSize, colors.darkGrey);
};

/**
 * Map a class ID to the corresponding image role key.
 *
 * @param classId - Predicted class identifier.
 * @returns 'like', 'dislike', or 'default'.
 */
const keyForClassId = (classId: number | null): string => {
  let classKey = 'default';
  if (classId === ClassType.Like) {
    classKey = 'like';
  } else if (classId === ClassType.Dislike) {
    classKey = 'dislike';
  }

  return classKey;
};

/**
 * Draw a prediction stamp (frame + icon) onto the canvas for the given class.
 * No-ops if the required images are not yet loaded.
 *
 * @param ctx - Canvas 2D context.
 * @param x - Left edge of the fish.
 * @param y - Top edge of the fish.
 * @param classId - Predicted class ID.
 */
const drawPrediction = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  classId: number,
): void => {
  const classKey = keyForClassId(classId);
  const frame = predictionImages[`${classKey}Frame`];
  const icon = predictionImages[`${classKey}Icon`];
  const w = (frame && frame.width) || constants.fishFrameSize;
  const h = (frame && frame.height) || constants.fishFrameSize;
  const adjustedX = x + Math.abs(w - constants.fishCanvasWidth) / 2;
  const adjustedY = y - Math.abs(h - constants.fishCanvasHeight) / 2;

  if (frame) {
    ctx.drawImage(frame, adjustedX, adjustedY);
  }

  if (icon) {
    const iconX = adjustedX + w / 2 - icon.width / 2;
    const iconY = adjustedY + h + 15;
    ctx.drawImage(icon, iconX, iconY);
  }
};

/** Last scanner image drawn, used to detect scanner changes for sound triggers. */
let lastScannerImg: HTMLImageElement | null = null;

/**
 * Draw the AI bot and its scanner to the canvas for predict mode.
 * No-ops if the required bot/scanner images are not yet loaded.
 *
 * @param state - Current lab state.
 */
const drawPredictBot = (state: State): void => {
  const classKey = keyForClassId(currentPredictedClassId);
  const botImg = botImages[`${classKey}Bot`];
  const scannerImg = botImages[`${classKey}Scanner`];

  if (!botImg || !scannerImg) {
    return;
  }

  if (scannerImg !== lastScannerImg) {
    if (scannerImg === botImages.likeScanner) {
      soundLibrary.playSound('sortyes');
    } else if (scannerImg === botImages.dislikeScanner) {
      soundLibrary.playSound('sortno');
    }
    lastScannerImg = scannerImg;
  }

  const canvas = state.canvas as HTMLCanvasElement;
  const botX = canvas.width / 2 - botImg.width / 2;
  botY = botY || canvas.height / 2 - botImg.height / 2;
  const ctx = canvas.getContext('2d')!;

  if (state.isRunning || state.isPaused) {
    botYDestination = botYDestination || botY - 179;

    const distToDestination = Math.abs(botYDestination - botY);
    if (distToDestination > 1) {
      const direction = distToDestination === botYDestination - botY ? 1 : -1;
      botY += direction * botVelocity;
    }

    const scannerX = canvas.width / 2 - scannerImg.width / 2;
    ctx.drawImage(scannerImg, scannerX, botY + 50);
  }

  ctx.drawImage(botImg, botX, botY);
};

/** Draw the word-mode fish swimming across the screen in their lanes. */
const drawWordFishImages = (): void => {
  const canvas = getState().canvas as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const state = getState();

  const fishScale = 0.7;
  const possibleFishComponents = filterFishComponents(
    fishData as unknown as Record<
      string,
      Record<string, {exclusions?: string[]}>
    >,
    state.appMode,
  ) as unknown as typeof fishData;
  let fishCount = state.fishCount;
  let newFishGenerated = false;

  const t = $time();
  Object.keys(state.wordFish!).forEach(laneKey => {
    const lane = Number(laneKey);
    let fish = (state.wordFish as Record<number, FishOceanObject | null>)[lane];
    if (
      !newFishGenerated &&
      (!fish ||
        fish.xy!.x > constants.canvasWidth + constants.fishCanvasWidth ||
        fish.xy!.x < -constants.fishCanvasWidth)
    ) {
      const newFish = new FishOceanObject(fishCount, possibleFishComponents);
      fishCount++;
      newFish.randomize();
      const y = lane * constants.fishCanvasHeight * fishScale;
      newFish.setXY({x: -constants.fishCanvasWidth, y});
      newFish.faceLeft = Math.random() < 0.5 ? true : false;
      (state.wordFish as Record<number, FishOceanObject | null>)[lane] =
        newFish;
      fish = newFish;
      newFishGenerated = true;
    } else if (fish) {
      const swayValue = ((t * 360) / (20 * 1000)) % 360;
      const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 3) / 20;

      const xy = fish.getXY()!;
      if (!fish.startTime) {
        fish.startTime = t;
        fish.speed = randomInt(10, 15) * 1000;
      }
      let finalX: number;
      if (fish.faceLeft) {
        finalX =
          constants.canvasWidth +
          constants.fishCanvasWidth -
          (constants.canvasWidth / fish.speed!) * (t - fish.startTime!);
      } else {
        finalX =
          (constants.canvasWidth / fish.speed!) * (t - fish.startTime!) -
          constants.fishCanvasWidth;
      }
      const finalY = xy.y + swayOffsetY;
      fish.setXY({x: finalX, y: finalY});

      drawSingleFish(fish, finalX, finalY, ctx, fishScale);
    }
  });

  setState({fishCount});
};

/** Transition duration in ms for pond fish animations. */
const pondFishTransitionTime = 1500;

/** Total X offset applied during a pond fish transition. */
const totalPondFishXOffset = 1000;

/** Draw the pond-mode fish grid, applying transition and sway effects. */
const drawPondFishImages = (): void => {
  const state = getState();
  const ctx = (state.canvas as HTMLCanvasElement).getContext('2d')!;
  const fishes = (
    state.showRecallFish ? state.recallFish : state.pondFish
  ) as OceanObject[];

  let transitionOffset = 0;
  if (state.pondFishTransitionStartTime) {
    const t = $time() - state.pondFishTransitionStartTime;
    transitionOffset = (t / pondFishTransitionTime) * totalPondFishXOffset;

    if (t > pondFishTransitionTime) {
      setState({
        showRecallFish: !state.showRecallFish,
        pondFishTransitionStartTime: null,
      });
    }
  }

  const fishBounds: Array<{
    fishId: unknown;
    x: number;
    y: number;
    w: number;
    h: number;
  }> = [];

  [false, true].forEach(drawClickedFish => {
    fishes.forEach(fish => {
      const pondClickedFish = getState().pondClickedFish;
      const pondClickedFishUs = !!(
        pondClickedFish && fish.id === pondClickedFish.id
      );

      if (drawClickedFish === pondClickedFishUs) {
        const swayValue =
          (($time() * 360) / (20 * 1000) +
            ((fish.getId() as number) + 1) * 10) %
          360;
        let swayOffsetX = Math.sin(((swayValue * Math.PI) / 180) * 2) * 25;
        let swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 2;

        if (transitionOffset > 0 && (fish.getId() as number) % 2 === 0) {
          swayOffsetX *= 2;
          swayOffsetY *= 5;
        }

        const xy = fish.getXY()!;
        const finalX = xy.x + swayOffsetX + transitionOffset;
        const finalY = xy.y + swayOffsetY;

        const size = pondClickedFishUs ? 1 : 0.5;

        const fishBound = drawSingleFish(fish, finalX, finalY, ctx, size);

        fishBounds.push({
          fishId: fish.id,
          ...fishBound,
        });
      }
    });
  });

  setState({pondFishBounds: fishBounds}, {skipCallback: true});
};

/**
 * Draw a single fish onto the canvas, using the canvas cache when possible.
 *
 * @param fish - The OceanObject to draw.
 * @param fishXPos - Target X coordinate.
 * @param fishYPos - Target Y coordinate.
 * @param ctx - Canvas 2D context to draw into.
 * @param size - Scale multiplier (1 = full size).
 * @param withPrediction - When true, overlay the prediction stamp.
 * @param withPolaroid - When true, draw the polaroid background frame.
 * @returns Bounding box of the drawn fish: {x, y, w, h}.
 */
const drawSingleFish = (
  fish: OceanObject,
  fishXPos: number,
  fishYPos: number,
  ctx: CanvasRenderingContext2D,
  size = 1,
  withPrediction = false,
  withPolaroid = false,
): {x: number; y: number; w: number; h: number} => {
  const [fishCanvas, hit] = canvasCache.getCanvas(String(fish.id));
  if (!hit) {
    fishCanvas.width = constants.fishCanvasWidth;
    fishCanvas.height = constants.fishCanvasHeight;
    fish.drawToCanvas(fishCanvas);
  }

  const width = fishCanvas.width * size;
  const height = fishCanvas.height * size;

  const adjustedFishXPos = fishXPos - width / 2 + fishCanvas.width / 2;
  const adjustedFishYPos = fishYPos - height / 2 + fishCanvas.height / 2;

  if (withPolaroid) {
    drawPolaroid(ctx, adjustedFishXPos, adjustedFishYPos, size);
  }

  if (withPrediction && fish.getResult()) {
    drawPrediction(
      ctx,
      adjustedFishXPos,
      adjustedFishYPos,
      (fish.getResult() as {predictedClassId: number}).predictedClassId,
    );
  }

  const finalX = Math.round(adjustedFishXPos);
  const finalY = Math.round(adjustedFishYPos);

  ctx.drawImage(fishCanvas, finalX, finalY, width, height);

  return {x: finalX, y: finalY, w: width, h: height};
};

/**
 * Clear all drawn content from the sprite canvas.
 *
 * @param canvas - The canvas to clear.
 */
export const clearCanvas = (canvas: HTMLCanvasElement): void => {
  canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
};

/** Draw a full-canvas fade overlay used for mode transition effects. */
const drawOverlays = (): void => {
  const duration = $time() - currentModeStartTime;
  let amount = 1 - duration / 800;
  if (amount < 0) {
    amount = 0;
  }
  DrawFade(amount, '#000');
};

/**
 * Draw a translucent colour overlay across the entire canvas.
 *
 * @param amount - Opacity of the overlay (0–1).
 * @param overlayColour - CSS colour string for the overlay.
 */
const DrawFade = (amount: number, overlayColour: string): void => {
  if (amount === 0) {
    return;
  }

  const canvasCtx = (getState().canvas as HTMLCanvasElement).getContext('2d')!;
  canvasCtx.globalAlpha = amount;
  DrawRect(0, 0, constants.canvasWidth, constants.canvasHeight, overlayColour);
  canvasCtx.globalAlpha = 1;
};

/**
 * Draw a filled or stroked rectangle on the main canvas.
 *
 * @param x - Left edge.
 * @param y - Top edge.
 * @param w - Width.
 * @param h - Height.
 * @param color - CSS colour string.
 * @param filled - When true (default) fill the rect; otherwise stroke it.
 */
const DrawRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  filled = true,
): void => {
  x = Math.floor(x / 1);
  y = Math.floor(y / 1);
  w = Math.floor(w / 1);
  h = Math.floor(h / 1);

  const canvasCtx = (getState().canvas as HTMLCanvasElement).getContext('2d')!;
  if (filled) {
    if (color) {
      canvasCtx.fillStyle = color;
    }

    canvasCtx.fillRect(x, y, w, h);
  } else {
    if (color) {
      canvasCtx.strokeStyle = color;
    }

    canvasCtx.rect(x, y, w, h);
  }
};

// A single frame of animation.
window.requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    (window as unknown as Record<string, unknown>)[
      'webkitRequestAnimationFrame'
    ] ||
    (window as unknown as Record<string, unknown>)[
      'mozRequestAnimationFrame'
    ] ||
    (window as unknown as Record<string, unknown>)['oRequestAnimationFrame'] ||
    (window as unknown as Record<string, unknown>)['msRequestAnimationFrame'] ||
    function (/* function */ callback: () => void) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})() as (cb: () => void) => void;
