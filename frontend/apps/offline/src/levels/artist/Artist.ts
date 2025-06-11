import {ArtistData} from '@/app/models/level';
import ExecutionInfo from '@/levels/maze/ExecutionInfo';
import {evalWith} from '@/levels/maze/interpreter';

import type {
  Action,
  MoveAction,
  ForwardAction,
  JumpDirectionAction,
  JumpForwardAction,
  MoveDiagonallyAction,
  GlobalAlphaAction,
  PenStyleAction,
  PenWidthAction,
  PenColourAction,
  DrawShapeAction,
  DrawStickerAction,
  SetArtistAction,
  JumpToAction,
  PointToAction,
  RotateAction,
} from './api';
import Driver, {CANVAS_WIDTH, CANVAS_HEIGHT} from './Driver';
import type {Skin} from './skins';

const MAX_STICKER_SIZE = 100;
const MAX_SHAPE_SIZE = 400;

const SMOOTH_ANIMATE_STEP_SIZE = 5;
const FAST_SMOOTH_ANIMATE_STEP_SIZE = 15;

/**
 * The options to use when instantiating an Artist level.
 */
export interface ArtistOptions {
  /** Any custom API calls to add to the program runtime environment */
  api: object;
  /** Level data, such as starting position, etc */
  level: ArtistData;
  /** Whether or not to instantly animate the running program */
  instant: boolean;
  /** The target is early-education */
  isK1: boolean;
  /** The skin (visual theme) information */
  skin: Skin;
  /** The container for the canvas */
  container: HTMLElement;
  /** Any Artist code to run during initialization */
  predrawCode?: string;
  /** The solution code to run to show a trace of the solution */
  solutionCode?: string;
}

/**
 * Implements the Artist game lab.
 */
class Artist {
  /** Retains options used to construct the class */
  private options: ArtistOptions;
  /** The drawing class the implements the artist canvas */
  private driver: Driver | undefined;
  /** The execution context when running artist programs */
  private executionInfo: ExecutionInfo;
  /** The function API for the level */
  private api: object;
  /** Skin (visual theme) information */
  private skin: Skin;
  /** The set of stickers keyed by name */
  private stickers: {
    [key: string]: HTMLImageElement;
  };
  /** Keeps track of whether or not the stickers have all loaded. */
  private stickerLoader: Promise<void>;
  /** The set of shapes keyed by name */
  private shapes: {
    [key: string]: HTMLImageElement;
  };
  /** Keeps track of whether or not the shapes have all loaded. */
  private shapesLoader: Promise<void>;
  /** Keeps track of the loading of line and path patterns. */
  private patternLoader: Promise<void>;
  /** The list of line patterns. */
  private linePatterns: {
    [key: string]: string;
  };
  /** The loaded set of path patterns from line patterns */
  private loadedPathPatterns: {
    [key: string]: HTMLImageElement;
  };
  /** Keeps track of the loading of the avatar (the 'turtle') */
  private avatarLoader: Promise<void>;
  /** The avatar image */
  private avatarImage: HTMLImageElement | undefined;
  /** Finally, the promise tracking the driver being loaded and ready */
  private driverLoader: Promise<void>;
  /** Our animation timer task. */
  private pid: ReturnType<typeof setTimeout> | null;
  /** Program log */
  private log: Action[];
  /** Whether or not this is a frozen level */
  private isFrozenSkin: boolean;
  /** The current speed value */
  private speed: number;
  /** Whether or not we should animate the current step being invoked */
  private shouldAnimate: boolean;

  /**
   * Instantiates an Artist class.
   */
  constructor(options: ArtistOptions) {
    this.options = options;
    this.pid = null;
    this.speed = 500;
    this.shouldAnimate = false;

    const {api, skin} = options;

    // Create execution context
    this.executionInfo = new ExecutionInfo({ticks: 1000});

    // Capture API calls
    this.api = api;

    // The initial program log
    this.log = [];

    // Load skin (and start preloading stickers in the background)
    this.skin = skin;
    this.isFrozenSkin = skin.id === 'anna' || skin.id === 'elsa';
    this.stickers = {};
    this.stickerLoader = this.preloadAllStickerImages();

    // Load shapes in the background
    this.shapes = {};
    this.shapesLoader = this.preloadAllShapeImages();

    // Load patterns
    this.linePatterns = this.skin.linePatterns || {};
    this.loadedPathPatterns = {};
    this.patternLoader = this.preloadAllPatternImages();

    // Load avatar
    this.avatarLoader = this.preloadAvatar();

    // Create the visualization instance
    this.driverLoader = this.initialize();
  }

