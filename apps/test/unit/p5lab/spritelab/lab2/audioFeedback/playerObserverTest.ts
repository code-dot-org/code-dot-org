import {PlayerHeight} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/heightTone';
import {
  createPlayerObserver,
  ObservedFrame,
  PlayerObserverListeners,
} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/playerObserver';
import {PlayerSoundEvent} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/playerSounds';
import {ProximityDistances} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/proximityAudio';
import {
  PhysicsBox,
  PhysicsSprite,
  PLATFORM_GRAVITY,
} from '@cdo/apps/p5lab/spritelab/lab2/platformPhysics';

// The lab's real geometry: 400x400 view, 50px grid, 25x50 art at scale 1
// standing on the floor at y=375 (see platformPhysicsTest).
const VIEW = {width: 400, height: 400};
const FLOOR_Y = 375;

const makeSprite = (x: number, y: number): PhysicsSprite => ({
  position: {x, y},
  velocity: {x: 0, y: 0},
  width: 25,
  height: 50,
  scale: 1,
});

const wallAt = (col: number, row: number): PhysicsBox => ({
  position: {x: col * 50 + 25, y: row * 50 + 25},
  width: 50,
  height: 50,
  scale: 1,
});

function frame(
  sprite: PhysicsSprite,
  over: Partial<ObservedFrame> = {}
): ObservedFrame {
  return {
    sprite,
    requestedX: sprite.position.x,
    requestedY: sprite.position.y,
    gravity: PLATFORM_GRAVITY,
    walls: [],
    view: VIEW,
    ...over,
  };
}

function setup(which: (keyof PlayerObserverListeners)[]) {
  const sounds: PlayerSoundEvent[] = [];
  const heights: PlayerHeight[] = [];
  const proximities: ProximityDistances[] = [];
  const listeners: PlayerObserverListeners = {};
  if (which.includes('onSound')) {
    listeners.onSound = event => sounds.push(event);
  }
  if (which.includes('onHeight')) {
    listeners.onHeight = height => heights.push(height);
  }
  if (which.includes('onProximity')) {
    listeners.onProximity = distances => proximities.push(distances);
  }
  return {
    observer: createPlayerObserver(listeners),
    sounds,
    heights,
    proximities,
  };
}

describe('SpriteLab2 playerObserver', () => {
  it('sounds nothing on the first frame, then a step for a walk', () => {
    const {observer, sounds} = setup(['onSound']);
    observer.observe(frame(makeSprite(100, FLOOR_Y)));
    expect(sounds).toEqual([]);
    observer.observe(frame(makeSprite(120, FLOOR_Y)));
    expect(sounds).toEqual(['step']);
  });

  it('sounds a bump when the walls refuse a requested move', () => {
    const {observer, sounds} = setup(['onSound']);
    const sprite = makeSprite(100, FLOOR_Y);
    observer.observe(frame(sprite));
    // Asked to move right, went nowhere.
    observer.observe(frame(sprite, {requestedX: 105}));
    expect(sounds).toEqual(['blocked']);
  });

  it.each([
    {way: 'up', requestedY: 195},
    {way: 'down', requestedY: 205},
  ])('sounds a bump for a refused weightless move $way', ({requestedY}) => {
    const {observer, sounds} = setup(['onSound']);
    const sprite = makeSprite(100, 200);
    observer.observe(frame(sprite, {gravity: 0}));
    observer.observe(frame(sprite, {gravity: 0, requestedY}));
    expect(sounds).toEqual(['blocked']);
  });

  it('is quiet for a weightless move that went where it asked', () => {
    const {observer, sounds} = setup(['onSound']);
    observer.observe(frame(makeSprite(100, 200), {gravity: 0}));
    observer.observe(
      frame(makeSprite(100, 195), {gravity: 0, requestedY: 195})
    );
    expect(sounds).toEqual([]);
  });

  it('measures height from the feet, and airborne off the ground', () => {
    const {observer, heights} = setup(['onHeight']);
    observer.observe(frame(makeSprite(100, FLOOR_Y)));
    expect(heights[0]).toEqual({above: 0, airborne: false});
    observer.observe(frame(makeSprite(100, 200)));
    expect(heights[1].airborne).toBe(true);
    expect(heights[1].above).toBeCloseTo((400 - 225) / 400);
  });

  it('reports the wall ahead in the direction faced', () => {
    const {observer, proximities} = setup(['onProximity']);
    const walls = [wallAt(4, 7)];
    // Right of the sprite; facing right by default.
    observer.observe(frame(makeSprite(100, FLOOR_Y), {walls}));
    expect(proximities[0].wall).toBeLessThan(Infinity);
    expect(proximities[0].edge).toBe(Infinity);
  });

  it('skips the work behind an absent listener', () => {
    const {observer, sounds, heights, proximities} = setup(['onSound']);
    observer.observe(frame(makeSprite(100, FLOOR_Y)));
    observer.observe(frame(makeSprite(120, FLOOR_Y)));
    expect(sounds).toHaveLength(1);
    expect(heights).toEqual([]);
    expect(proximities).toEqual([]);
  });

  it('quiets the held tones once when the player is forgotten', () => {
    const {observer, heights, proximities} = setup(['onHeight', 'onProximity']);
    observer.observe(frame(makeSprite(100, 200)));
    observer.forget();
    observer.forget();
    expect(heights).toHaveLength(2);
    expect(heights[1]).toEqual({above: 0, airborne: false});
    expect(proximities[1]).toEqual({wall: Infinity, edge: Infinity});
  });

  it('starts a new run from a position, not a stride', () => {
    const {observer, sounds} = setup(['onSound']);
    observer.observe(frame(makeSprite(100, FLOOR_Y)));
    observer.forget();
    observer.observe(frame(makeSprite(300, FLOOR_Y)));
    expect(sounds).toEqual([]);
  });
});
