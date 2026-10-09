import {
  MAX_BURST_COUNT,
  MAX_BURST_PARTICLES,
} from '@cdo/apps/p5lab/spritelab/lab2/bursts';
import {
  ParticleCanvas,
  ParticleLayer,
} from '@cdo/apps/p5lab/spritelab/lab2/particles';
import {PLATFORM_GRAVITY} from '@cdo/apps/p5lab/spritelab/lab2/platformPhysics';

const VIEW = {width: 400, height: 400, gravity: PLATFORM_GRAVITY};
const sceneFor = jest.fn((view: typeof VIEW) => ({
  ...view,
  walls: [],
  bodies: [],
}));

// A p5 that records what is drawn and loads images at once.
function fakeCanvas() {
  const calls: string[] = [];
  const contexts: Array<Record<string, unknown>> = [];
  const canvas = new Proxy(
    {
      CENTER: 'center',
      frameCount: 1,
      drawingContext: {globalAlpha: 1},
      loadImage: (url: unknown, done: (image: unknown) => void) => {
        calls.push('load');
        done({width: 32, height: 32, canvas: {}});
      },
      createImage: () => {
        const ops: string[] = [];
        const context = {
          fillRect: () => ops.push('fillRect'),
          drawImage: () => ops.push('drawImage'),
          set fillStyle(v: string) {
            ops.push(`fill:${v}`);
          },
          set globalCompositeOperation(v: string) {
            ops.push(`op:${v}`);
          },
        };
        contexts.push({ops});
        return {drawingContext: context};
      },
    },
    {
      get: (t, name: string) => {
        if (name in t) {
          return (t as Record<string, unknown>)[name];
        }
        return (...args: unknown[]) => {
          calls.push(
            name === 'translate' ? `translate@${args[0]},${args[1]}` : name
          );
        };
      },
    }
  ) as unknown as ParticleCanvas & {frameCount: number};
  return {canvas, calls, contexts};
}

const sprite = (x: number, y: number) => ({
  position: {x, y},
  width: 40,
  height: 40,
  scale: 1,
});

describe('ParticleLayer', () => {
  beforeEach(() => sceneFor.mockClear());

  it('draws nothing while there is no weather and nothing in flight', () => {
    const {canvas, calls} = fakeCanvas();
    new ParticleLayer().stepAndDraw(canvas, VIEW, sceneFor);
    expect(calls).toEqual([]);
    expect(sceneFor).not.toHaveBeenCalled();
  });

  it('shares a burst across the sprites, from the stage centre with none, and caps the count', () => {
    const {canvas, calls} = fakeCanvas();
    const layer = new ParticleLayer();
    layer.burst(canvas, 'sparks', 7, [sprite(10, 10), sprite(90, 90)], VIEW);
    // One image per shape, loaded once.
    expect(calls.filter(c => c === 'load')).toHaveLength(2);
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    expect(calls.filter(c => c === 'image')).toHaveLength(7);
    calls.length = 0;
    layer.burst(canvas, 'confetti', MAX_BURST_COUNT * 2, [], VIEW);
    layer.burst(canvas, 'nonsense', 1000, [], VIEW);
    canvas.frameCount++;
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    // The first burst still in flight, plus the capped ones, never past
    // the ceiling; the images were loaded once.
    expect(
      calls.filter(c => c === 'rect' || c === 'image').length
    ).toBeLessThanOrEqual(MAX_BURST_PARTICLES);
    expect(calls.filter(c => c === 'load')).toEqual([]);
  });

  it('tints each image once per colour', () => {
    const {canvas, contexts} = fakeCanvas();
    const layer = new ParticleLayer();
    layer.burst(canvas, 'sparks', 20, [sprite(50, 50)], VIEW);
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    canvas.frameCount++;
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    // The spark palette has four colours.
    expect(contexts.length).toBeLessThanOrEqual(4);
    expect(contexts[0].ops).toEqual([
      expect.stringMatching(/^fill:rgb\(/),
      'fillRect',
      'op:destination-in',
      'drawImage',
    ]);
  });

  it('steps once per frame however often it is drawn', () => {
    const {canvas, calls} = fakeCanvas();
    const layer = new ParticleLayer();
    layer.burst(canvas, 'sparks', 3, [sprite(50, 50)], VIEW);
    const positions = () => calls.filter(c => c.startsWith('translate@'));
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    const first = positions();
    expect(first).toHaveLength(3);
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    expect(positions().slice(3)).toEqual(first);
    canvas.frameCount++;
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    expect(positions().slice(6)).not.toEqual(first);
  });

  it('builds the weather at the next paint and asks for the scene only while it is on', () => {
    const {canvas, calls} = fakeCanvas();
    const layer = new ParticleLayer();
    layer.setWeather('rain');
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    expect(sceneFor).toHaveBeenCalledTimes(1);
    expect(calls.filter(c => c === 'line').length).toBeGreaterThan(0);
    layer.setWeather('none');
    calls.length = 0;
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    expect(calls).toEqual([]);
    expect(sceneFor).toHaveBeenCalledTimes(1);
  });

  it('a reset clears the weather and the bursts', () => {
    const {canvas, calls} = fakeCanvas();
    const layer = new ParticleLayer();
    layer.setWeather('snow');
    layer.burst(canvas, 'sparks', 5, [sprite(50, 50)], VIEW);
    layer.reset();
    layer.stepAndDraw(canvas, VIEW, sceneFor);
    expect(calls.filter(c => c !== 'load')).toEqual([]);
  });
});