  /**
   * Grabs the avatar image.
   */
  async preloadAvatar(): Promise<void> {
    return new Promise<void>(resolve => {
      this.avatarImage = new Image();
      this.avatarImage.onerror = () => resolve();
      this.avatarImage.onload = () => resolve();
      this.avatarImage.src = this.skin.avatar;
    });
  }

  /**
   * Initializes all sticker images as defined in this.skin.stickers, if any,
   * storing the created images in this.stickers.
   *
   * NOTE: initializes this.stickers as a side effect
   *
   * @return {Promise} that resolves once all images have finished loading,
   *         whether they did so successfully or not (or that resolves instantly
   *         if there are no images to load).
   */
  async preloadAllStickerImages(): Promise<void> {
    const loadSticker = (name: string) =>
      new Promise<void>(resolve => {
        const src: string | undefined = this.skin?.stickers?.[name];
        if (src) {
          const img = new Image();

          img.onload = () => resolve();
          img.onerror = () => resolve();

          img.src = src;
          this.stickers[name] = img;
        }
      });

    const stickers = this.skin?.stickers || {};
    const stickerNames = Object.keys(stickers);
    await Promise.all(stickerNames.map(loadSticker));
  }

  /**
   * Initializes all geometry sticker images as defined in this.skin.shapes,
   * if any, storing the created images in this.shapes.
   *
   * NOTE: initializes this.shapes as a side effect
   *
   * @return {Promise} that resolves once all images have finished loading,
   *         whether they did so successfully or not (or that resolves instantly
   *         if there are no images to load).
   */
  async preloadAllShapeImages(): Promise<void> {
    const loadShape = (name: string) =>
      new Promise<void>(resolve => {
        const src: string | undefined = this.skin?.shapes?.[name];
        if (src) {
          const img = new Image();

          img.onload = () => resolve();
          img.onerror = () => resolve();

          img.src = src;
          this.shapes[name] = img;
        }
      });

    const shapes = this.skin?.shapes || {};
    const shapeNames = Object.keys(shapes);
    await Promise.all(shapeNames.map(loadShape));
  }

  /**
   * Initializes all pattern images as defined in
   * this.skin.lineStylePatternOptions, if any, storing the created images in
   * this.loadedPathPatterns.
   *
   * @return {Promise} that resolves once all images have finished loading,
   *         whether they did so successfully or not (or that resolves instantly
   *         if there are no images to load).
   */
  async preloadAllPatternImages(): Promise<void> {
    const loadPattern = (patternOption: [string, string]) =>
      new Promise<void>(resolve => {
        const pattern = patternOption[1];

        if (this.linePatterns[pattern] && !this.loadedPathPatterns[pattern]) {
          const img = new Image();

          img.onload = () => resolve();
          img.onerror = () => resolve();

          this.loadedPathPatterns[pattern] = img;
          img.src = this.linePatterns[pattern];
        } else {
          resolve();
        }
      });

    const patternOptions = this.skin?.lineStylePatternOptions || [];
    await Promise.all(patternOptions.map(loadPattern));
  }

  async preloadAll(): Promise<void> {
    await this.driverLoader;
  }

  async initialize() {
    console.log('INITIALIZE WAITING');
    await Promise.all([
      this.stickerLoader,
      this.patternLoader,
      this.shapesLoader,
      this.avatarLoader,
    ]);
    console.log('INITIALIZE STARTING');

    const {container, isK1, predrawCode, skin, solutionCode} = this.options;
    console.log('making visualization', skin);
    this.driver = new Driver({
      avatar: {
        ...(skin.avatarSettings || {
          width: 0,
          height: 0,
          numFrames: 0,
          numHeadings: 0,
          visible: false,
        }),
        image: this.avatarImage || new Image(),
      },
      isK1,
      isFrozenSkin: this.isFrozenSkin,
      decorationAnimationImage: new Image(),
      showDecoration: () => skin.id === 'elsa',
    });
    container.innerHTML = '';
    container.appendChild(this.driver.displayCanvas);
    console.log('made visualization', this.driver);

    // Draw images
    this.drawImages();

    // Run solution code
    if (solutionCode) {
      // Draw the answer twice; once to the display canvas and once again in a
      // normalized version to the validation canvas
      if (this.driver.ctxAnswer) {
        this.drawBlocksOnCanvas(solutionCode, this.driver.ctxAnswer);
      }
      if (this.driver.ctxNormalizedAnswer) {
        this.driver.shouldDrawNormalized_ = true;
        this.drawBlocksOnCanvas(solutionCode, this.driver.ctxNormalizedAnswer);
        this.driver.shouldDrawNormalized_ = false;
      }
    }

    // Run predraw code
    if (predrawCode && this.driver.ctxPredraw) {
      this.driver.isPredrawing_ = true;
      this.drawBlocksOnCanvas(predrawCode, this.driver.ctxPredraw);
      this.driver.isPredrawing_ = false;
    }

    this.reset();
    this.driver.display();
  }

