// The particle layer: the scene's weather and the bursts in flight, and the
// images they are drawn from. The engine owns one, hands it the world the
// particles fly through, and asks it to step and draw inside the paint.

import sparkUrl from '@cdo/static/spritelab_lab2/particles/spark.png';

import {
  Burst,
  BurstCanvas,
  burstOrigin,
  BurstScene,
  BurstShape,
  createBurst,
  drawBursts,
  isBurstLook,
  MAX_BURST_COUNT,
  MAX_BURST_PARTICLES,
  shareOut,
  stepBurst,
} from './bursts';
import {PhysicsBox} from './platformPhysics';
import {
  createWeather,
  drawWeather,
  isWeatherKind,
  stepWeather,
  Weather,
  WeatherCanvas,
  WeatherKind,
  WeatherScene,
} from './weather';

const IMAGE_URLS: Record<BurstShape, string> = {spark: sparkUrl};

/** A loaded image: its size and the canvas holding its pixels. */
export interface ParticleImage {
  width: number;
  height: number;
  canvas: CanvasImageSource;
}

/** The p5 calls the layer needs beyond drawing. */
export interface ParticleCanvas extends BurstCanvas, WeatherCanvas {
  frameCount: number;
  loadImage(url: string, done: (image: ParticleImage) => void): void;
  createImage(
    width: number,
    height: number
  ): {drawingContext: CanvasRenderingContext2D};
}

type Color = [number, number, number];

export class ParticleLayer {
  private bursts: Burst[] = [];
  // The run's weather kind, set by the set-weather block, and its live
  // pool, built at the first paint after the kind changes.
  private weatherKind: WeatherKind = 'none';
  private weather: Weather | null = null;
  // Loaded on the first burst, with a copy per palette colour.
  private images: Record<BurstShape, ParticleImage | null> | null = null;
  private tinted = new Map<string, unknown>();
  // The frame the particles last stepped in: a thumbnail capture paints
  // twice in one frame, and the particles must move once.
  private steppedFrame = -1;

  /** A fresh run: no weather, nothing in flight. Images are kept. */
  reset(): void {
    this.bursts = [];
    this.weatherKind = 'none';
    this.weather = null;
  }

  /** The set-weather block: the scene's weather from now until the next
      set or the end of the run. */
  setWeather(kind: unknown): void {
    this.weatherKind = isWeatherKind(kind) ? kind : 'none';
    this.weather = null;
  }

  /**
   * The burst block: `count` particles of a look from each sprite, the count
   * shared among them; from the stage centre when there are none. Capped so
   * a block in a loop cannot flood the scene.
   */
  burst(
    p5: ParticleCanvas,
    look: unknown,
    count: number,
    sprites: PhysicsBox[],
    view: BurstScene
  ): void {
    this.loadImages(p5);
    const kind = isBurstLook(look) ? look : 'sparks';
    const origins = sprites.map(sprite =>
      burstOrigin(kind, sprite, view.gravity)
    );
    if (!origins.length) {
      origins.push({x: view.width / 2, y: view.height / 2});
    }
    const inFlight = this.bursts.reduce((n, b) => n + b.particles.length, 0);
    const wanted = Math.min(MAX_BURST_COUNT, Math.max(1, Number(count) || 0));
    const allowed = Math.min(wanted, MAX_BURST_PARTICLES - inFlight);
    shareOut(allowed, origins.length).forEach((each, i) => {
      if (each > 0) {
        this.bursts.push(createBurst(kind, each, origins[i], view.gravity));
      }
    });
  }

  /**
   * One frame, inside the paint after the sprites so the particles sit in
   * world space under the camera. `sceneFor` says what the weather lands
   * on, and is asked only while weather is on.
   */
  stepAndDraw(
    p5: ParticleCanvas,
    view: BurstScene,
    sceneFor: (view: BurstScene) => WeatherScene
  ): void {
    const weatherOn = this.weatherKind !== 'none' || !!this.weather;
    if (!weatherOn && !this.bursts.length) {
      return;
    }
    const step = this.steppedFrame !== p5.frameCount;
    this.steppedFrame = p5.frameCount;
    if (weatherOn) {
      const scene = sceneFor(view);
      if (!this.weather || this.weather.kind !== this.weatherKind) {
        this.weather = createWeather(this.weatherKind, scene);
      }
      if (step) {
        stepWeather(this.weather, scene);
      }
      drawWeather(p5, this.weather);
    }
    if (step) {
      this.bursts = this.bursts.filter(burst => stepBurst(burst, view));
    }
    drawBursts(p5, this.bursts, (shape, color) =>
      this.imageFor(p5, shape, color)
    );
  }

  private loadImages(p5: ParticleCanvas): void {
    if (this.images) {
      return;
    }
    const images: Record<BurstShape, ParticleImage | null> = {spark: null};
    this.images = images;
    for (const shape of Object.keys(IMAGE_URLS) as BurstShape[]) {
      p5.loadImage(IMAGE_URLS[shape], image => (images[shape] = image));
    }
  }

  // An image in one colour, made once per colour: this p5 recolours an
  // image by rebuilding a canvas on every draw, too slow per particle. A
  // p5.Image, not a p5.Graphics: a graphics canvas is scaled by the pixel
  // density while image() reads it at its logical size, showing one corner.
  private imageFor(
    p5: ParticleCanvas,
    shape: BurstShape,
    color: Color
  ): unknown {
    const image = this.images?.[shape];
    if (!image) {
      return undefined;
    }
    const key = `${shape}:${color.join(',')}`;
    let tinted = this.tinted.get(key);
    if (!tinted) {
      tinted = p5.createImage(image.width, image.height);
      const context = (tinted as {drawingContext: CanvasRenderingContext2D})
        .drawingContext;
      // The image is white, so the colour is the whole tint; it keeps only
      // its own alpha.
      context.fillStyle = `rgb(${color.join(',')})`;
      context.fillRect(0, 0, image.width, image.height);
      context.globalCompositeOperation = 'destination-in';
      context.drawImage(image.canvas, 0, 0);
      this.tinted.set(key, tinted);
    }
    return tinted;
  }
}