  /**
   * Draw the images for this page and level onto this.visualization.ctxImages.
   */
  drawImages() {
    if (!this.driver) {
      return;
    }

    for (const {filename, position, scale} of this.options.level.images) {
      this.placeImage(filename, position, scale);
    }

    if (this.driver.ctxImages && this.driver.ctxScratch) {
      this.driver.ctxImages.globalCompositeOperation = 'copy';
      this.driver.ctxImages.drawImage(this.driver.ctxScratch.canvas, 0, 0);
      this.driver.ctxImages.globalCompositeOperation = 'source-over';
    }
  }

  /**
   * Place an image at the specified coordinates.
   * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
   * @param {string} filename Relative path to image.
   * @param {!Array} position An x-y pair.
   * @param {number} optional scale at which image is drawn
   */
  placeImage(filename: string, position: [number, number], scale?: number) {
    const img = new Image();
    img.onload = () => {
      if (img.width !== 0) {
        if (this.driver?.ctxImages) {
          if (scale) {
            this.driver?.ctxImages.drawImage(
              img,
              position[0],
              position[1],
              img.width,
              img.height,
              0,
              0,
              img.width * scale,
              img.height * scale,
            );
          } else {
            this.driver?.ctxImages.drawImage(img, position[0], position[1]);
          }
        }
      }

      this.driver?.display();
    };

    if (this.isFrozenSkin) {
      img.src = this.skin.assetUrl(filename);
    } else {
      // This is necessary when loading images from image.code.org to
      // request the image with ACAO headers so that canvas will not flag
      // it as tainted
      img.crossOrigin = 'anonymous';
      img.src = filename.startsWith('http')
        ? filename
        : this.skin.assetUrl('media/turtle/' + filename);
    }
  }

  /**
   * Execute one step.
   * @param command - Logo-style command (e.g. 'FD' or 'RT').
   * @param values - List of arguments for the command.
   * @param options - just one option for now: smoothAnimate (true/false)
   */
  performAction(
    action: Action,
    options: {
      smoothAnimate: boolean;
    },
  ): boolean {
    let tupleDone = true;
    console.log('PERFORM', action);

    const {command} = action;

    if (command === 'FD') {
      // Forward
      const {distance} = (action as ForwardAction).arguments;
      const result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.driver?.moveForward(result.distance, false);
    } else if (command === 'JF') {
      // Jump forward
      const {distance} = (action as JumpForwardAction).arguments;
      const result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.driver?.jumpForward(result.distance);
    } else if (command === 'MV') {
      // Move (direction)
      const {distance, heading} = (action as MoveAction).arguments;
      const result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.driver?.setHeading(heading);
      this.driver?.moveForward(result.distance, false);
    } else if (command === 'JT') {
      // Jump To Location
      const {x, y} = (action as JumpToAction).arguments;
      this.driver?.jumpTo(x, y);
    } else if (command === 'MD') {
      // Move diagonally (use longer steps if showing joints)
      const {distance, heading} = (action as MoveDiagonallyAction).arguments;
      const result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.driver?.setHeading(heading);
      this.driver?.moveForward(result.distance, true);
    } else if (command === 'JD') {
      // Jump (direction)
      const {distance, heading} = (action as JumpDirectionAction).arguments;
      const result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.driver?.setHeading(heading);
      this.driver?.jumpForward(result.distance);
    } else if (command === 'RT') {
      // Rotate
      const {angle} = (action as RotateAction).arguments;
      const result = this.calculateSmoothAnimate(options, angle);
      tupleDone = result.tupleDone;
      this.driver?.turnByDegrees(result.distance);
    } else if (command === 'PT') {
      // Point To
      const {angle} = (action as PointToAction).arguments;
      this.driver?.pointTo(angle);
    } else if (command === 'GA') {
      // Global Alpha
      const {alpha} = (action as GlobalAlphaAction).arguments;
      if (this.driver && this.driver.ctxScratch) {
        this.driver.ctxScratch.globalAlpha =
          Math.max(0, Math.min(100, alpha)) / 100;
      }
    } else if (command === 'PU') {
      // Pen Up
      if (this.driver) {
        this.driver.penDownValue = false;
      }
    } else if (command === 'PD') {
      // Pen Down
      if (this.driver) {
        this.driver.penDownValue = true;
      }
    } else if (command === 'PW') {
      // Pen Width
      const {width} = (action as PenWidthAction).arguments;
      if (this.driver && this.driver.ctxScratch) {
        this.driver.ctxScratch.lineWidth = width;
      }
    } else if (command === 'PC') {
      // Pen Colour
      const {colour} = (action as PenColourAction).arguments;
      if (this.driver && this.driver.ctxScratch) {
        this.driver.ctxScratch.strokeStyle = colour;
        this.driver.ctxScratch.fillStyle = colour;
        if (!this.isFrozenSkin) {
          this.driver.isDrawingWithPattern = false;
        }
      }
    } else if (command === 'PS') {
      // Pen style with image
      const {pattern} = (action as PenStyleAction).arguments;
      if (pattern === 'DEFAULT') {
        this.setPattern(null);
      } else {
        this.setPattern(pattern);
      }
    } else if (command === 'HT') {
      // Hide Turtle
      if (this.driver) {
        this.driver.avatar.visible = false;
      }
    } else if (command === 'ST') {
      // Show Turtle
      if (this.driver) {
        this.driver.avatar.visible = true;
      }
    } else if (command === 'shape') {
      const {size, shape} = (action as DrawShapeAction).arguments;

      // Shapes are scaled up 4 times. The student is specifying the
      // length of one side of the image, not the size of the entire image.
      const realSize = size <= 0 ? MAX_SHAPE_SIZE : size * 4;

      const realShape = this.driver?.shouldDrawNormalized_
        ? Object.keys(this.shapes)[0]
        : shape;

      const img = this.shapes[realShape];

      const dimensions = Artist.scaleToBoundingBox(
        realSize,
        img.width,
        img.height,
      );
      const width = dimensions.width;
      const height = dimensions.height;

      // Rotate the image such the turtle is at the center of the bottom of
      // the image and the image is pointing (from bottom to top) in the same
      // direction as the turtle.
      if (this.driver?.ctxScratch) {
        this.driver?.ctxScratch.save();
        this.driver?.ctxScratch.translate(this.driver?.x, this.driver?.y);
        this.driver?.ctxScratch.rotate(
          this.driver?.degreesToRadians_(this.driver?.heading),
        );
        this.driver?.ctxScratch.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          -width / 2,
          -height,
          width,
          height,
        );

        this.driver?.ctxScratch.restore();
      }
    } else if (command === 'sticker') {
      const {size, sticker} = (action as DrawStickerAction).arguments;

      const realSize = size <= 0 ? MAX_STICKER_SIZE : size;
      const realSticker = this.driver?.shouldDrawNormalized_
        ? Object.keys(this.stickers)[0]
        : sticker;

      const img = this.stickers[realSticker];

      const dimensions = Artist.scaleToBoundingBox(
        realSize,
        img.width,
        img.height,
      );
      const width = dimensions.width;
      const height = dimensions.height;

      // Rotate the image such the turtle is at the center of the bottom of
      // the image and the image is pointing (from bottom to top) in the same
      // direction as the turtle.
      if (this.driver?.ctxScratch) {
        this.driver?.ctxScratch.save();
        this.driver?.ctxScratch.translate(this.driver?.x, this.driver?.y);
        this.driver?.ctxScratch.rotate(
          this.driver?.degreesToRadians_(this.driver?.heading),
        );
        this.driver?.ctxScratch.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          -width / 2,
          -height,
          width,
          height,
        );

        this.driver?.ctxScratch.restore();
      }
    } else if (command === 'setArtist') {
      const {artist} = (action as SetArtistAction).arguments;
      if (this.skin.id !== artist) {
        // TODO: load skin using skinFor and re-invoke preloadAvatar
        //this.skin = ArtistSkins.load(this.studioApp_.assetUrl, artist);
        //this.loadTurtle(false /* initializing */);
        this.preloadAvatar().then(() => {
          if (this.driver) {
            this.driver.avatar = {
              ...(this.skin.avatarSettings || {
                width: 0,
                height: 0,
                numFrames: 0,
                numHeadings: 0,
                visible: false,
              }),
              image: this.avatarImage || new Image(),
            };
          }
          this.linePatterns = this.skin.linePatterns || {};
          this.preloadAllPatternImages().then(() => this.resetPattern());
        });
      }
    }

    return tupleDone;
  }

  calculateSmoothAnimate(
    options: {
      smoothAnimate: boolean;
    },
    distance: number,
  ): {
    tupleDone: boolean;
    distance: number;
  } {
    if (!this.driver) {
      return {
        tupleDone: false,
        distance: 0,
      };
    }

    let tupleDone = true;
    let stepDistanceCovered = this.driver.stepDistanceCovered;

    if (options?.smoothAnimate) {
      const fullDistance = distance;
      const smoothAnimateStepSize = this.driver.smoothAnimateStepSize;

      if (fullDistance < 0) {
        // Going backward.
        if (stepDistanceCovered - smoothAnimateStepSize <= fullDistance) {
          // clamp at maximum
          distance = fullDistance - stepDistanceCovered;
          stepDistanceCovered = fullDistance;
        } else {
          distance = -smoothAnimateStepSize;
          stepDistanceCovered -= smoothAnimateStepSize;
          tupleDone = false;
        }
      } else {
        // Going forward.
        if (stepDistanceCovered + smoothAnimateStepSize >= fullDistance) {
          // clamp at maximum
          distance = fullDistance - stepDistanceCovered;
          stepDistanceCovered = fullDistance;
        } else {
          distance = smoothAnimateStepSize;
          stepDistanceCovered += smoothAnimateStepSize;
          tupleDone = false;
        }
      }
    }

    this.driver.stepDistanceCovered = stepDistanceCovered;

    return {
      tupleDone: tupleDone,
      distance: distance,
    };
  }

  /**
   * Given the width and height of a rectangle this scales the dimensions
   * proportionally such that neither is larger than a given maximum size.
   *
   * @param maxSize - The maximum size of either dimension
   * @param width - The current width of a rectangle
   * @param height - The current height of a rectangle
   * @return an object containing the scaled width and height.
   */
  static scaleToBoundingBox(
    maxSize: number,
    width: number,
    height: number,
  ): {
    width: number;
    height: number;
  } {
    if (width < maxSize && height < maxSize) {
      return {
        width: width,
        height: height,
      };
    }

    const newWidth = width > height ? maxSize : width * (maxSize / height);
    const newHeight = width > height ? height * (maxSize / width) : maxSize;

    return {
      width: newWidth,
      height: newHeight,
    };
  }

  drawBlocksOnCanvas(code: string, canvas: CanvasRenderingContext2D) {
    this.evaluate(code);
    this.drawLogOnCanvas(this.log, canvas);
  }

  drawLogOnCanvas(log: Action[], ctx: CanvasRenderingContext2D) {
    if (!this.driver) {
      return;
    }

    // Reset graphic.
    this.reset();

    while (log.length > 0) {
      const action: Action | undefined = log.shift();
      if (action) {
        this.performAction(action, {smoothAnimate: false});
      }
    }

    console.log('ctx?', ctx);
    if (this.driver.ctxScratch) {
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(this.driver.ctxScratch.canvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  /**
   * Loads the code and evaluates it.
   */
  evaluate(code: string) {
    // Reset graphic.
    this.reset();

    // Run the interpreter
    evalWith(code, {
      Artist: {
        executionInfo: this.executionInfo,
        ...this.api,
        log: this.log,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        Artist: {},
      },
    });
  }

  /**
   * Fully run the simulation.
   */
  async run() {
    // Ensure all assets are loaded
    await this.preloadAll();
    console.log('running');

    // Animate all steps
    let animating = true;
    this.shouldAnimate = true;
    while (animating) {
      animating = await this.animate();
    }
    this.shouldAnimate = false;
  }

  /**
   * Performs a single step.
   */
  async step() {
    // Ensure all assets are loaded
    await this.preloadAll();

    // Animate one step
    this.shouldAnimate = true;
    await this.animate();
    this.shouldAnimate = false;
  }

  /**
   * Resets the state of the canvas.
   */
  reset() {
    if (!this.driver) {
      return;
    }

    // Reset the graphic
    this.driver.reset(
      this.options.level.startDirection,
      this.options.level.initialX,
      this.options.level.initialY,
    );

    // Reset to the starting pattern, if any
    this.resetPattern();

    // Kill any task.
    if (this.pid) {
      clearTimeout(this.pid);
    }
    this.pid = null;
  }

  /**
   * Iterate through the recorded path and animate the turtle's actions.
   *
   * @return boolean true if there is more to animate, false if finished.
   */
  async animate(): Promise<boolean> {
    // Kill any task before we start.
    if (this.pid) {
      clearTimeout(this.pid);
    }
    this.pid = null;

    console.log('animate', this.log);
    if (this.log.length === 0) {
      if (!this.shouldAnimate) {
        this.driver?.display();
      }
      return false;
    }

    const stepSpeed = this.speed;

    // Scale the speed non-linearly, to give better precision at the fast end.
    //var stepSpeed =
    // (1000 * Math.pow(1 - this.speedSlider.getValue(), 2)) /
    //  this.skin.speedModifier;

    if (this.driver) {
      // when smoothAnimate is true, we divide long steps into partitions of this
      // size.
      this.driver.smoothAnimateStepSize =
        stepSpeed === 0
          ? FAST_SMOOTH_ANIMATE_STEP_SIZE
          : SMOOTH_ANIMATE_STEP_SIZE;
    }

    let executeSecondTuple: boolean = false;
    do {
      // Unless something special happens, we will just execute a single tuple.
      executeSecondTuple = false;

      const action = this.log[0];

      if (this.shouldAnimate) {
        //const id = action.arguments.id;
        //this.studioApp_.highlight(String(id));
      }

      // Should we execute another tuple in this frame of animation?
      if (this.skin.consolidateTurnAndMove && this.checkforTurnAndMove()) {
        executeSecondTuple = true;
      }

      // We only smooth animate for Anna & Elsa, and only if there is not another tuple to be done.

      const tupleDone = this.performAction(action, {
        smoothAnimate: !!(this.skin.smoothAnimate && !executeSecondTuple),
      });

      if (this.shouldAnimate) {
        this.driver?.display();
      }

      if (tupleDone) {
        this.log.shift();
        this.resetStepInfo();
      }
    } while (executeSecondTuple);

    if (!this.options.instant) {
      return new Promise<boolean>(resolve => {
        this.pid = setTimeout(() => {
          resolve(true);
        }, stepSpeed);
      });
    } else {
      return true;
    }
  }

  /**
   * Special case: if we have a turn, followed by a move forward, then we can just
   * do the turn instantly and then begin the move forward in the same frame.
   */
  checkforTurnAndMove(): boolean {
    let nextIsForward = false;

    const action = this.log[0];
    const {command} = action;

    // Check first for a small turn movement.
    if (command === 'RT') {
      const {angle} = (action as RotateAction).arguments;
      if (Math.abs(angle) <= 10) {
        // Check that next command is a move forward.
        if (this.log.length > 1) {
          const nextAction = this.log[1];
          const {command: nextCommand} = nextAction;
          if (nextCommand === 'FD') {
            nextIsForward = true;
          }
        }
      }
    }

    return nextIsForward;
  }

  resetStepInfo() {
    if (this.driver) {
      this.driver.stepStartX = this.driver.x;
      this.driver.stepStartY = this.driver.y;
      this.driver.stepDistanceCovered = 0;
    }
  }

  /**
   * Sets the line pattern to use when drawing. When `null` is specified, it unsets
   * the image pattern and does not use an image to draw.
   */
  setPattern(pattern: string | null) {
    if (this.driver?.shouldDrawNormalized_) {
      pattern = null;
    }

    if (pattern === null) {
      if (this.driver) {
        this.driver.currentPathPattern = new Image();
        this.driver.isDrawingWithPattern = false;
      }
    } else if (this.loadedPathPatterns[pattern]) {
      if (this.driver) {
        this.driver.currentPathPattern = this.loadedPathPatterns[pattern];
        this.driver.isDrawingWithPattern = true;
      }
    }
  }

  /**
   * Selects the default starting pattern for the skin.
   */
  resetPattern() {
    if (this.skin.id === 'anna') {
      this.setPattern('annaLine');
    } else if (this.skin.id === 'elsa') {
      this.setPattern('elsaLine');
    } else {
      // Reset to empty pattern
      this.setPattern(null);
    }
  }
}

export default Artist;
